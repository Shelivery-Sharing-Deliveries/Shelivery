/**
 * useAuth.ts
 *
 * Thin wrapper around AuthProvider context + direct Supabase actions.
 * All auth STATE (session, user, profile) comes from the cached AuthProvider —
 * no redundant Supabase network calls on every hook usage.
 *
 * Auth ACTIONS (signIn, signUp, signOut, checkUserExists) still call Supabase
 * directly since they are intentional user-initiated network operations.
 */

import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/providers/AuthProvider";

export function useAuth() {
  const { user, session, profile, loading, signOut: contextSignOut, refreshProfile } = useAuthContext();
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = useCallback(async (email: string, password: string, invitationCode?: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { invitation_code: invitationCode } },
      });
      if (err) throw err;
      setActionLoading(false);
      return { data, error: null };
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
      return { data: null, error: err.message };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      // Profile fetch is triggered automatically by AuthProvider onAuthStateChange
      setActionLoading(false);
      return { data, error: null };
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
      return { data: null, error: err.message };
    }
  }, []);

  const signOut = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      await contextSignOut();
      setActionLoading(false);
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
      return { error: err.message };
    }
  }, [contextSignOut]);

  const checkUserExists = useCallback(async (email: string): Promise<boolean> => {
    setActionLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.rpc('check_user_exists', { p_email: email });
      if (err) throw err;
      setActionLoading(false);
      return data as boolean;
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
      return false;
    }
  }, []);

  return {
    // ── State from cache (no network call) ──────────────────────────────────
    user,
    session,
    profile,
    loading: loading || actionLoading,
    error,
    // ── Actions ─────────────────────────────────────────────────────────────
    signUp,
    signIn,
    signOut,
    checkUserExists,
    refreshProfile,
  };
}
