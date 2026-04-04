/**
 * AuthProvider.tsx
 *
 * App-level provider that:
 * 1. Hydrates the user profile store from MMKV cache synchronously on mount
 * 2. Listens to Supabase auth state changes
 * 3. Fetches the user profile row from Supabase when:
 *    - User signs in for the first time
 *    - Cached profile is stale (> 24 hours)
 * 4. Exposes auth state + profile to all children via React context
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useUserStore, UserProfile } from '@/store/userStore';

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Supabase session (null = signed out) */
  session: Session | null;
  /** Supabase user object */
  user: User | null;
  /** Cached user profile (available even offline) */
  profile: UserProfile | null;
  /** True only on very first app open before session is known */
  loading: boolean;
  /** Force-refresh profile from Supabase */
  refreshProfile: () => Promise<void>;
  /** Sign out and clear all caches */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function useAuthContext() {
  return useContext(AuthContext);
}

// ─── Helper: map Supabase row → UserProfile ───────────────────────────────────

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

function resolveImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && API_BASE_URL) return `${API_BASE_URL}${url}`;
  return url;
}

function mapRowToProfile(row: any, user: User): UserProfile {
  return {
    id: user.id,
    email: user.email ?? '',
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    imageUrl: resolveImageUrl(row.image),
    dormitory: Array.isArray(row.dormitory)
      ? (row.dormitory[0]?.name ?? '')
      : (row.dormitory?.name ?? ''),
    favoriteStore: row.favorite_store ?? '',
    address: row.address ?? '',
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    preferedKm: row.prefered_km ?? 5,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { profile, hydrateFromCache, setProfile, clearProfile, isCacheExpired } = useUserStore();

  const isFetchingProfile = useRef(false);

  // ── Fetch profile from Supabase ──────────────────────────────────────────

  const fetchAndCacheProfile = useCallback(async (currentUser: User) => {
    if (isFetchingProfile.current) return;
    isFetchingProfile.current = true;

    try {
      const { data, error } = await supabase
        .from('user')
        .select(
          'first_name, last_name, email, favorite_store, dormitory(name), image, address, lat, lng, prefered_km'
        )
        .eq('id', currentUser.id)
        .single();

      if (!error && data) {
        setProfile(mapRowToProfile(data, currentUser));
      }
    } catch {
      // Network error — silently keep stale cache
    } finally {
      isFetchingProfile.current = false;
    }
  }, [setProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchAndCacheProfile(user);
  }, [user, fetchAndCacheProfile]);

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  useEffect(() => {
    // 1. Hydrate profile store synchronously from MMKV (instant — no network)
    hydrateFromCache();

    // 2. Get initial session from AsyncStorage (Supabase persists it there)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      // 3. If logged in and cache is stale/missing, fetch profile in background
      if (s?.user && isCacheExpired()) {
        fetchAndCacheProfile(s.user);
      }
    });

    // 4. Listen for auth events (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && s?.user) {
          // Always fetch profile fresh on sign-in
          await fetchAndCacheProfile(s.user);
        }

        if (event === 'SIGNED_OUT') {
          clearProfile();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign out ──────────────────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // clearProfile is handled by onAuthStateChange 'SIGNED_OUT' event
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
