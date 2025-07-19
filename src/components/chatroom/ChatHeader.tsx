"use client";

import { useRouter } from "next/navigation";
import { Tables } from "@/lib/supabase";
import { ArrowLeft, MoreVertical } from "lucide-react";

interface ChatHeaderProps {
  chatroom: Tables<"chatroom"> & {
    pool: Tables<"pool"> & {
      shop: Tables<"shop">;
      dormitory: Tables<"dormitory">;
    };
  };
  memberCount: number;
  isAdmin: boolean;
  onShowSidebar: () => void;
  onLeaveChatroom: () => void;
}

export function ChatHeader({
  chatroom,
  memberCount,
  isAdmin,
  onShowSidebar,
  onLeaveChatroom,
}: ChatHeaderProps) {
  const router = useRouter();

  const getTimeLeft = () => {
    if (!chatroom.created_at) return 0;
    const createdAt = new Date(chatroom.created_at);
    const now = new Date();
    const hoursPassed =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const hoursLeft = Math.max(0, 24 - hoursPassed);

    if (hoursLeft === 0) return "Expired";
    if (hoursLeft < 1) return `${Math.round(hoursLeft * 60)}m Left`;
    return `${Math.round(hoursLeft)}h Left`;
  };

  const getShopLogo = () => {
    const shopName = chatroom.pool.shop.name.toLowerCase();
    return `/shop-logos/${shopName.charAt(0).toUpperCase() + shopName.slice(1)} Logo.png`;
  };

  return (
    <div className="bg-white">
      {/* Main Header */}
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-100">
        {/* Left side - Back button and room info */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-0 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>

          <div className="flex items-center gap-2">
            {/* Shop avatar/logo */}
            <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center overflow-hidden relative">
              <img
                src={getShopLogo()}
                alt={chatroom.pool.shop.name}
                className="w-8 h-8 object-contain"
              />
              {/* Fallback displayed if image fails */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {chatroom.pool.shop.name.charAt(0)}
                </span>
              </div>
            </div>

            {/* Room details */}
            <div>
              <h1 className="font-bold text-base text-black leading-tight">
                {chatroom.pool.shop.name} Basket Chatroom
              </h1>
              <div className="flex items-center gap-1 text-xs text-black leading-tight mt-1">
                <span className="font-normal">
                  {memberCount} Member{memberCount !== 1 ? "s" : ""}
                </span>
                <span className="font-semibold ml-1">{getTimeLeft()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - More button */}
        <button
          onClick={onShowSidebar}
          className="p-1 hover:opacity-70 transition-opacity"
        >
          <MoreVertical className="h-6 w-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
