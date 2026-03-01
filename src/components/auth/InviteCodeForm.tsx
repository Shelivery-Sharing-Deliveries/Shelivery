"use client";

import { useState, useEffect } from "react";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import AuthButton from "./AuthButton";
import { getStoredInviteCode, clearStoredInviteCode } from "@/lib/invite-storage";

interface InviteCodeFormProps {
  onCodeSubmit: (code: string) => void;
  loading?: boolean;
  error?: string | undefined;
}

export default function InviteCodeForm({
  onCodeSubmit,
  loading = false,
  error,
}: InviteCodeFormProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const inviteMessageCode = "INNOSUISSE";
  const isPopupActive = true;

  // Auto-populate invite code from localStorage on component mount
  useEffect(() => {
    const storedCode = getStoredInviteCode();
    if (storedCode) {
      setInviteCode(storedCode);
      console.log("InviteCodeForm: Auto-populated invite code from localStorage:", storedCode);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      // Clear stored invite code after successful submission
      clearStoredInviteCode();
      onCodeSubmit(inviteCode);
    }
  };

  return (
    <AuthLayout className="gap-8">
      <div className="w-full flex flex-col gap-8">
        {/* Get an invite code Title */}
        <div className="text-center">
          <h1 className="text-[#000000] font-inter text-[18px] font-bold leading-[21.78px]">
            Get an invite code ?
          </h1>
        </div>
        {isPopupOpen && isPopupActive && (
          <div className="relative rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-md">
            <button
              type="button"
              onClick={() => setIsPopupOpen(false)}
              className="absolute right-3 top-3 text-sm font-semibold text-[#6B7280]"
              aria-label="Close invitation info"
            >
              ✕
            </button>
            <div className="flex flex-col gap-2 text-center">
              <p className="text-[14px] font-semibold text-[#111827]">
                You can use this invitation code "{inviteMessageCode}"
              </p>
              <p className="text-[12px] text-[#6B7280]">
                For the first trial, you can use the code above to explore the app.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Code Field */}
          <TextField
            label="Code"
            placeholder="Enter your invite code"
            value={inviteCode}
            onChange={setInviteCode}
            type="text"
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
        </form>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-[#000000] font-inter text-[12px] font-medium leading-[14.52px]">
            Don`t you have a code ? ask a friend to invite you
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
