"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  showLogo?: boolean;
  className?: string;
}

export default function AuthLayout({
  children,
  showLogo = true,
  className = "",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto flex flex-col">
      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col justify-center items-center px-4 py-6 ${className}`}
      >
        {showLogo && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2">
              <div className="w-[79.9px] h-[91.6px] flex items-center justify-center">
                {/* Shelivery Logo */}
                <img
                  src="/icons/shelivery-logo.svg"
                  alt="Shelivery"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-[343px]">{children}</div>
      </div>
    </div>
  );
}
