"use client";

import { ReactNode } from "react";

interface AuthButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "google";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export default function AuthButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: AuthButtonProps) {
  const baseClasses =
    "w-full h-[56px] flex items-center justify-center gap-3 rounded-[16px] font-poppins text-[18px] font-semibold leading-[26px] transition-colors touch-manipulation";

  const variantClasses = {
    primary: "bg-[#FFDB0D] text-[#000000]",
    secondary: "bg-[#FFDB0D] text-[#000000]",
    google: "bg-white border border-[#E9EAEB] text-[#000000]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
