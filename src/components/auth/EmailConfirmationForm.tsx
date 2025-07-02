// components/auth/EmailConfirmationForm.tsx
"use client";

import React from 'react';
import AuthLayout from './AuthLayout'; // Assuming AuthLayout is in the same directory or accessible

interface EmailConfirmationFormProps {
    email: string;
    loading?: boolean;
    error?: string | undefined;
}

const EmailConfirmationForm: React.FC<EmailConfirmationFormProps> = ({
    email,
    loading = false,
    error,
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

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm font-medium">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {loading && (
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[#A4A7AE]">Sending email...</p>
                    </div>
                )}

                {/* You might consider adding a "Resend Confirmation Email" button here if needed */}
                {/* For now, keeping it simple as OTP resend was commented out */}
                {/*
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => { /* Implement resend confirmation email logic here * / }}
            className="text-[#245B7B] font-inter text-[14px] font-medium leading-[16.94px] underline"
            disabled={loading}
          >
            Resend confirmation email
          </button>
        </div>
        */}
            </div>
        </AuthLayout>
    );
};

export default EmailConfirmationForm;
