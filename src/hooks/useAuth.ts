"use client";

import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        session: null,
        loading: true,
    });

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error getting session:", error);
            }
            setState({
                user: session?.user || null,
                session,
                loading: false,
            });
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setState({
                    user: session?.user || null,
                    session,
                    loading: false,
                });

                // Handle user profile creation on sign in (covers both signup and signin)
                if (event === "SIGNED_IN" && session?.user) {
                    await handleUserProfileCreation(session.user);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const handleUserProfileCreation = async (user: User) => {
        try {
            // The user profile creation is handled by the database trigger
            // on auth.users insert, but we can track the event here
            await supabase.rpc("track_event", {
                event_type_param: "user_signin",
                metadata_param: { user_id: user.id },
            });
        } catch (error) {
            console.error("Error tracking signin event:", error);
        }
    };

    const signUp = async (email: string, password: string, invitationCode?: string) => {
        try {
            // Invitation code validation is now handled in AuthPage.handleInviteCodeSubmit.
            // We just pass the invitation_code as metadata to Supabase here.
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        invitation_code: invitationCode,
                    },
                },
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Track sign in event
            if (data.user) {
                await supabase.rpc("track_event", {
                    event_type_param: "user_signin",
                    metadata_param: { user_id: data.user.id },
                });
            }

            return { data, error: null };
        } catch (error: any) {
            return { data: null, error: error.message };
        }
    };

    const signInWithOAuth = async (provider: 'google' | 'github' | 'discord', invitationCode?: string) => {
        try {
            // If invitation code provided, validate it first
            // This validation is still needed here as OAuth flow might not go through handleInviteCodeSubmit
            if (invitationCode) {
                const { data: isValid } = await supabase.rpc("validate_invitation", {
                    invitation_code_param: invitationCode,
                });

                if (!isValid) {
                    throw new Error("Invalid invitation code");
                }
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: invitationCode ? { invitation_code: invitationCode } : {},
                },
            });

            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            return { error: error.message };
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            return { error: error.message };
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            return { error: error.message };
        }
    };

    const updatePassword = async (password: string) => {
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            return { error: error.message };
        }
    };

    // NEW: Function to check if user exists by calling the RPC
    const checkUserExists = async (email: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase.rpc('check_user_exists', { p_email: email });
            if (error) {
                console.error("Error checking if user exists:", error);
                return false; // Or re-throw if you want to handle it higher up
            }
            return data as boolean; // The RPC returns a boolean
        } catch (error) {
            console.error("Unexpected error in checkUserExists:", error);
            return false;
        }
    };

    // CORRECTED: Ensure all returned functions are in a single return statement
    return {
        user: state.user,
        session: state.session,
        loading: state.loading,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        resetPassword,
        updatePassword,
        checkUserExists, // Expose the new function
    };
}
