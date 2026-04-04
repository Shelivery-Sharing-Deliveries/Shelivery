/**
 * userStore.ts
 *
 * Zustand store backed by MMKV for user profile caching.
 * - Synchronous reads from MMKV on app start (no loading flash)
 * - 24-hour TTL with stale-while-revalidate pattern
 * - Cleared on sign-out
 */

import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';

// ─── MMKV instance ────────────────────────────────────────────────────────────

export const storage = createMMKV({ id: 'shelivery-user-store' });

// ─── TTL ──────────────────────────────────────────────────────────────────────

const USER_PROFILE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY = 'user_profile_cache';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  dormitory: string;
  favoriteStore: string;
  address: string;
  lat: number | null;
  lng: number | null;
  preferedKm: number;
}

interface UserCacheEntry {
  profile: UserProfile;
  cachedAt: number; // Unix timestamp ms
}

interface UserStoreState {
  profile: UserProfile | null;
  isStale: boolean;
  /** Load profile from MMKV cache into memory (call once on app start) */
  hydrateFromCache: () => void;
  /** Set profile in memory AND persist to MMKV */
  setProfile: (profile: UserProfile) => void;
  /** Update partial profile fields */
  updateProfile: (partial: Partial<UserProfile>) => void;
  /** Clear profile (on sign-out) */
  clearProfile: () => void;
  /** Check if cache is expired */
  isCacheExpired: () => boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserStoreState>((set, get) => ({
  profile: null,
  isStale: false,

  hydrateFromCache: () => {
    try {
      const raw = storage.getString(STORAGE_KEY);
      if (!raw) return;

      const entry: UserCacheEntry = JSON.parse(raw);
      const age = Date.now() - entry.cachedAt;
      const expired = age > USER_PROFILE_TTL_MS;

      set({
        profile: entry.profile,
        isStale: expired,
      });
    } catch {
      // Corrupted cache — clear it
      storage.remove(STORAGE_KEY);
    }
  },

  setProfile: (profile: UserProfile) => {
    const entry: UserCacheEntry = { profile, cachedAt: Date.now() };
    storage.set(STORAGE_KEY, JSON.stringify(entry));
    set({ profile, isStale: false });
  },

  updateProfile: (partial: Partial<UserProfile>) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, ...partial };
    const entry: UserCacheEntry = { profile: updated, cachedAt: Date.now() };
    storage.set(STORAGE_KEY, JSON.stringify(entry));
    set({ profile: updated, isStale: false });
  },

  clearProfile: () => {
    storage.remove(STORAGE_KEY);
    set({ profile: null, isStale: false });
  },

  isCacheExpired: () => {
    try {
      const raw = storage.getString(STORAGE_KEY);
      if (!raw) return true;
      const entry: UserCacheEntry = JSON.parse(raw);
      return Date.now() - entry.cachedAt > USER_PROFILE_TTL_MS;
    } catch {
      return true;
    }
  },
}));
