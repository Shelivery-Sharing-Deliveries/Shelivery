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
import SetPasswordForm from "@/components/auth/SetPasswordForm";
import { useAuth } from "@/hooks/useAuth";

type AuthStep = "login" | "password" | "invite" | "setPassword" | "otp" | "register";

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [password, setPassword] = useState("");


  const {
    user,
    loading: authLoading,
    signIn,
    signUp,
      signInWithOAuth,
      checkUserExists,
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
            const userExists = await checkUserExists(submittedEmail);
            console.log("User exists:", userExists);

            if (userExists) {
                // User exists, proceed to password step
                setStep("password");
            } else {
                // User does not exist, proceed to invite code step (for new user registration)
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
      
        setStep("setPassword");
      setResendCountdown(60);
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
      // Store the password in state for potential future use (e.g., if signup fails and user tries again)
      setPassword(submittedPassword);

      // Call the signUp function from useAuth. This should internally use supabase.auth.signUp.
      // Supabase's signUp method will create the user and send a confirmation email (link).
      const { error: signUpError } = await signUp(email, submittedPassword, inviteCode);

      if (signUpError) {
        setError(signUpError);
        // If signup fails, stay on the setPassword step or provide specific feedback.
        return;
      }

      // If signup is successful, transition to a state where the user is informed to check their email.
        router.push("/dashboard");
      // No OTP countdown needed here as the user is expected to click a link in their email.
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
                type: 'email',
            });

            if (error) {
                setError(error.message);
                return;
            }

            if (step === "otp" && !inviteCode) {
                router.push("/dashboard");
            } else {
                const { error } = await signUp(email, password, inviteCode);
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
          {step === "setPassword" && (
              <SetPasswordForm
                  email={email}
                  onPasswordSubmit={handleSetPasswordSubmit}
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
