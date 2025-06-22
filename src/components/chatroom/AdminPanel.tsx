"use client";

import { useState } from "react";
import { Tables, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  Clock,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  Timer,
} from "lucide-react";

interface AdminPanelProps {
  chatroom: Tables<"chatroom"> & {
    pool: Tables<"pool"> & {
      shop: Tables<"shop">;
      dormitory: Tables<"dormitory">;
    };
  };
  members: Array<
    Tables<"user"> & {
      basket: Tables<"basket"> | null;
    }
  >;
  onRefresh: () => void;
}

export function AdminPanel({ chatroom, members, onRefresh }: AdminPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showExtendDialog, setShowExtendDialog] = useState(false);

  const totalAmount = members.reduce(
    (sum, member) => sum + (member.basket?.amount || 0),
    0
  );

  const handleMarkAsOrdered = async () => {
    try {
      setLoading("ordering");

      const { error } = await supabase
        .from("chatroom")
        .update({ state: "ordered" })
        .eq("id", chatroom.id);

      if (error) throw error;

      onRefresh();
    } catch (err) {
      console.error("Error marking as ordered:", err);
    } finally {
      setLoading(null);
    }
  };

  const handleMarkAsDelivered = async () => {
    try {
      setLoading("delivered");

      const { error } = await supabase
        .from("chatroom")
        .update({ state: "resolved" })
        .eq("id", chatroom.id);

      if (error) throw error;

      // Update all baskets to resolved status
      await supabase
        .from("basket")
        .update({ status: "resolved" })
        .eq("chatroom_id", chatroom.id);

      onRefresh();
    } catch (err) {
      console.error("Error marking as delivered:", err);
    } finally {
      setLoading(null);
    }
  };

  const getTimeLeft = () => {
    const createdAt = new Date(chatroom.created_at);
    const now = new Date();
    const hoursPassed =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 24 - hoursPassed);
  };

  const canExtendTime = () => {
    const hoursLeft = getTimeLeft();
    return hoursLeft < 5 && hoursLeft > 0;
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Admin Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-2">Admin Panel</h2>
        <div className="text-sm text-gray-600">Manage your group order</div>
      </div>

      {/* Order Summary */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>

        <div className="space-y-3">
          {/* Total Amount */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">Pool Total</span>
            </div>
            <span className="font-semibold text-green-900">${totalAmount}</span>
          </div>

          {/* Order Count */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Orders</span>
            </div>
            <span className="font-semibold text-blue-900">
              {members.filter((m) => m.basket).length} Basket
              {members.filter((m) => m.basket).length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Time Left */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-900">Time Left</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-yellow-900">
                {Math.round(getTimeLeft())}h{" "}
                {Math.round((getTimeLeft() % 1) * 60)}m
              </span>
              {canExtendTime() && (
                <button
                  onClick={() => setShowExtendDialog(true)}
                  className="block text-xs text-yellow-700 hover:text-yellow-800 underline"
                >
                  Extend time
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">Members</h3>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={member.profile?.avatar_url}
                    name={member.profile?.display_name || member.email}
                    size="sm"
                  />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {member.profile?.display_name ||
                        member.email.split("@")[0]}
                    </div>
                    {member.basket && (
                      <div className="text-xs text-gray-600">
                        ${member.basket.amount}
                      </div>
                    )}
                  </div>
                </div>

                {member.basket && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">
                      Ready
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-white border-t border-gray-200 space-y-3">
        {chatroom.state === "waiting" && (
          <Button
            onClick={handleMarkAsOrdered}
            loading={loading === "ordering"}
            className="w-full"
            variant="secondary"
          >
            Mark as Ordered
          </Button>
        )}

        {chatroom.state === "ordered" && (
          <Button
            onClick={handleMarkAsDelivered}
            loading={loading === "delivered"}
            className="w-full"
            variant="success"
          >
            Mark as Delivered
          </Button>
        )}

        {chatroom.state === "resolved" && (
          <div className="text-center text-sm text-gray-600">
            Order completed successfully
          </div>
        )}

        <Button
          variant="error"
          className="w-full"
          onClick={() => {
            /* Handle leave chatroom */
          }}
        >
          Leave Order
        </Button>
      </div>

      {/* Extend Time Dialog */}
      {showExtendDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center mb-4">
              <Timer className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                You're running out of time
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                You can extend the chat time only once. Make sure to place the
                group order before it ends.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowExtendDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  // Handle extend time
                  setShowExtendDialog(false);
                }}
              >
                Extend
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
