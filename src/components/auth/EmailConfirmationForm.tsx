// components/auth/EmailConfirmationForm.tsx
"use client";

import React from 'react';
import AuthLayout from './AuthLayout'; // Assuming AuthLayout is in the same directory or accessible
import { Button } from "@/components/ui/Button"; // Assuming you have a Button component

interface EmailConfirmationFormProps {
    email: string;
    loading?: boolean;
    error?: string | undefined;
    message?: string | undefined; // NEW: Message prop for success/info
    onResendClick: () => void; // NEW: Callback for resend button click
    resendCountdown: number; // NEW: Countdown for resend button
}

const EmailConfirmationForm: React.FC<EmailConfirmationFormProps> = ({
    email,
    loading = false,
    error,
    message, // Destructure message
    onResendClick, // Destructure new prop
    resendCountdown, // Destructure new prop
}) => {
    return (
        <AuthLayout className="gap-8">
            <div className="w-full flex flex-col gap-8">
                <div className="text-center">
                    <h1 className="text-[#000000] font-inter text-[18px] font-bold leading-[21.78px]">
                        Check Your Email
                    </h1>
                    <p className="text-[#A4A7AE] font-inter text-[14px] font-normal leading-[20px] mt-2">
                        A confirmation link has been sent to <span className="font-semibold text-gray-800">{email}</span>.
                        Please click the link in your email to activate your account and log in.
                    </p>
                </div>

                {/* Display error message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm font-medium">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Display success/info message */}
                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm font-medium">
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}

                {/* Resend button */}
                <div className="text-center mt-4">
                    <Button
                        type="button"
                        onClick={onResendClick}
                        disabled={loading || resendCountdown > 0}
                        className="w-full" // Make button full width if needed
                        size="lg" // Use your Button component's size prop
                        loading={loading} // Pass loading state to the Button component
                    >
                        {loading
                            ? "Sending..."
                            : resendCountdown > 0
                                ? `Resend in ${resendCountdown}s`
                                : "Resend Confirmation Email"}
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default EmailConfirmationForm;
