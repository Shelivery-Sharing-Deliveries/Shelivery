// components/auth/ForgotPasswordForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button"; // Assuming you have a Button component
//import { cn } from "@/lib/utils"; // Assuming you have a cn utility
import AuthLayout from "./AuthLayout"; // NEW: Import AuthLayout

interface ForgotPasswordFormProps {
  initialEmail?: string; // Optional: to pre-fill the email field
  onSubmit: (email: string) => Promise<void>; // Function to handle reset request
  onBackToLogin: () => void; // Function to go back to login form
  loading?: boolean;
  error?: string | null;
  message?: string | null; // For success messages
}

export default function ForgotPasswordForm({
  initialEmail = "",
  onSubmit,
  onBackToLogin,
  loading,
  error,
  message,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      // Basic validation
      return;
    }
    await onSubmit(email);
  };

  return (
    <AuthLayout className="gap-8"> {/* NEW: Wrap with AuthLayout and pass className */}
      <div className="w-full flex flex-col gap-8"> {/* NEW: Mimic PasswordForm's inner structure */}
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-shelivery-text-primary mb-2">
            Reset Password
          </h1>
          <p className="text-shelivery-text-secondary">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-shelivery-text-primary mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shelivery-input w-full"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-shelivery-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-shelivery-sm">
              {message}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading || false}
          >
            Send Reset Link
          </Button>
        </form>

        {/* Back to Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-shelivery-primary-blue hover:underline text-sm"
          >
            &larr; Back to login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
