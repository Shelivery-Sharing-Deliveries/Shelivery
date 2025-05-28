"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface AuthFormProps {
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
  onSuccess?: () => void;
  className?: string;
}

export function AuthForm({
  mode,
  onModeChange,
  onSuccess,
  className,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { signIn, signUp, signInWithOAuth } = useAuth();

  const validateForm = () => {
    if (!email || !password) {
      setError("Please fill in all required fields");
      return false;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
      if (!invitationCode.trim()) {
        setError("Invitation code is required");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password, invitationCode);
        if (error) {
          setError(error);
        } else {
          setMessage(
            "Account created successfully! Please check your email to confirm your account."
          );
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error);
        } else {
          onSuccess?.();
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (
    provider: "google" | "github" | "discord"
  ) => {
    setError(null);
    setMessage(null);
    setOauthLoading(provider);

    try {
      // For signup mode, validate invitation code first
      if (mode === "signup" && !invitationCode.trim()) {
        setError("Please enter an invitation code before using social login");
        return;
      }

      const { error } = await signInWithOAuth(
        provider,
        mode === "signup" ? invitationCode : undefined
      );

      if (error) {
        setError(error);
      }
      // Note: OAuth success is handled by the callback page redirect
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-shelivery-text-primary mb-2">
          {mode === "signup" ? "Join Shelivery" : "Welcome Back"}
        </h1>
        <p className="text-shelivery-text-secondary">
          {mode === "signup"
            ? "Create your account to start saving on deliveries"
            : "Sign in to your account"}
        </p>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => handleOAuthSignIn("google")}
          loading={oauthLoading === "google"}
          disabled={oauthLoading !== null}
        >
          {oauthLoading === "google" ? (
            "Connecting..."
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => handleOAuthSignIn("github")}
          loading={oauthLoading === "github"}
          disabled={oauthLoading !== null}
        >
          {oauthLoading === "github" ? (
            "Connecting..."
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </>
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invitation Code (Signup only) - moved to top for OAuth validation */}
        {mode === "signup" && (
          <div>
            <label
              htmlFor="invitationCode"
              className="block text-sm font-medium text-shelivery-text-primary mb-1"
            >
              Invitation Code
            </label>
            <input
              id="invitationCode"
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
              className="shelivery-input w-full"
              placeholder="Enter invitation code"
              maxLength={8}
              required
            />
            <p className="text-xs text-shelivery-text-tertiary mt-1">
              Shelivery is invite-only. Get an invitation from a friend.
            </p>
          </div>
        )}

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

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-shelivery-text-primary mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shelivery-input w-full"
            placeholder="Enter your password"
            required
          />
        </div>

        {/* Confirm Password (Signup only) */}
        {mode === "signup" && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-shelivery-text-primary mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="shelivery-input w-full"
              placeholder="Confirm your password"
              required
            />
          </div>
        )}

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
          loading={loading}
          disabled={oauthLoading !== null}
        >
          {mode === "signup" ? "Create Account" : "Sign In"}
        </Button>
      </form>

      {/* Mode Toggle */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => onModeChange(mode === "signup" ? "signin" : "signup")}
          className="text-shelivery-primary-blue hover:underline text-sm"
        >
          {mode === "signup"
            ? "Already have an account? Sign in"
            : "Need an account? Sign up"}
        </button>
      </div>

      {/* Forgot Password (Signin only) */}
      {mode === "signin" && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              // TODO: Implement forgot password flow
              alert("Forgot password feature coming soon!");
            }}
            className="text-shelivery-text-tertiary hover:text-shelivery-text-secondary text-sm"
          >
            Forgot your password?
          </button>
        </div>
      )}
    </div>
  );
}
