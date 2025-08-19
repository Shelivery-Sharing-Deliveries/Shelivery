"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Crown, MoreVertical, X, ExternalLink, FileText, CheckCheck } from "lucide-react";
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

// UPDATED: ChatMember interface to include 'is_delivered_by_user'
interface ChatMember extends User {
  basket: {
    id: string;
    user_id: string;
    shop_id: number;
    link: string | null;
    note: string | null;
    amount: number;
    status: "resolved" | "in_pool" | "in_chat";
    is_ready: boolean;
    pool_id: string | null;
    chatroom_id: string | null;
    created_at: string;
    updated_at: string;
    is_delivered_by_user: boolean | null; // NEW: Added
  } | null;
}

// UPDATED: ChatMembersListProps interface to include 'state'
interface ChatMembersListProps {
  members: ChatMember[];
  currentUser: User | null;
  adminId: string;
  isCurrentUserAdmin: boolean;
  onMakeAdmin: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  state: "waiting" | "active" | "ordered" | "delivered" | "resolved" | "canceled"; // NEW: Add this prop
}

export function ChatMembersList({
  members,
  currentUser,
  adminId,
  isCurrentUserAdmin,
  onMakeAdmin,
  onRemoveMember,
  state, // NEW: Destructure the state prop
}: ChatMembersListProps) {
  const [showActions, setShowActions] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState<string | null>(null);
  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const isOrderDelivered = state === "delivered" || state === "resolved";

  const getMemberDisplayName = (member: ChatMember) => {
    if (member.first_name && member.last_name) {
      return `${capitalize(member.first_name)} ${capitalize(member.last_name)}`;
    }
    if (member.first_name) {
      return member.first_name;
    }
    return member.email.split("@")[0];
  };

  const getMemberBasketAmount = (member: ChatMember) => {
    return member.basket?.amount || 0;
  };

  // NEW: Function to get the status text for a member
  const getMemberStatus = (member: ChatMember) => {
      if (isOrderDelivered && member.basket?.is_delivered_by_user) {
          return "Delivery Confirmed";
      }
      if (member.basket?.is_ready) {
          return "Ready to order";
      }
      return `${getMemberBasketAmount(member)} CHF order`; // Fallback to existing display
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
                <div className="font-medium text-gray-900 text-sm flex items-center gap-1">
                  {getMemberDisplayName(member)}
                  {member.id === currentUser?.id && (
                    <span className="text-xs text-gray-500 ml-1">(You)</span>
                  )}
                  {/* NEW: Delivery confirmation icon (no tooltip) */}
                  {isOrderDelivered && member.basket?.is_delivered_by_user && (
                    <CheckCheck className="h-4 w-4 text-green-500" />
                  )}
                </div>
                {/* UPDATED: Use the new getMemberStatus function */}
                <div className="text-xs text-gray-600">
                  {getMemberStatus(member)}
                </div>
                {/* Order details button - only visible to admin */}
                {isCurrentUserAdmin && (member.basket?.link || member.basket?.note) && (
                  <button
                    onClick={() => setShowOrderDetails(member.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline block mt-1 text-left"
                  >
                    View Order Details
                  </button>
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

      {/* Order Details Popup */}
      {showOrderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            {(() => {
              const member = members.find(m => m.id === showOrderDetails);
              if (!member || !member.basket) return null;

              return (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={member.image}
                        name={getMemberDisplayName(member) || "User"}
                        size="sm"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getMemberDisplayName(member)}'s Order
                        </h3>
                        <p className="text-sm text-gray-600">
                          {member.basket.amount} CHF
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowOrderDetails(null)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    {member.basket.link && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900 text-sm">
                            Basket Link
                          </span>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <a
                            href={member.basket.link.startsWith('http://') || member.basket.link.startsWith('https://') 
                              ? member.basket.link 
                              : `https://${member.basket.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm break-all underline"
                          >
                            {member.basket.link}
                          </a>
                        </div>
                      </div>
                    )}

                    {member.basket.note && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900 text-sm">
                            Order Note
                          </span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {member.basket.note}
                          </p>
                        </div>
                      </div>
                    )}

                    {!member.basket.link && !member.basket.note && (
                      <div className="text-center py-6">
                        <div className="text-gray-400 mb-2">📝</div>
                        <p className="text-gray-600 text-sm">
                          No order details provided
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-200">
                    <Button
                      onClick={() => setShowOrderDetails(null)}
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      Close
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}