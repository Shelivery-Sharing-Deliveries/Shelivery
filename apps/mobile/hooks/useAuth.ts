// hooks/useAuth.ts
import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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
                const { data: { session }, error } = await supabase.auth.getSession();
                if (!isMounted) return;

                if (error) {
                    setState(prevState => ({ ...prevState, user: null, session: null, loading: false, error: error.message }));
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
                setState(prevState => ({ ...prevState, loading: false, error: err.message }));
            }
        };

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!isMounted) return;
                setState({
                    user: session?.user || null,
                    session,
                    loading: false,
                    error: null,
                });
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signUp = useCallback(async (email: string, password: string, invitationCode?: string) => {
        setState(prevState => ({ ...prevState, loading: true, error: null }));
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { invitation_code: invitationCode } },
            });

            if (error) throw error;
            setState(prevState => ({ ...prevState, loading: false, error: null }));
            return { data, error: null };
        } catch (error: any) {
            setState(prevState => ({ ...prevState, loading: false, error: error.message }));
            return { data: null, error: error.message };
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        setState(prevState => ({ ...prevState, loading: true, error: null }));
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            setState(prevState => ({ ...prevState, loading: false, error: null }));
            return { data, error: null };
        } catch (error: any) {
            setState(prevState => ({ ...prevState, loading: false, error: error.message }));
            return { data: null, error: error.message };
        }
    }, []);

    const signOut = useCallback(async () => {
        setState(prevState => ({ ...prevState, loading: true, error: null }));
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setState({ user: null, session: null, loading: false, error: null });
            return { error: null };
        } catch (error: any) {
            setState(prevState => ({ ...prevState, loading: false, error: error.message }));
            return { error: error.message };
        }
    }, []);

    const checkUserExists = useCallback(async (email: string): Promise<boolean> => {
        setState(prevState => ({ ...prevState, loading: true, error: null }));
        try {
            const { data, error } = await supabase.rpc('check_user_exists', { p_email: email });
            if (error) throw error;
            setState(prevState => ({ ...prevState, loading: false, error: null }));
            return data as boolean;
        } catch (error: any) {
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
        signOut,
        checkUserExists,
    };
}
