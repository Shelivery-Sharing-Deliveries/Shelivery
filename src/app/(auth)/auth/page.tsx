"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LoginForm,
  PasswordForm,
  InviteCodeForm,
  OTPVerificationForm,
} from "@/components/auth";
import SetPasswordForm from "@/components/auth/SetPasswordForm";
import EmailConfirmationForm from "@/components/auth/EmailConfirmationForm";
import { useAuth } from "@/hooks/useAuth";

type AuthStep =
  | "login"
  | "password"
  | "invite"
  | "setPassword"
  | "otp"
  | "register"
  | "awaitingEmailConfirmation";

function AuthPageContent() {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false); // For form submission loading
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [password, setPassword] = useState("");

  const {
    user,
    loading: authLoading, // This is the loading state from useAuth, indicating initial session check
    signIn,
    signUp,
    signInWithOAuth,
    checkUserExists,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // THIS IS THE CORRECT PLACE FOR REDIRECTION LOGIC IN AUTH PAGE:
  // Redirect if user is already logged in and tries to access /auth.
  // This useEffect runs after render, preventing the "setState in render" warning.
  useEffect(() => {
    if (!authLoading && user) {
      // User is authenticated, redirect them away from the auth page
      router.replace("/dashboard"); // Use replace to prevent adding /auth to browser history
    }
  }, [user, authLoading, router]); // Re-run when user or authLoading state changes

  // Check for invitation code in URL
  useEffect(() => {
    const urlInviteCode = searchParams.get("invite");
    if (urlInviteCode) {
      setInviteCode(urlInviteCode);
      setStep("invite");
    }
  }, [searchParams]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else return () => setResendCountdown(0);
  }, [resendCountdown]);

  const handleEmailSubmit = async (submittedEmail: string) => {
    setLoading(true);
    setError(null);
    setEmail(submittedEmail);

    try {
      const userExists = await checkUserExists(submittedEmail);
      console.log("User exists:", userExists);

      if (userExists) {
        setStep("password");
      } else {
        setStep("invite");
      }
    } catch (err: any) {
      console.error("Error in handleEmailSubmit:", err);
      setError("An unexpected error occurred while checking email.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        if (signInError.includes("Email not confirmed")) {
          setError(
            "Your email is not confirmed. Please check your inbox for the confirmation link to log in."
          );
          setStep("awaitingEmailConfirmation");
        } else if (signInError.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(signInError || "An unexpected error occurred during login.");
        }
      } else {
        // Successfully signed in. The useEffect above will handle redirection.
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
      const { error: oauthError } = await signInWithOAuth("google");
      if (oauthError) {
        setError(oauthError);
      }
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred with Google sign-in"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCodeSubmit = async (code: string) => {
    setLoading(true);
    setError(null);
    setInviteCode(code);

    try {
      if (code.length < 4) {
        setError("Please enter a valid invite code");
        return;
      }

      setStep("setPassword");
    } catch (err: any) {
      setError(err.message || "Invalid invite code");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPasswordSubmit = async (submittedPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      setPassword(submittedPassword);

      const { error: signUpError } = await signUp(
        email,
        submittedPassword,
        inviteCode
      );

      if (signUpError) {
        setError(signUpError);
        return;
      }

      setStep("awaitingEmailConfirmation");
    } catch (err: any) {
      setError(err.message || "Failed to set password and register account.");
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
        type: "email",
      });

      if (error) {
        setError(error.message);
        return;
      }
      // OTP successful. The useEffect above will handle redirection.
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

  // Show a loading spinner only while the *initial* Supabase session is being determined.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A4A7AE]">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  // REMOVED THE OFFENDING BLOCK:
  // if (user) {
  //   router.replace("/dashboard");
  //   return null;
  // }

  // If user is null (not authenticated) and not loading, render the appropriate auth form.
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
      {step === "setPassword" && (
        <SetPasswordForm
          email={email}
          onPasswordSubmit={handleSetPasswordSubmit}
          loading={loading}
          error={error || undefined}
        />
      )}
      {step === "awaitingEmailConfirmation" && (
        <EmailConfirmationForm
          email={email}
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

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A4A7AE]">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
