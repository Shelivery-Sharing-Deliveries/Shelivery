"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
          const { data, error } = await supabase.auth.exchangeCodeForSession();

        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
          return;
        }

        if (data.session?.user) {
          // Check if this is a new signup with invitation code
          const invitationCode = searchParams.get("invitation_code");

          if (invitationCode) {
            try {
              // Validate and use the invitation code for new OAuth users
              const { data: isValid } = await supabase.rpc(
                "validate_invitation",
                {
                  invitation_code_param: invitationCode,
                }
              );

              if (!isValid) {
                throw new Error("Invalid invitation code");
              }

              // Update user metadata with invitation code
              await supabase.auth.updateUser({
                data: { invitation_code: invitationCode },
              });
            } catch (inviteError: any) {
              console.error("Invitation validation error:", inviteError);
              setError(inviteError.message || "Invalid invitation code");
              return;
            }
          }

          // Track the OAuth sign in event
          await supabase.rpc("track_event", {
            event_type_param: "user_oauth_signin",
            metadata_param: {
              user_id: data.session.user.id,
              provider: data.session.user.app_metadata?.provider || "unknown",
            },
          });

          // Redirect to dashboard on successful authentication
          router.push("/dashboard");
        } else {
          // No session, redirect to auth page
          router.push("/auth");
        }
      } catch (err: any) {
        console.error("Callback handling error:", err);
        setError(err.message || "Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-shelivery-background-gray to-shelivery-primary-blue/10">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-shelivery-text-primary mb-2">
            Completing Sign In...
          </h2>
          <p className="text-shelivery-text-secondary">
            Please wait while we set up your account
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-shelivery-background-gray to-shelivery-primary-blue/10 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-shelivery-text-primary mb-2">
            Authentication Failed
          </h2>
          <p className="text-shelivery-text-secondary mb-6">{error}</p>
          <button
            onClick={() => router.push("/auth")}
            className="shelivery-button-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
