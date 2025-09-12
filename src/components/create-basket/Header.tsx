"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface Shop {
  id: string;
  name: string;
  logo: string;
}

interface HeaderProps {
  className?: string;
  shop?: Shop | null;
}

export default function Header({ className = "", shop }: HeaderProps) {
  const handleBack = () => {
    router.back();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header Content */}
      <div className="bg-white border-b border-[#E5E8EB] px-4 py-3 safe-area-top">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors touch-manipulation"
            aria-label="Go back"
          >
            <img
              src="/icons/arrow-left-icon.svg"
              alt="Back"
              width="20"
              height="20"
              className="w-5 h-5"
            />
          </button>

          {/* Title or Shop Info */}
          {shop ? (
            <div className="flex items-center gap-2">
              <Image src={shop.logo} alt={shop.name} width={24} height={24} className="rounded-full" />
              <h1 className="text-[16px] font-bold text-black leading-[24px] flex-1 truncate">
                {shop.name}
              </h1>
            </div>
          ) : (
            <h1 className="text-[16px] font-bold text-black leading-[24px] flex-1 truncate">
              Enter Order Details
            </h1>
          )}
        </div>
      </div>
    </div>
  );
}