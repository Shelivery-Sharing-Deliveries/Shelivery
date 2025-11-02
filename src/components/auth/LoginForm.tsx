"use client";

import { useState } from "react";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import AuthButton from "./AuthButton";

interface LoginFormProps {
  onEmailSubmit: (email: string) => void;
  // REMOVED: onGoogleSignIn prop is no longer needed
  loading?: boolean;
  error?: string | undefined;
}

export default function LoginForm({
  onEmailSubmit,
  // REMOVED: onGoogleSignIn from destructuring
  loading = false,
  error,
}: LoginFormProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onEmailSubmit(email);
    }
  };

  return (
    <AuthLayout className="gap-8">
      <div className="w-full flex flex-col gap-8">
        {/* Welcome Title */}
        <div className="text-center">
          <h1 className="text-[#000000] font-inter text-[18px] font-bold leading-[21.78px]">
            Welcome to Shelivery
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email Field */}
          <TextField
            label="Email Address"
            placeholder="Enter your Email Adress"
            value={email}
            onChange={setEmail}
            type="email"
            required
          />

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          {/* Continue Button */}
          <AuthButton type="submit" loading={loading}>
            Continue
          </AuthButton>

          {/* REMOVED: OR Divider */}
          {/*
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[#000000] font-inter text-[14px] font-medium leading-[16.94px]">
              OR
            </span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          */}

          {/* REMOVED: Google Sign In Button */}
          {/*
          <AuthButton
            variant="google"
            onClick={onGoogleSignIn}
            className="border border-[#E9EAEB]"
          >
            <div className="flex items-center gap-3">
              <img
                src="/icons/google-icon.svg"
                alt="Google"
                className="w-[15.68px] h-[16px]"
              />
              <span className="font-inter text-[14px] font-medium leading-[16.94px]">
                Continue With Google
              </span>
            </div>
          </AuthButton>
          */}
        </form>
      </div>
    </AuthLayout>
  );
}