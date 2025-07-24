"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Crown, MoreVertical } from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  email: string;
  dormitory_id: number | null;
  profile: any;
  created_at: string | null;
  updated_at: string | null;
  first_name: string | null;
  last_name: string | null;
  favorite_store: string | null;
  image: string | null;
}

interface ChatMember extends User {
  basket: {
    id: string;
    user_id: string;
    shop_id: number;
    link: string | null;
    amount: number;
    status: "resolved" | "in_pool" | "in_chat";
    is_ready: boolean;
    pool_id: string | null;
    chatroom_id: string | null;
    created_at: string;
    updated_at: string;
  } | null;
}

interface ChatMembersListProps {
  members: ChatMember[];
  currentUser: User | null;
  adminId: string;
  isCurrentUserAdmin: boolean;
  onMakeAdmin: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
}

export function ChatMembersList({
  members,
  currentUser,
  adminId,
  isCurrentUserAdmin,
  onMakeAdmin,
  onRemoveMember,
}: ChatMembersListProps) {
  const [showActions, setShowActions] = useState<string | null>(null);

  const getMemberDisplayName = (member: ChatMember) => {
    if (member.first_name && member.last_name) {
      return `${member.first_name} ${member.last_name}`;
    }
    if (member.first_name) {
      return member.first_name;
    }
    return member.email.split("@")[0];
  };

  const getMemberBasketAmount = (member: ChatMember) => {
    return member.basket?.amount || 0;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Members ({members.length})
        </h3>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar
                  src={member.image}
                  name={getMemberDisplayName(member) || "User"}
                  size="sm"
                />
                {member.id === adminId && (
                  <div className="absolute -top-1 -right-1">
                    <Crown className="h-3 w-3 text-yellow-500" />
                  </div>
                )}
              </div>

              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {getMemberDisplayName(member)}
                  {member.id === currentUser?.id && (
                    <span className="text-xs text-gray-500 ml-1">(You)</span>
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  {getMemberBasketAmount(member)} CHF order
                </div>
                {/* Order link - only visible to admin */}
                {isCurrentUserAdmin && member.basket?.link && (
                  <a
                    href={member.basket.link.startsWith('http://') || member.basket.link.startsWith('https://') 
                      ? member.basket.link 
                      : `https://${member.basket.link}`} // Assuming most links should be HTTPS
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline block mt-1"
                  >
                    View Order
                  </a>
                )}
              </div>
            </div>

            {/* Actions for admin */}
            {isCurrentUserAdmin && member.id !== currentUser?.id && (
              <div className="relative">
                <button
                  onClick={() =>
                    setShowActions(showActions === member.id ? null : member.id)
                  }
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>

                {showActions === member.id && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    {member.id !== adminId && (
                      <button
                        onClick={() => {
                          onMakeAdmin(member.id);
                          setShowActions(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        Make Admin
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onRemoveMember(member.id);
                        setShowActions(null);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      Remove Member
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">👥</div>
            <p className="text-gray-600">No members in this chatroom</p>
          </div>
        )}
      </div>
    </div>
  );
}
