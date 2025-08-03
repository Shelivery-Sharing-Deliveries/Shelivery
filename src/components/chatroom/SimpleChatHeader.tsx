"use client";

import { ArrowLeft, MoreVertical } from "lucide-react";
import { TimeLeft } from "@/components/chatroom/TimeLeft";


interface SimpleChatHeaderProps {
  chatroomName: string;
  memberCount: number;
  timeLeft: string;
  onBack: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  menuButtonId?: string;
}

export function SimpleChatHeader({
  chatroomName,
  memberCount,
  timeLeft,
  onBack,
  onMenuClick,
  showMenuButton = true,
  menuButtonId,
}: SimpleChatHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>

        <div className="flex-1">
          <h1 className="font-bold text-lg text-gray-900">{chatroomName}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </span>
            <span><TimeLeft expireAt={timeLeft} /></span>
          </div>
        </div>

        {showMenuButton && onMenuClick && (
          <button
            id={menuButtonId}
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
}
