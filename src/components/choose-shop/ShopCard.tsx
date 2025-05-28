"use client";

import Image from "next/image";

interface Shop {
  id: string;
  name: string;
  logo: string;
  minAmount: string;
  currentAmount: string;
  progress: number;
}

interface ShopCardProps {
  shop: Shop;
  onClick: () => void;
  isSelected?: boolean;
}

export default function ShopCard({
  shop,
  onClick,
  isSelected = false,
}: ShopCardProps) {
  // Convert string amounts to numbers for progress calculation
  const currentValue = parseFloat(shop.currentAmount.replace("$", ""));
  const targetValue = parseFloat(shop.minAmount.replace("$", ""));

  return (
    <div
      onClick={onClick}
      className={`w-full rounded-[18px] p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-[#EAF7FF] border border-[#245B7B] shadow-lg"
          : "bg-white border border-[#EFF1F3] hover:shadow-sm"
      }`}
    >
      {/* Shop Info Section */}
      <div className="flex flex-col items-center gap-3 mb-3">
        {/* Shop Logo */}
        <div className="w-[70px] h-[70px] rounded-[12px] overflow-hidden border border-[#EFF1F3]">
          <Image
            src={shop.logo}
            alt={shop.name}
            width={70}
            height={70}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Shop Details */}
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-[14px] font-bold text-black text-center">
            {shop.name}
          </h3>
          <p className="text-[12px] font-normal text-black text-center">
            Free Shipping: +{shop.minAmount}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="flex flex-col gap-2">
        {/* Simple Progress Bar */}
        <div className="w-full">
          <div className="w-full h-1 bg-[#E5E8EB] rounded-lg overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#245B7B] to-[#FFDB0D] rounded-lg transition-all duration-300"
              style={{ width: `${Math.min(shop.progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Amount Display */}
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-normal text-[#111827]">
            {shop.currentAmount}
          </span>
        </div>
      </div>
    </div>
  );
}
