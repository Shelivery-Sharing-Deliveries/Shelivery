// src/app/(auth)/auth/update-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Your Supabase client
import AuthLayout from "@/components/auth/AuthLayout"; // Your AuthLayout component
import TextField from "@/components/auth/TextField";   // Your TextField component
import AuthButton from "@/components/auth/AuthButton"; // Your AuthButton component

export default function UpdatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isTokenVerified, setIsTokenVerified] = useState(false); // To track if token is valid

  useEffect(() => {
    // This useEffect runs on page load to check if the user is in a valid
    // password recovery session. Supabase automatically processes the
    // `access_token` and `type=recovery` from the URL.
    const checkSession = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);

      try {
        // Attempt to get the user session. If the URL contains a valid
        // recovery token, Supabase will establish a temporary session.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error("Session error or no session:", sessionError);
          setError("Invalid or expired password reset link. Please request a new one.");
          setIsTokenVerified(false);
          // Redirect to login after a short delay if token is invalid
          setTimeout(() => router.push("/auth"), 3000);
          return;
        }

        // If a session is successfully established, it means the token was valid.
        setIsTokenVerified(true);
        setMessage("Please enter your new password.");
      } catch (err) {
        console.error("Unexpected error during session check:", err);
        setError("An unexpected error occurred. Please try again.");
        setIsTokenVerified(false);
        setTimeout(() => router.push("/auth"), 3000);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]); // Depend on router for push

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Update the user's password using the established session
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error("Password update error:", updateError);
        setError(updateError.message || "Failed to update password. Please try again.");
      } else {
        setMessage("Your password has been updated successfully! Redirecting to login...");
        // After successful update, redirect to login or dashboard
        setTimeout(() => {
          router.push("/auth"); // Or /dashboard if you want them logged in immediately
        }, 2000);
      }
    } catch (err: any) {
      console.error("Unexpected error during password update:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isTokenVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A4A7AE]">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (error && !isTokenVerified) {
    // Show error if token verification failed
    return (
      <AuthLayout>
        <div className="text-center text-red-600">
          <p>{error}</p>
          <p className="mt-2 text-sm text-gray-500">You will be redirected to the login page shortly.</p>
        </div>
      </AuthLayout>
    );
  }

  if (!isTokenVerified) {
    // This state should ideally not be reached if the above loading/error states are handled,
    // but acts as a fallback if token verification hasn't completed or failed silently.
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-[#A4A7AE]">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout className="gap-8">
      <div className="w-full flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-[#000000] font-inter text-[18px] font-bold leading-[21.78px]">
            Set New Password
          </h1>
          {message && !error && (
            <p className="text-green-600 text-sm font-medium mt-2">{message}</p>
          )}
          {error && (
            <p className="text-red-600 text-sm font-medium mt-2">{error}</p>
          )}
        </div>

        <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-6">
          <TextField
            label="New Password"
            placeholder="Enter your new password"
            value={password}
            onChange={setPassword}
            type="password"
            required
          />
          <TextField
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            type="password"
            required
          />

          <AuthButton type="submit" loading={loading}>
            Update Password
          </AuthButton>
        </form>
      </div>
    </AuthLayout>
  );
}
