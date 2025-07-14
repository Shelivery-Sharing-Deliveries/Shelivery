// lib/AuthGuard.tsx
"use client"; // This component needs to run on the client side to use React hooks

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth is in this path
import { supabase } from '@/lib/supabase'; // Import supabase client

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading: authLoading } = useAuth(); // Get user and auth loading state from your hook
    const router = useRouter();
    const [isCheckingDormitory, setIsCheckingDormitory] = useState(true); // State for dormitory check

    useEffect(() => {
        const checkAuthAndDormitory = async () => {
            // Step 1: Wait for authentication state to settle
            if (authLoading) {
                setIsCheckingDormitory(true); // Keep loading if auth is still determining user
                return;
            }

            // Step 2: If no user, redirect to login
            if (!user) {
                console.log("No user found. Redirecting to /auth.");
                router.push('/auth');
                return; // Stop further execution
            }

            // Step 3: User is authenticated, now check dormitory_id
            if (user && user.id) {
                setIsCheckingDormitory(true); // Start loading for dormitory ID check
                try {
                    const { data: userData, error: userError } = await supabase
                        .from("user")
                        .select("dormitory_id")
                        .eq("id", user.id)
                        .single();

                    if (userError) {
                        console.error("Error fetching dormitory_id in AuthGuard:", userError);
                        // If an error occurs, assume they need to set it up.
                        router.push(`/profile-set/${user.id}`);
                        return;
                    }

                    const dormitoryId = userData?.dormitory_id;

                    if (dormitoryId === null || dormitoryId === undefined) {
                        console.log("Dormitory ID is null/undefined. Redirecting to profile-set.");
                        router.push(`/profile-set/${user.id}`);
                    } else {
                        console.log("User authenticated and dormitory ID exists. Allowing access.");
                        // Do nothing, allow children to render
                    }
                } catch (error) {
                    console.error("Unexpected error during dormitory_id check in AuthGuard:", error);
                    router.push(`/profile-set/${user.id}`); // Fallback in case of unexpected errors
                } finally {
                    setIsCheckingDormitory(false); // Done checking dormitory
                }
            }
        };

        checkAuthAndDormitory();
    }, [user, authLoading, router]); // Re-run when user or authLoading changes

    // Display a loading spinner while authentication and dormitory ID are being checked
    if (authLoading || isCheckingDormitory) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#A4A7AE]">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // If we reach here, it means the user is authenticated and has a dormitory_id.
    // Or, if not authenticated, the redirect already happened.
    // So, we can safely render the children.
    return <>{children}</>;
}