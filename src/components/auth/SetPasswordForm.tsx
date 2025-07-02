"use client";

import { useState } from "react";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import AuthButton from "./AuthButton";

interface SetPasswordFormProps {
    email: string;
    onPasswordSubmit: (password: string) => void;
    loading?: boolean;
    error?: string | undefined;
}

export default function SetPasswordForm({
    email,
    onPasswordSubmit,
    loading = false,
    error,
}: SetPasswordFormProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null); // Clear previous password errors

        if (!password.trim()) {
            setPasswordError("Password cannot be empty.");
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        // You might want to add more password strength validation here
        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters long.");
            return;
        }

        onPasswordSubmit(password);
    };

    return (
        <AuthLayout className="gap-8">
            <div className="w-full flex flex-col gap-8">
                {/* Set Your Password Title */}
                <div className="text-center">
                    <h1 className="text-[#000000] font-inter text-[18px] font-bold leading-[21.78px]">
                        Set Your Password
                    </h1>
                    <p className="text-[#A4A7AE] font-inter text-[14px] font-normal leading-[20px] mt-2">
                        For {email}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* New Password Field */}
                    <TextField
                        label="New Password"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={setPassword}
                        type="password"
                        required
                        autoComplete="new-password" // Helps browsers suggest strong passwords
                    />

                    {/* Confirm Password Field */}
                    <TextField
                        label="Confirm Password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        type="password"
                        required
                        autoComplete="new-password" // Helps browsers suggest strong passwords
                    />

                    {/* Error Message */}
                    {(error || passwordError) && (
                        <div className="text-red-600 text-sm font-medium">
                            {error || passwordError}
                        </div>
                    )}

                    {/* Set Password Button */}
                    <AuthButton type="submit" loading={loading}>
                        Set Password
                    </AuthButton>
                </form>
            </div>
        </AuthLayout>
    );
}
