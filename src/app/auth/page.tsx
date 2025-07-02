"use client";
import { supabase } from '@/lib/supabase'; // Ensure supabase client is imported
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LoginForm,
  PasswordForm,
  InviteCodeForm,
  OTPVerificationForm, // Keep this if you intend to use OTP for other flows
} from "@/components/auth";
import SetPasswordForm from "@/components/auth/SetPasswordForm";
import EmailConfirmationForm from "@/components/auth/EmailConfirmationForm";
import { useAuth } from "@/hooks/useAuth";

type AuthStep = "login" | "password" | "invite" | "setPassword" | "otp" | "register" | "awaitingEmailConfirmation";

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [password, setPassword] = useState("");
  // MODIFIED: Initialize isDormitoryIdLoading as true to ensure loading spinner shows initially
  const [isDormitoryIdLoading, setIsDormitoryIdLoading] = useState(true);


  const {
    user,
    loading: authLoading, // This is the loading state from useAuth
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

  // MODIFIED: Redirect based on dormitory_id fetched from the 'user' table
  useEffect(() => {
    const handleRedirect = async () => {
      // Only proceed if auth is not loading and user state has settled
      if (!authLoading) {
        if (user && user.id) { // User is authenticated
          setIsDormitoryIdLoading(true); // Start loading for dormitory ID fetch
          try {
            // Fetch dormitory_id from the 'user' table
            const { data: userData, error: userError } = await supabase
              .from("user") // Assuming 'user' is the table where dormitory_id is stored
              .select("dormitory_id")
              .eq("id", user.id)
              .single();

            if (userError) {
              console.error("Error fetching dormitory_id:", userError);
              // If there's an error fetching, assume they need to set it up.
              router.push(`/profile-set/${user.id}`); // MODIFIED: Dynamic userId in path
              return;
            }

            const dormitoryId = userData?.dormitory_id;

            if (dormitoryId === null || dormitoryId === undefined) {
              // If dormitory_id is NULL or not set, redirect to profile-set/[userId]
              router.push(`/profile-set/${user.id}`); // MODIFIED: Dynamic userId in path
            } else {
              // If dormitory_id exists, redirect to dashboard
              router.push("/dashboard");
            }
          } catch (err) {
            console.error("Unexpected error during dormitory_id check:", err);
            router.push(`/profile-set/${user.id}`); // MODIFIED: Dynamic userId in path
          } finally {
            setIsDormitoryIdLoading(false); // Ensure loading is set to false after fetch attempt
          }
        } else {
          // User is not authenticated and authLoading is false, so no redirection needed from here.
          // Ensure isDormitoryIdLoading is false to allow the login form to render.
          setIsDormitoryIdLoading(false);
        }
      }
    };

    handleRedirect();
  }, [user, authLoading, router]); // Dependencies: runs when user or authLoading changes
  // END MODIFIED

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
        // Check for "Email not confirmed" error specifically
        if (error.includes("Email not confirmed")) {
          setError("Your email is not confirmed. Please check your inbox for the confirmation link to log in.");
          setStep("awaitingEmailConfirmation");
        } else {
          setError("Invalid password. Please try again.");
        }
      } else {
        // Successfully signed in. The useEffect will now handle redirection based on user.dormitory_id.
        // No direct router.push("/dashboard") or router.push("/profile-set") here.
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
      setResendCountdown(60); // This line is still present as per your provided code
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

      // Call the signUp function from useAuth. This should internally use supabase.auth.signUp.
      // Supabase's signUp method will create the user and send a confirmation email (link).
      const { error: signUpError } = await signUp(email, submittedPassword, inviteCode);

      if (signUpError) {
        setError(signUpError);
        // If signup fails, stay on the setPassword step or provide specific feedback.
        return;
      }

      // If signup is successful, transition to a state where the user is informed to check their email.
      setStep("awaitingEmailConfirmation"); 
    } catch (err: any) {
      setError(err.message || "Failed to set password and register account.");
    } finally {
      setLoading(false);
    }
  };

  // OTP-related functions (kept as per your provided code)
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

  // MODIFIED: Main loading check to include isDormitoryIdLoading
  if (authLoading || isDormitoryIdLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A4A7AE]">Loading...</p>
        </div>
      </div>
    );
  }

  // MODIFIED: If user is authenticated and not loading, return null to let useEffect handle redirection
  if (user) {
    return null;
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
      {step === "awaitingEmailConfirmation" && (
        <EmailConfirmationForm
          email={email}
          loading={loading}
          error={error || undefined}
        />
      )}
      {step === "otp" && ( // Keep this rendering if you intend to use OTP for other flows
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
