"use client";

import React, { useEffect, useState, Suspense } from "react";
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
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm"; // NEW: Import ForgotPasswordForm
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase"; // Ensure supabase is imported for profile checks


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
    const [message, setMessage] = useState<string | null>(null); // For success messages
    const [resendCountdown, setResendCountdown] = useState(0);
    const [password, setPassword] = useState("");
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState(""); // State for email in forgot password flow
    const [isProfileCheckLoading, setIsProfileCheckLoading] = useState(true); // NEW: State for profile check loading


    const {
        user,
        loading: authLoading, // This is the loading state from useAuth, indicating initial session check
        signIn,
        signUp,
        checkUserExists,
    } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- NEW: Redirect based on profile completeness (runs after initial auth check) ---
    useEffect(() => {
        const checkProfileAndRedirect = async () => {
            // Only proceed if user is logged in and authLoading is complete
            if (!authLoading && user) {
                setIsProfileCheckLoading(true); // Start loading for profile check
                console.log("AuthPage: User logged in. Checking profile completeness...");

                // FETCHING: Include all fields that define a "complete" profile
                const { data: userData, error: profileError } = await supabase
                    .from("user")
                    .select("first_name, last_name, favorite_store") // Added last_name and favorite_store
                    .eq("id", user.id)
                    .single();

                if (profileError) {
                    console.error("AuthPage: Error fetching user profile for completeness check:", profileError);
                    // If there's an error fetching profile, assume it's not complete or a problem, direct to setup
                    router.replace(`/profile-set/${user.id}`);
                    setIsProfileCheckLoading(false);
                    return;
                }

                // Check if first_name, last_name, AND favorite_store are set.
                // Adjust these fields based on what truly defines a "complete" profile for your app.
                const isProfileComplete = userData?.first_name &&
                    userData?.last_name &&
                    userData?.favorite_store; // Checks for non-null/non-empty string

                if (isProfileComplete) {
                    console.log("AuthPage: Profile is complete. Redirecting to dashboard.");
                    router.replace("/dashboard");
                } else {
                    console.log("AuthPage: Profile is NOT complete. Redirecting to profile setup.");
                    router.replace(`/profile-set/${user.id}`);
                }
                setIsProfileCheckLoading(false); // End loading for profile check
            } else if (!authLoading && !user) {
                // If no user and auth loading is done, then stop profile check loading
                setIsProfileCheckLoading(false);
            }
        };

        checkProfileAndRedirect();
    }, [user, authLoading, router]); // Re-run when user or authLoading state changes

    // NEW: Handle email confirmation success from URL query parameters
    useEffect(() => {
        const confirmedParam = searchParams.get("confirmed");
        if (confirmedParam === "true") {
            console.log("AuthPage: Detected confirmed=true parameter in URL.");
            setMessage("Your email has been successfully confirmed! You can now log in.");
            setStep("login"); // Ensure the login form is visible
            // Removed: router.replace('/auth');
            // This redirect is handled by the checkProfileAndRedirect effect if the user is logged in,
            // or the user remains on the login form if they are not.
        }
    }, [searchParams, router]);

    // MODIFIED: Check for invitation code in URL and handle automatic transition
    useEffect(() => {
        const urlInviteCode = searchParams.get("invite");

        if (urlInviteCode) {
            console.log("AuthPage: Detected invite code in URL:", urlInviteCode);
            setInviteCode(urlInviteCode); // Set the invite code state

            // If an invite code is present, still start at login to get the user's email.
            // The handleEmailSubmit will then use the pre-filled inviteCode to skip the manual invite step.
            setStep("login");
            setMessage("Invitation code detected. Please enter your email to proceed with registration.");
            console.log("AuthPage: Invite code found. User needs to enter email first.");

            // Clear the invite parameter from the URL to prevent re-processing on refresh
            // and keep the URL clean.
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.delete("invite");
            // Removed `shallow: true` as it's not directly supported by `useRouter` from `next/navigation`'s types.
            router.replace(`/auth?${newSearchParams.toString()}`); 
        }
    }, [searchParams, router]);


    // Countdown timer for resend
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => {
                setResendCountdown(resendCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            return () => { }; // Clear timeout if countdown is complete)
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
                // If an invite code was already set from the URL, proceed to set password directly
                if (inviteCode) {
                    setStep("setPassword");
                } else {
                    // Otherwise, go to the invite code step for manual entry
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
        setMessage(null); // Clear messages
    };

    // Modified to not automatically transition if inviteCode is already set from URL
    const handleInviteCodeSubmit = async (code: string) => {
        setLoading(true);
        setError(null);
        setMessage(null); // Clear messages on new submit
        setInviteCode(code); // Always set the invite code state

        try {
            if (code.length < 4) { // Basic validation
                setError("Please enter a valid invite code");
                return;
            }

            // If we reached this step, it means the code wasn't from the URL initially,
            // or the user needs to manually re-enter. Proceed to setPassword.
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
                inviteCode // Ensure inviteCode is used here
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
            // OTP successful. The useEffect above will handle redirection.
        } catch (err: any) {
            setError(err.message || "Invalid verification code");
        } finally {
            setLoading(false);
        }
    };

    // MODIFIED: handleResendCode to use Supabase's resend method
    const handleResendCode = async () => {
        setLoading(true); // Indicate loading for resend action
        setError(null);
        setMessage(null);
        setResendCountdown(60); // Start countdown immediately

        try {
            // Use supabase.auth.resend with type 'signup' for re-sending confirmation link
            const { error: resendError } = await supabase.auth.resend({
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


    // Show a loading spinner only while the *initial* Supabase session is being determined
    // OR while the profile completeness check is ongoing.
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

            {/* Message display for confirmation or general success */}
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
                    message={message || undefined} // Pass message to EmailConfirmationForm
                    onResendClick={handleResendCode} // Pass resend handler
                    resendCountdown={resendCountdown} // Pass countdown
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
