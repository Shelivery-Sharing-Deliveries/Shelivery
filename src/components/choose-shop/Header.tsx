"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function Header() {
  const router = useRouter();

  const handleBackClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className="px-4 py-4 border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <Button
          onClick={handleBackClick}
          className="p-2 bg-transparent text-black hover:bg-gray-100 rounded-lg"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
        <h1 className="text-[16px] font-bold text-black">Choose Your Store</h1>
        {/* Empty div for centering */}
        <div className="w-10"></div>
      </div>
    </div>
  );
}
