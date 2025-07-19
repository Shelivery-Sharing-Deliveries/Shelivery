"use client";

import { Tables } from "@/lib/supabase";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { X, Crown, CheckCircle, Clock } from "lucide-react";

interface MembersListProps {
  members: Array<
    Tables<"user"> & {
      basket: Tables<"basket"> | null;
    }
  >;
  isAdmin: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function MembersList({
  members,
  isAdmin,
  onClose,
  onRefresh,
}: MembersListProps) {
  const admins = members.filter(
    (member) => member.basket && member.basket.status === "in_chat"
  );
  const activeMembers = members.filter((member) => member.basket);
  const totalAmount = members.reduce(
    (sum, member) => sum + (member.basket?.amount || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Members ({members.length})
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                ${totalAmount}
              </div>
              <div className="text-sm text-gray-600">Total Pool</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {activeMembers.length}
              </div>
              <div className="text-sm text-gray-600">Active Orders</div>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  member.basket
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar
                      src={member?.image}
                      name={member?.email?.split('@')[0] || "Unknown"}
                      size="sm"
                    />
                    {isAdmin && member.basket && (
                      <div className="absolute -top-1 -right-1">
                        <Crown className="h-3 w-3 text-yellow-500" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {member?.first_name ||
                        member.email.split("@")[0]}
                    </div>
                    <div className="text-xs text-gray-600">
                      {member?.first_name ? member.email : ""}
                    </div>
                    {member.basket && (
                      <div className="text-xs text-gray-600 mt-1">
                        Order: ${member.basket.amount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {member.basket ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        Ready
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">Waiting</span>
                    </div>
                  )}
                </div>
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

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-3">
            {isAdmin && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  // Handle invite more members
                }}
              >
                Invite Members
              </Button>
            )}
            <Button variant="primary" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
