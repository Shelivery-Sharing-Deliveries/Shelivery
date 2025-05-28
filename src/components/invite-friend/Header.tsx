"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header Content */}
      <div className="bg-white border-b border-[#E5E8EB] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="w-6 h-6 flex items-center justify-center p-1 rounded-md hover:bg-gray-100 transition-colors touch-manipulation"
            aria-label="Go back"
          >
            <img
              src="/icons/arrow-left-icon.svg"
              alt="Back"
              width="24"
              height="24"
              className="w-6 h-6"
            />
          </button>

          {/* Title */}
          <h1 className="text-[16px] font-bold text-black leading-8 -tracking-[1.7%] flex-1">
            Invite Friend
          </h1>
        </div>
      </div>
    </div>
  );
}
