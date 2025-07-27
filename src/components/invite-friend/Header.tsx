"use client";

import { useRouter } from "next/navigation";
import Image from "next/image"; // Assuming Image is used for the arrow icon

interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    // The outer div already has w-full and any className passed in.
    // PageLayout will provide the bg, border, padding, and shadow.
    <div className={`w-full ${className}`}>
      {/* Header Content - Removed redundant styling like bg-white, border-b, px-4, py-3, shadow-sm */}
      {/* PageLayout's header container already provides these styles. */}
      <div className="flex items-center gap-2"> {/* This div now only focuses on internal layout */}
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="w-6 h-6 flex items-center justify-center p-1 rounded-md hover:bg-gray-100 transition-colors touch-manipulation"
          aria-label="Go back"
        >
          {/* Using Next.js Image component for optimal image handling */}
          <Image
            src="/icons/arrow-left-icon.svg"
            alt="Back"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </button>

        {/* Title */}
        <h1 className="text-[16px] font-bold text-black leading-8 -tracking-[1.7%] flex-1">
          Invite Friend
        </h1>
      </div>
    </div>
  );
}
