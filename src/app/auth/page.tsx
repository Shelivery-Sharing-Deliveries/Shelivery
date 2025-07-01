"use client";
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LoginForm,
  PasswordForm,
  InviteCodeForm,
  OTPVerificationForm,
} from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";

type AuthStep = "login" | "password" | "invite" | "otp" | "register";

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  const {
    user,
    loading: authLoading,
    signIn,
    signUp,
    signInWithOAuth,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for invitation code in URL
  useEffect(() => {
    const urlInviteCode = searchParams.get("invite");
    if (urlInviteCode) {
      setInviteCode(urlInviteCode);
      setStep("invite");
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleEmailSubmit = async (submittedEmail: string) => {
    setLoading(true);
    setError(null);
    setEmail(submittedEmail);

    try {
      // Check if user exists by attempting a test sign in
      const { error } = await signIn(submittedEmail, "temp_password");

      if (error && error.includes("Invalid login credentials")) {
        // User doesn't exist, go to invite code step
        setStep("invite");
      } else if (error && error.includes("Email not confirmed")) {
        // User exists but email not confirmed, go to password step
        setStep("password");
      } else if (error) {
        // User exists, go to password step
        setStep("password");
      } else {
        // User exists and signed in successfully (shouldn't happen with temp password)
        setStep("password");
      }
    } catch (err: any) {
      // Assume user exists and go to password step
      setStep("password");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError("Invalid password. Please try again.");
      } else {
        // Successfully signed in
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("login");
    setError(null);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithOAuth("google");
      if (error) {
        setError(error);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCodeSubmit = async (code: string) => {
    setLoading(true);
    setError(null);
    setInviteCode(code);

    try {
      // Validate invite code and proceed to OTP
      // For now, we'll simulate validation
      if (code.length < 4) {
        setError("Please enter a valid invite code");
        return;
      }

      setStep("otp");
      setResendCountdown(60);
    } catch (err: any) {
      setError(err.message || "Invalid invite code");
    } finally {
      setLoading(false);
    }
  };

    const sendOTP = async (email: string) => {
        console.log("Sending OTP to email:", email);
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error("Error sending OTP:", error);
            throw new Error(error.message);
        }

        console.log("OTP sent successfully");
    };

  const handleOTPSubmit = async (code: string) => {
    setLoading(true);
    setError(null);

      try {
          const { data, error } = await supabase.auth.verifyOtp({
              email,
              token: code,
              type: 'email', // or 'sms' if you're using phone numbers
          });
          if (error) {
              setError(error.message);
              return;
          }

      // For existing users, sign them in
      if (step === "otp" && !inviteCode) {
        // Sign in existing user
        router.push("/dashboard");
      } else {
        // Register new user with invite code
        const { error } = await signUp(email, "temp_password", inviteCode);
        if (error) {
          setError(error);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendCountdown(60);
    // Implement resend logic here
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A4A7AE]">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-white">
      {step === "login" && (
        <LoginForm
          onEmailSubmit={handleEmailSubmit}
          onGoogleSignIn={handleGoogleSignIn}
          loading={loading}
          error={error || undefined}
        />
      )}

      {step === "password" && (
        <PasswordForm
          email={email}
          onPasswordSubmit={handlePasswordSubmit}
          onBackToEmail={handleBackToEmail}
          loading={loading}
          error={error || undefined}
        />
      )}

      {step === "invite" && (
        <InviteCodeForm
          onCodeSubmit={handleInviteCodeSubmit}
          loading={loading}
          error={error || undefined}
        />
      )}

      {step === "otp" && (
        <OTPVerificationForm
          email={email}
          onCodeSubmit={handleOTPSubmit}
          onResendCode={handleResendCode}
          loading={loading}
          error={error || undefined}
          resendCountdown={resendCountdown}
        />
      )}
    </div>
  );
}
