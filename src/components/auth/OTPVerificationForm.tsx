"use client";

import { useState } from "react";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import AuthButton from "./AuthButton";

interface OTPVerificationFormProps {
  email: string;
  onCodeSubmit: (code: string) => void;
  onResendCode: () => void;
  loading?: boolean;
  error?: string | undefined;
  resendCountdown?: number;
}

export default function OTPVerificationForm({
  email,
  onCodeSubmit,
  onResendCode,
  loading = false,
  error,
  resendCountdown = 0,
}: OTPVerificationFormProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onCodeSubmit(code);
    }
  };

  const formatEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (!local || !domain || local.length <= 4) return email;
    const masked =
      local.substring(0, 4) + "*".repeat(Math.max(0, local.length - 4));
    return `${masked}@${domain}`;
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <AuthLayout showLogo={false} className="gap-8">
      <div className="w-full flex flex-col gap-8">
        {/* Header */}
        <div className="text-center flex flex-col gap-6">
          <h1 className="text-[#000000] font-poppins text-[18px] font-medium leading-[26px]">
            Enter Verification Code
          </h1>
          <p className="text-[#000000] font-poppins text-[14px] font-normal leading-[20px]">
            Enter the code we sent to
            <br />
            {formatEmail(email)}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Code Field */}
          <TextField
            label="Code"
            placeholder="_ _ _ _ _"
            value={code}
            onChange={setCode}
            type="text"
            required
          />

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          <div className="flex flex-col gap-6">
            {/* Submit Button */}
            <AuthButton type="submit" loading={loading}>
              Submit
            </AuthButton>

            {/* Resend Button or Countdown */}
            <div className="text-center">
              {resendCountdown > 0 ? (
                <p className="text-[#000000] font-poppins text-[14px] font-normal leading-[20px]">
                  Resend in {formatCountdown(resendCountdown)}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={onResendCode}
                  className="text-[#245B7B] font-poppins text-[14px] font-semibold leading-[20px] underline"
                >
                  Resend it
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
