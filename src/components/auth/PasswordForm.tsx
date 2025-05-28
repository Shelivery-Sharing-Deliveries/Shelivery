"use client";

import { useState } from "react";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import AuthButton from "./AuthButton";

interface PasswordFormProps {
  email: string;
  onPasswordSubmit: (password: string) => void;
  onBackToEmail: () => void;
  loading?: boolean;
  error?: string | undefined;
}

export default function PasswordForm({
  email,
  onPasswordSubmit,
  onBackToEmail,
  loading = false,
  error,
}: PasswordFormProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onPasswordSubmit(password);
    }
  };

  return (
    <AuthLayout className="gap-8">
      <div className="w-full flex flex-col gap-8">
        {/* Welcome Back Title */}
        <div className="text-center">
          <h1 className="text-[#000000] font-inter text-[18px] font-bold leading-[21.78px]">
            Enter Your Password
          </h1>
          <p className="text-[#A4A7AE] font-inter text-[14px] font-normal leading-[20px] mt-2">
            {email}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Password Field */}
          <TextField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            type="password"
            required
          />

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

          {/* Sign In Button */}
          <AuthButton type="submit" loading={loading}>
            Sign In
          </AuthButton>

          {/* Back to Email */}
          <div className="text-center">
            <button
              type="button"
              onClick={onBackToEmail}
              className="text-[#245B7B] font-inter text-[14px] font-medium leading-[16.94px] underline"
            >
              Use different email
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                // TODO: Implement forgot password flow
                alert("Forgot password feature coming soon!");
              }}
              className="text-[#A4A7AE] font-inter text-[14px] font-normal leading-[16.94px]"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
