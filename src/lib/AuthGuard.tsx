"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import posthog from "posthog-js"; // Assuming posthog is initialized globally elsewhere

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isCheckingDormitory, setIsCheckingDormitory] = useState(true);
  const checkedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const checkAuthAndDormitory = async () => {
      // Log the initial state of AuthGuard's checks
      console.log("AuthGuard: Running checkAuthAndDormitory. Auth Loading:", authLoading, "User ID:", user?.id);

      if (authLoading) {
        // If the authentication process from useAuth is still loading,
        // keep `isCheckingDormitory` true to ensure the overall loading spinner is shown.
        setIsCheckingDormitory(true);
        console.log("AuthGuard: Auth is loading, showing loading state.");
        return; // Exit and re-run effect when authLoading changes
      }

      // Case 1: No user is authenticated after authentication has finished loading.
      if (!user) {
        console.log("AuthGuard: No user found after auth loaded, redirecting to /auth.");
        router.push("/auth"); // Redirect to the authentication page
        setIsCheckingDormitory(false); // Turn off internal loading as a redirect action is being taken
        checkedUserIdRef.current = null; // Reset the ref since no user is logged in
        return;
      }

      // Case 2: A user is authenticated. Now, check if their dormitory ID has been verified
      // for this session to prevent redundant Supabase calls.
      if (user.id !== checkedUserIdRef.current) {
        console.log("AuthGuard: User present, checking dormitory ID for user:", user.id);
        setIsCheckingDormitory(true); // Indicate that the dormitory check is in progress

        try {
          // Query the user's dormitory_id from Supabase.
          const { data: userData, error: userError } = await supabase
            .from("user")
            .select("dormitory_id")
            .eq("id", user.id)
            .single(); // Expecting a single user record

          if (userError) {
            // Log any errors encountered while fetching user data.
            // This might happen if the user exists in auth but not yet in the 'user' table.
            console.error(
              "AuthGuard: Error fetching user data from 'user' table:",
              userError.message
            );
            console.log("AuthGuard: Redirecting to /profile-set due to fetch error.");
            router.push(`/profile-set/${user.id}`); // Redirect to profile setup
          } else {
            // User is authenticated. All checks passed.
            console.log("AuthGuard: User authenticated. Allowing access.");
            checkedUserIdRef.current = user.id; // Store this user's ID to avoid re-checking

            // Identify the user with PostHog (assuming PostHog is globally initialized)
            posthog.identify(user.id);
            console.log("AuthGuard: PostHog identify called for user:", user.id);
          }
        } catch (error) {
          // Catch any unexpected runtime errors that might occur during the Supabase call.
          console.error(
            "AuthGuard: Unexpected error during dormitory_id check in AuthGuard:",
            error
          );
          console.log("AuthGuard: Redirecting to /profile-set due to unexpected error.");
          router.push(`/profile-set/${user.id}`); // Redirect to profile setup as a fallback
        } finally {
          // Ensure `isCheckingDormitory` is always set to false after the check
          // completes, whether successfully or with an error/redirect.
          setIsCheckingDormitory(false);
          console.log("AuthGuard: Dormitory check finished, isCheckingDormitory set to false.");
        }
      } else {
        // User is present, and their dormitory_id has already been successfully checked
        // during this session (e.g., navigating between protected routes).
        console.log("AuthGuard: User already checked, no dormitory check needed.");
        setIsCheckingDormitory(false); // No check needed, so turn off internal loading
      }
    };

    checkAuthAndDormitory();
  }, [user, authLoading, router]); // Dependencies: Re-run effect when user, authLoading, or router object changes

  // Auto-refresh functionality for stuck authentication
  const [isStuck, setIsStuck] = useState(false);
  const [autoRefreshState, setAutoRefreshState] = useState<'idle' | 'soft' | 'auth' | 'hard'>('idle');
  const stuckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-detect if user is stuck in auth checking
  useEffect(() => {
    if (authLoading || isCheckingDormitory) {
      // Start timeout to detect if user is stuck
      stuckTimeoutRef.current = setTimeout(() => {
        console.log("AuthGuard: User appears stuck in auth checking, starting auto-refresh...");
        setIsStuck(true);
        startAutoRefresh();
      }, 10000); // 10 seconds timeout
    } else {
      // Clear timeout if auth completes normally
      if (stuckTimeoutRef.current) {
        clearTimeout(stuckTimeoutRef.current);
        stuckTimeoutRef.current = null;
      }
      setIsStuck(false);
      setAutoRefreshState('idle');
    }

    return () => {
      if (stuckTimeoutRef.current) {
        clearTimeout(stuckTimeoutRef.current);
        stuckTimeoutRef.current = null;
      }
    };
  }, [authLoading, isCheckingDormitory]);

  const startAutoRefresh = async () => {
    console.log("AuthGuard: Starting automatic progressive refresh...");
    
    // Step 1: Soft refresh (re-authenticate)
    setAutoRefreshState('soft');
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        console.log("AuthGuard: Attempting soft refresh - re-authentication...");
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data.session) {
          console.log("AuthGuard: Soft refresh successful");
          setAutoRefreshState('idle');
          setIsStuck(false);
          return;
        }
      } catch (error) {
        console.error("AuthGuard: Soft refresh failed:", error);
      }

      // Step 2: Auth refresh
      setAutoRefreshState('auth');
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          console.log("AuthGuard: Attempting auth refresh...");
          const { error } = await supabase.auth.refreshSession();
          if (error) throw error;
          
          console.log("AuthGuard: Auth refresh successful");
          setAutoRefreshState('idle');
          setIsStuck(false);
          return;
        } catch (error) {
          console.error("AuthGuard: Auth refresh failed:", error);
        }

        // Step 3: Hard refresh
        setAutoRefreshState('hard');
        refreshTimeoutRef.current = setTimeout(() => {
          console.log("AuthGuard: Performing hard refresh...");
          window.location.reload();
        }, 2000);
      }, 3000);
    }, 3000);
  };

  const handleEmergencyRefresh = () => {
    console.log("AuthGuard: Emergency refresh triggered...");
    if (stuckTimeoutRef.current) {
      clearTimeout(stuckTimeoutRef.current);
      stuckTimeoutRef.current = null;
    }
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    window.location.reload();
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (stuckTimeoutRef.current) {
        clearTimeout(stuckTimeoutRef.current);
        stuckTimeoutRef.current = null;
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, []);

  // Render a loading spinner if authentication is in progress or if the dormitory check is ongoing.
  if (authLoading || isCheckingDormitory) {
    console.log("AuthGuard: Rendering loading spinner (authLoading:", authLoading, "isCheckingDormitory:", isCheckingDormitory, ")");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A4A7AE] mb-6">
            {autoRefreshState === 'idle' ? 'Checking authentication...' :
             autoRefreshState === 'soft' ? 'Reconnecting...' :
             autoRefreshState === 'auth' ? 'Refreshing session...' :
             'Reloading page...'}
          </p>
          
          {/* Emergency refresh button - only show if stuck and auto-refresh is active */}
          {isStuck && autoRefreshState !== 'idle' && (
            <button
              onClick={handleEmergencyRefresh}
              className="text-sm text-[#245b7b] hover:text-[#1e4a63] underline transition-colors duration-200"
            >
              Refresh now
            </button>
          )}
        </div>
      </div>
    );
  }

  // If all checks pass (user authenticated and dormitory_id confirmed), render children.
  console.log("AuthGuard: All checks passed, rendering children.");
  return <>{children}</>;
}
