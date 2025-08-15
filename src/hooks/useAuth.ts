// hooks/useAuth.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabaseAuthClient } from "@/lib/supabaseAuthClient"; // IMPORTANT: Changed import to use the auth-specific client

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        session: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let isMounted = true;

        const getInitialSession = async () => {
            try {
                // Use supabaseAuthClient for session management
                const { data: { session }, error } = await supabaseAuthClient.auth.getSession();

                if (!isMounted) {
                    return;
                }

                if (error) {
                    console.error("useAuth: getInitialSession - Error getting session:", error);
                    setState(prevState => ({
                        ...prevState,
                        user: null,
                        session: null,
                        loading: false,
                        error: error.message,
                    }));
                    return;
                }

                setState({
                    user: session?.user || null,
                    session,
                    loading: false,
                    error: null,
                });

            } catch (err: any) {
                if (!isMounted) return;
                console.error("useAuth: getInitialSession - Unexpected error:", err);
                setState(prevState => ({
                    ...prevState,
                    loading: false,
                    error: err.message || "An unexpected error occurred during session fetch.",
                }));
            }
        };

        getInitialSession();

        // Use supabaseAuthClient for authentication state changes listener
        const { data: { subscription } } = supabaseAuthClient.auth.onAuthStateChange(
            (event, session) => {
                if (!isMounted) {
                    return;
                }

                setState({
                    user: session?.user || null,
                    session,
                    loading: false,
                    error: null,
                });

                if (event === "SIGNED_IN" && session?.user) {
                    handleUserProfileCreation(session.user);
                }
            }
        );

        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && !state.loading) {
                try {
                    // Use supabaseAuthClient to refresh session
                    const { error } = await supabaseAuthClient.auth.refreshSession();
                    if (error) {
                        console.error("useAuth: Error refreshing session on tab visibility change:", error);
                        setState(prevState => ({ ...prevState, error: error.message }));
                    }
                } catch (refreshError: any) {
                    console.error("useAuth: Unexpected error during session refresh on tab visibility change:", refreshError);
                    setState(prevState => ({ ...prevState, error: refreshError.message || "Session refresh failed." }));
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleUserProfileCreation = useCallback(async (user: User) => {
        try {
            // If track_event is a Supabase function that doesn't need auth-helpers context,
            // you might choose to use the general 'supabase' client here instead for clarity.
            // However, using supabaseAuthClient is fine too.
            await supabaseAuthClient.rpc("track_event", {
                event_type_param: "user_signin",
                metadata_param: { user_id: user.id },
            });
        } catch (error) {
            console.error("useAuth: Error tracking signin event:", error);
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string, invitationCode?: string) => {
        setState(prevState => ({ ...prevState, loading: true, error: null }));
        try {
            // Use supabaseAuthClient for signUp
            const { data, error } = await supabaseAuthClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        invitation_code: invitationCode,
                    },
                },
            });

            if (error) throw error;
            setState(prevState => ({ ...prevState, loading: false, error: null }));
            return { data, error: null };
        } catch (error: any) {
            console.error("useAuth: Error during signUp:", error.message);
            setState(prevState => ({ ...prevState, loading: false, error: error.message }));
            return { data: null, error: error.message };
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        setState(prevState => ({ ...prevState, loading: true, error: null }));
        try {
            // Use supabaseAuthClient for signIn
            const { data, error } = await supabaseAuthClient.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                await handleUserProfileCreation(data.user);
            }

            setState(prevState => ({ ...prevState, loading: false, error: null }));
            return { data, error: null };
        } catch (error: any) {
            console.error("useAuth: Error during signIn:", error.message);
            setState(prevState => ({ ...prevState, loading: false, error: error.message }));
            return { data: null, error: error.message };
        }
    }, [handleUserProfileCreation]);

    const signInWithOAuth = useCallback(async (provider: 'google' | 'github' | 'discord', invitationCode?: string) => {
        setState(prevState => ({ ...prevState, loading: true, error: null }));
        try {
            if (invitationCode) {
                // Use supabaseAuthClient for RPC call
                const { data: isValid, error: validateError } = await supabaseAuthClient.rpc("validate_invitation", {
                    invitation_code_param: invitationCode,
                });

                if (validateError) throw validateError;
                if (!isValid) {
                    throw new Error("Invalid invitation code");
                }
            }

            // Use supabaseAuthClient for signInWithOAuth
            const { error } = await supabaseAuthClient.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: invitationCode ? { invitation_code: invitationCode } : {},
                },
            });

            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error("useAuth: Error during signInWithOAuth:", error.message);
            setState(prevState => ({ ...prevState, loading: false, error: error.message }));
            return { error: error.message };
        }
    }, []);

    const signOut = useCallback(async () => {
        setState(prevState => ({ ...prevState, loading: true, error: null }));
        try {
            // Use supabaseAuthClient for signOut
            const { error } = await supabaseAuthClient.auth.signOut();
            if (error) throw error;
            setState({ user: null, session: null, loading: false, error: null });
            return { error: null };
        } catch (error: any) {
            console.error("useAuth: Error during signOut:", error.message);
            setState(prevState => ({ ...prevState, loading: false, error: error.message }));
            return { error: error.message };
        }
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        setState(prevState => ({ ...prevState, loading: true, error: null }));
        try {
            // Use supabaseAuthClient for resetPasswordForEmail
            const { error } = await supabaseAuthClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw error;
            setState(prevState => ({ ...prevState, loading: false, error: null }));
            return { error: null };
        } catch (error: any) {
            console.error("useAuth: Error during resetPassword:", error.message);
            setState(prevState => ({ ...prevState, loading: false, error: error.message }));
            return { data: null, error: error.message };
        }
    }, []);

    const updatePassword = useCallback(async (password: string) => {
        setState(prevState => ({ ...prevState, loading: true, error: null }));
        try {
            // Use supabaseAuthClient for updateUser
            const { error } = await supabaseAuthClient.auth.updateUser({ password });
            if (error) throw error;
            setState(prevState => ({ ...prevState, loading: false, error: null }));
            return { error: null };
        } catch (error: any) {
            console.error("useAuth: Error during updatePassword:", error.message);
            setState(prevState => ({ ...prevState, loading: false, error: error.message }));
            return { data: null, error: error.message };
        }
    }, []);

    const checkUserExists = useCallback(async (email: string): Promise<boolean> => {
        setState(prevState => ({ ...prevState, loading: true, error: null }));
        try {
            // Use supabaseAuthClient for RPC call
            const { data, error } = await supabaseAuthClient.rpc('check_user_exists', { p_email: email });
            if (error) {
                console.error("useAuth: Error checking if user exists via RPC:", error);
                setState(prevState => ({ ...prevState, loading: false, error: error.message }));
                return false;
            }
            setState(prevState => ({ ...prevState, loading: false, error: null }));
            return data as boolean;
        } catch (error: any) {
            console.error("useAuth: Unexpected error in checkUserExists:", error);
            setState(prevState => ({ ...prevState, loading: false, error: error.message }));
            return false;
        }
    }, []);

    return {
        user: state.user,
        session: state.session,
        loading: state.loading,
        error: state.error,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        resetPassword,
        updatePassword,
        checkUserExists,
    };
}
