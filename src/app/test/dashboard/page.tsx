"use client";

import { Button, PageLayout } from "@/components/ui";
import ProfileCard from "@/components/dashboard/ProfileCard";
import AddBasket from "@/components/dashboard/AddBasket";
import Baskets from "@/components/dashboard/Baskets";
import Banner from "@/components/dashboard/Banner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

// Mock data for the test page
const mockUserProfile = {
  userName: "Test User",
  userAvatar: "/avatars/default-avatar.png",
};

const mockActiveBaskets = [
  {
    id: "1",
    shopName: "Migros",
    shopLogo: "/shop-logos/Migros Logo.png",
    total: "CHF 25.50",
    status: "in_pool",
  },
  {
    id: "2",
    shopName: "Coop",
    shopLogo: "/shop-logos/Coop Logo.png",
    total: "CHF 42.00",
    status: "in_chat",
    chatroomId: "test-chatroom-1",
  },
];

const mockResolvedBaskets = [
  {
    id: "3",
    shopName: "Lidl",
    shopLogo: "/shop-logos/Lidl Logo.png",
    total: "CHF 15.00",
    status: "resolved",
    chatroomId: "test-chatroom-2",
  },
];

export default function TestDashboardPage() {
  const [showOldOrders, setShowOldOrders] = useState(false);
  const router = useRouter();

  const handleAddBasket = () => {
    router.push("/test/choose-shop");
  };

  const handleBasketClick = (basketId: string) => {
    const basket = [...mockActiveBaskets, ...mockResolvedBaskets].find(b => b.id === basketId);
    if (!basket) return;

    if (basket.status === "in_chat" && basket.chatroomId) {
      router.push(`/test/chatrooms/${basket.chatroomId}`);
    } else if (basket.status === "in_pool") {
      router.push(`/test/pool/${basket.id}`);
    } else if (basket.status === "resolved" && basket.chatroomId) {
      router.push(`/test/chatrooms/${basket.chatroomId}`);
    }
  };

  return (
    <PageLayout showNavigation={false}>
      <div className="py-1 flex justify-between items-center">
        <h1 className="text-[20px] font-bold leading-8 text-black">
          Dashboard
        </h1>
      </div>
      <ProfileCard
        userName={mockUserProfile.userName}
        userAvatar={mockUserProfile.userAvatar}
      />
      <AddBasket onClick={handleAddBasket} />
      {mockActiveBaskets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <img
            src="/graphics/empty-basket.svg"
            alt="No active baskets"
            className="mx-auto w-40 h-40"
          />
          <p className="mt-4 text-lg font-semibold">No active baskets</p>
          <p>Create a basket and have shared shopping experience!</p>
        </div>
      ) : (
        <Baskets baskets={mockActiveBaskets} onBasketClick={handleBasketClick} />
      )}
      <Banner />
      {mockResolvedBaskets.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <button
            className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 rounded-md text-gray-700 font-semibold text-left"
            onClick={() => setShowOldOrders(!showOldOrders)}
          >
            <span>Archive ({mockResolvedBaskets.length})</span>
            {showOldOrders ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {showOldOrders && (
            <div className="mt-4">
              <Baskets baskets={mockResolvedBaskets} onBasketClick={handleBasketClick} />
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
