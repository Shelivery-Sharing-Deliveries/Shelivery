"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image"; // Make sure Image is imported for the back arrow
import {
  LoginForm,
  PasswordForm, // This is the component that will receive onForgotPasswordClick
  InviteCodeForm,
  OTPVerificationForm,
} from "@/components/auth";
import SetPasswordForm from "@/components/auth/SetPasswordForm";
import EmailConfirmationForm from "@/components/auth/EmailConfirmationForm";
import  ForgotPasswordForm  from "@/components/auth/ForgotPasswordForm"; // NEW: Import ForgotPasswordForm
import { useAuth } from "@/hooks/useAuth";

type AuthStep =
  | "login"
  | "password"
  | "invite"
  | "setPassword"
  | "otp"
  | "register"
  | "awaitingEmailConfirmation"
  | "forgotPassword"; // NEW: Added forgotPassword step

function AuthPageContent() {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false); // For form submission loading
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // NEW: For success messages
  const [resendCountdown, setResendCountdown] = useState(0);
  const [password, setPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(""); // NEW: State for email in forgot password flow

  const {
    user,
    loading: authLoading, // This is the loading state from useAuth, indicating initial session check
    signIn,
    signUp,
    // signInWithOAuth, // Removed as it's not used in this component's logic
    checkUserExists,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if user is already logged in and tries to access /auth.
  useEffect(() => {
    if (!authLoading && user) {
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
    }
    else {
      setResendCountdown(0);
      return
    }
  }, [resendCountdown]);

  const handleEmailSubmit = async (submittedEmail: string) => {
    setLoading(true);
    setError(null);
    setMessage(null); // Clear messages on new submit
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
    setMessage(null); // Clear messages on new submit

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
    setMessage(null); // Clear messages
  };

  const handleInviteCodeSubmit = async (code: string) => {
    setLoading(true);
    setError(null);
    setMessage(null); // Clear messages on new submit
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
    setMessage(null); // Clear messages on new submit

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
        // emailRedirectTo: `${window.location.origin}/auth/callback`, // Keep this if you use OTP for sign-in/up
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
    setMessage(null); // Clear messages on new submit

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
      // OTP successful. The useEffect at the top will handle redirection.
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

  // NEW: Forgot Password Handlers
  const handleForgotPasswordClick = () => {
    console.log("Forgot password button clicked! Current email:", email); // DEBUG LOG
    setForgotPasswordEmail(email); // Pre-fill email if available from login form
    setStep("forgotPassword");
    setError(null); // Clear any previous errors
    setMessage(null); // Clear any previous messages
    console.log("Step set to:", "forgotPassword"); // DEBUG LOG
  };

  const handleForgotPasswordRequest = async (submittedEmail: string) => {
    setLoading(true);
    setError(null);
    setMessage(null); // Clear messages on new submit
    console.log("Sending password reset link for:", submittedEmail); // DEBUG LOG

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(submittedEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`, // URL for user to set new password
      });

      if (resetError) {
        setError(resetError.message);
        console.error("Password reset error:", resetError); // DEBUG LOG
      } else {
        setMessage("Password reset link sent! Check your email inbox (and spam folder).");
        console.log("Password reset link sent successfully."); // DEBUG LOG
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during password reset.");
      console.error("Unexpected error during password reset:", err); // DEBUG LOG
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLoginFromForgot = () => {
    console.log("Back to login from forgot password."); // DEBUG LOG
    setStep("login");
    setError(null);
    setMessage(null); // Clear messages
    setForgotPasswordEmail(""); // Clear email for next attempt
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

  // DEBUG LOG: Log the current step before rendering forms
  console.log("AuthPageContent current rendering step:", step);

  // If user is null (not authenticated) and not loading, render the appropriate auth form.
  return (
    // Make the main div relative to position the back button
    <div className="min-h-screen bg-white relative">
      {/* NEW: Go Back Button */}
      {/* Positioned at the top-left, uses back-arrow.svg icon */}
      <button
        onClick={() => router.push('/')} // Navigate to the main page
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10" // Added z-10 to ensure it's on top
        aria-label="Go back to main page"
      >
        <Image
          src="/icons/back-arrow.svg" // Assuming this icon path is correct
          alt="Go Back"
          width={24}
          height={24}
        />
      </button>

      {step === "login" && (
        <LoginForm
          onEmailSubmit={handleEmailSubmit}
          loading={loading}
          error={error || undefined}
        />
      )}

      {step === "password" && (
        <PasswordForm
          email={email}
          onPasswordSubmit={handlePasswordSubmit}
          onBackToEmail={handleBackToEmail}
          onForgotPasswordClick={handleForgotPasswordClick} // NEW: Pass the handler
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
      {step === "forgotPassword" && ( // NEW: Render ForgotPasswordForm
        <ForgotPasswordForm
          initialEmail={forgotPasswordEmail}
          onSubmit={handleForgotPasswordRequest}
          onBackToLogin={handleBackToLoginFromForgot}
          loading={loading}
          error={error}
          message={message} // Pass message prop
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
