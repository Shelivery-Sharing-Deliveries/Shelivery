"use client";
import { supabaseAuth } from "@/lib/supabase";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
    LoginForm,
    PasswordForm,
    // InviteCodeForm, // We might not need to render this directly in the flow if always skipped for URL invites
    OTPVerificationForm,
} from "@/components/auth";
import SetPasswordForm from "@/components/auth/SetPasswordForm";
import EmailConfirmationForm from "@/components/auth/EmailConfirmationForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import InviteCodeForm from "@/components/auth/InviteCodeForm"; // Make sure to import this if still used for manual entry
import { useAuth } from "@/hooks/useAuth";

type AuthStep =
    | "login"
    | "password"
    | "invite" // Keep this step for manual invite code entry if needed
    | "setPassword"
    | "otp"
    | "register"
    | "awaitingEmailConfirmation"
    | "forgotPassword";

function AuthPageContent() {
    const [step, setStep] = useState<AuthStep>("login");
    const [email, setEmail] = useState("");
    const [inviteCode, setInviteCode] = useState(""); // This will store the code from URL or manual entry
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [password, setPassword] = useState("");
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [isProfileCheckLoading, setIsProfileCheckLoading] = useState(true);

    const {
        user,
        loading: authLoading,
        signIn,
        signUp,
        checkUserExists,
    } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- NEW: Redirect based on profile completeness (runs after initial auth check) ---
    useEffect(() => {
        const checkProfileAndRedirect = async () => {
            if (!authLoading && user) {
                setIsProfileCheckLoading(true);
                console.log("AuthPage: User logged in. Checking profile completeness...");

                const { data: userData, error: profileError } = await supabaseAuth
                    .from("user")
                    .select("first_name, last_name, favorite_store")
                    .eq("id", user.id)
                    .single();

                if (profileError) {
                    console.error("AuthPage: Error fetching user profile for completeness check:", profileError);
                    router.replace(`/profile-set/${user.id}`);
                    setIsProfileCheckLoading(false);
                    return;
                }

                const isProfileComplete = userData?.first_name &&
                    userData?.last_name &&
                    userData?.favorite_store;

                if (isProfileComplete) {
                    console.log("AuthPage: Profile is complete. Redirecting to dashboard.");
                    router.replace("/dashboard");
                } else {
                    console.log("AuthPage: Profile is NOT complete. Redirecting to profile setup.");
                    router.replace(`/profile-set/${user.id}`);
                }
                setIsProfileCheckLoading(false);
            } else if (!authLoading && !user) {
                setIsProfileCheckLoading(false);
            }
        };

        checkProfileAndRedirect();
    }, [user, authLoading, router]);

    // NEW: Handle email confirmation success from URL query parameters
    useEffect(() => {
        const confirmedParam = searchParams.get("confirmed");
        if (confirmedParam === "true") {
            console.log("AuthPage: Detected confirmed=true parameter in URL.");
            setMessage("Your email has been successfully confirmed! You can now log in.");
            setStep("login");
            router.replace('/auth'); // Clear the query parameter
        }
    }, [searchParams, router]);

    // ⭐ MODIFIED: Check for invitation code in URL
    useEffect(() => {
        const urlInviteCode = searchParams.get("invite");
        if (urlInviteCode) {
            setInviteCode(urlInviteCode); // Store the invite code
            // No need to change step here directly. Keep it at 'login'
            // or whatever the initial step is, the logic will handle it in handleEmailSubmit.
            console.log(`AuthPage: Invite code "${urlInviteCode}" found in URL. Stored it.`);
        }
    }, [searchParams]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => {
                setResendCountdown(resendCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            return () => { };
        }
    }, [resendCountdown]);

    const handleEmailSubmit = async (submittedEmail: string) => {
        setLoading(true);
        setError(null);
        setMessage(null);
        setEmail(submittedEmail);

        try {
            const userExists = await checkUserExists(submittedEmail);
            console.log("User exists:", userExists);

            if (userExists) {
                setStep("password");
            } else {
                // ⭐ MODIFIED LOGIC HERE:
                if (inviteCode) {
                    // If invite code is already present (from URL), skip 'invite' step
                    // and go directly to setting the password for registration.
                    console.log("AuthPage: User does not exist, and invite code is present. Proceeding to set password.");
                    setStep("setPassword");
                } else {
                    // If user does not exist AND no invite code from URL,
                    // then prompt for manual invite code entry.
                    console.log("AuthPage: User does not exist, no invite code from URL. Prompting for invite code.");
                    setStep("invite");
                }
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
        setMessage(null);

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
                // Successfully signed in. The useEffect that checks profile will handle redirection.
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
        setMessage(null);
    };

    const handleInviteCodeSubmit = async (code: string) => {
        setLoading(true);
        setError(null);
        setMessage(null);
        setInviteCode(code); // Update inviteCode state from manual entry

        try {
            if (code.length < 4) {
                setError("Please enter a valid invite code");
                return;
            }
            // In a real scenario, you'd likely validate the invite code on the backend here.
            // For now, we assume it's valid if it passes length check and proceed.
            console.log(`AuthPage: Manually entered invite code "${code}" submitted. Proceeding to set password.`);
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
        setMessage(null);

        try {
            setPassword(submittedPassword); // Store password (though not strictly necessary as it's used immediately)

            // ⭐ IMPORTANT: The inviteCode state is used here for signUp,
            // whether it came from the URL or was manually entered.
            const { error: signUpError } = await signUp(
                email,
                submittedPassword,
                inviteCode // The invite code is passed here
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
        const { error } = await supabaseAuth.auth.signInWithOtp({
            email: email,
            options: {
                // emailRedirectTo: `${window.location.origin}/auth/callback`,
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
        setMessage(null);

        try {
            const { data, error } = await supabaseAuth.auth.verifyOtp({
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
        setLoading(true);
        setError(null);
        setMessage(null);
        setResendCountdown(60);

        try {
            const { error: resendError } = await supabaseAuth.auth.resend({
                type: 'signup',
                email: email,
            });

            if (resendError) {
                setError(resendError.message || "Failed to resend confirmation email.");
                console.error("Error resending confirmation email:", resendError);
            } else {
                setMessage("Confirmation email re-sent successfully! Check your inbox.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during resend.");
            console.error("Unexpected error during resend:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordClick = () => {
        console.log("Forgot password button clicked! Current email:", email);
        setForgotPasswordEmail(email);
        setStep("forgotPassword");
        setError(null);
        setMessage(null);
        console.log("Step set to:", "forgotPassword");
    };

    const handleForgotPasswordRequest = async (submittedEmail: string) => {
        setLoading(true);
        setError(null);
        setMessage(null);
        console.log("Sending password reset link for:", submittedEmail);

        try {
            const { error: resetError } = await supabaseAuth.auth.resetPasswordForEmail(submittedEmail, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            });

            if (resetError) {
                setError(resetError.message);
                console.error("Password reset error:", resetError);
            } else {
                setMessage("Password reset link sent! Check your email inbox (and spam folder).");
                console.log("Password reset link sent successfully.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during password reset.");
            console.error("Unexpected error during password reset:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLoginFromForgot = () => {
        console.log("Back to login from forgot password.");
        setStep("login");
        setError(null);
        setMessage(null);
        setForgotPasswordEmail("");
    };

    if (authLoading || isProfileCheckLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#A4A7AE]">Loading authentication state...</p>
                </div>
            </div>
        );
    }

    console.log("AuthPageContent current rendering step:", step);

    return (
        <div className="min-h-screen bg-white relative">
            <button
                onClick={() => router.push('/')}
                className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                aria-label="Go back to main page"
            >
                <Image
                    src="/icons/back-arrow.svg"
                    alt="Go Back"
                    width={24}
                    height={24}
                />
            </button>

            {message && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm p-3 rounded-lg bg-green-100 border border-green-200 text-green-700 text-center shadow-md">
                    {message}
                </div>
            )}

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
                    onForgotPasswordClick={handleForgotPasswordClick}
                    loading={loading}
                    error={error || undefined}
                />
            )}

            {step === "invite" && (
                // This form will only show if no invite code was found in the URL
                // AND the email submitted by the user does not exist.
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
                    message={message || undefined}
                    onResendClick={handleResendCode}
                    resendCountdown={resendCountdown}
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
            {step === "forgotPassword" && (
                <ForgotPasswordForm
                    initialEmail={forgotPasswordEmail}
                    onSubmit={handleForgotPasswordRequest}
                    onBackToLogin={handleBackToLoginFromForgot}
                    loading={loading}
                    error={error}
                    message={message}
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
