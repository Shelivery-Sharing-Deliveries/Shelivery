"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const mockActiveChatrooms = [
  {
    id: "test-chatroom-1",
    shop_name: "Coop",
    shop_logo_url: "/shop-logos/Coop Logo.png",
    dormitory_name: "Test Dorm",
    last_message_at: new Date().toISOString(),
    status: "in_chat",
  },
];

const mockResolvedChatrooms = [
  {
    id: "test-chatroom-2",
    shop_name: "Lidl",
    shop_logo_url: "/shop-logos/Lidl Logo.png",
    dormitory_name: "Test Dorm",
    last_message_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    status: "resolved",
  },
];

export default function TestChatroomsPage() {
  const [showOldChats, setShowOldChats] = useState(false);
  const router = useRouter();

  const handleChatroomSelect = (chatroomId: string) => {
    router.push(`/test/chatrooms/${chatroomId}`);
  };

  const headerContent = (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-shelivery-text-primary mb-2">
        Your Chatrooms
      </h1>
      <p className="text-shelivery-text-secondary">
        Access your active conversations
      </p>
    </div>
  );

  return (
    <PageLayout header={headerContent} showNavigation={false}>
      <div className="space-y-4 py-2">
        {mockActiveChatrooms.map((chatroom) => (
          <div
            key={chatroom.id}
            className="bg-white rounded-shelivery-lg p-4 border border-gray-200 hover:border-shelivery-primary-blue transition-colors cursor-pointer"
            onClick={() => handleChatroomSelect(chatroom.id)}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-[54px] h-[54px] rounded-[12px] bg-cover bg-center flex-shrink-0 overflow-hidden"
                style={{ backgroundImage: chatroom.shop_logo_url ? `url(${chatroom.shop_logo_url.replace(/ /g, "%20")})` : 'none' }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-shelivery-text-primary">
                      {chatroom.dormitory_name} {chatroom.shop_name} Group
                    </h3>
                  </div>
                  <svg
                    className="w-5 h-5 text-shelivery-text-tertiary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <p className="text-sm text-shelivery-text-secondary mt-1">
                  Last activity:{" "}
                  {new Date(chatroom.last_message_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mockResolvedChatrooms.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <button
            className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 rounded-md text-gray-700 font-semibold text-left"
            onClick={() => setShowOldChats(!showOldChats)}
          >
            <span>Archive ({mockResolvedChatrooms.length})</span>
            {showOldChats ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {showOldChats && (
            <div className="mt-4 space-y-4">
              {mockResolvedChatrooms.map((chatroom) => (
                <div
                  key={chatroom.id}
                  className="bg-white rounded-shelivery-lg p-4 border border-gray-200 hover:border-shelivery-primary-blue transition-colors cursor-pointer"
                  onClick={() => handleChatroomSelect(chatroom.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-[54px] h-[54px] rounded-[12px] bg-cover bg-center flex-shrink-0 overflow-hidden"
                      style={{ backgroundImage: chatroom.shop_logo_url ? `url(${chatroom.shop_logo_url.replace(/ /g, "%20")})` : 'none' }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-shelivery-text-primary">
                            {chatroom.dormitory_name} {chatroom.shop_name} Group
                          </h3>
                        </div>
                        <svg
                          className="w-5 h-5 text-shelivery-text-tertiary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-shelivery-text-secondary mt-1">
                        Last activity:{" "}
                        {new Date(chatroom.last_message_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Status: Resolved</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
