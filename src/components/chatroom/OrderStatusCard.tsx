"use client";

import { Tables } from "@/lib/supabase";
import {
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  Package,
  Truck,
} from "lucide-react";

interface OrderStatusCardProps {
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
  onMarkOrdered: () => void;
  onMarkDelivered: () => void;
  onExtendTime: () => void;
  timeLeft: { hours: number; minutes: number };
  canExtend: boolean;
}

export function OrderStatusCard({
  chatroom,
  members,
  onMarkOrdered,
  onMarkDelivered,
  onExtendTime,
  timeLeft,
  canExtend,
}: OrderStatusCardProps) {
  const totalAmount = members.reduce(
    (sum, member) => sum + (member.basket?.amount || 0),
    0
  );
  const activeMembers = members.filter((member) => member.basket);

  const getStatusConfig = () => {
    switch (chatroom.state) {
      case "waiting":
        return {
          color: "bg-yellow-50 border-yellow-200",
          icon: Clock,
          iconColor: "text-yellow-600",
          title: "Waiting to Order",
          description: "Coordinate with members and place the group order",
        };
      case "ordered":
        return {
          color: "bg-blue-50 border-blue-200",
          icon: Package,
          iconColor: "text-blue-600",
          title: "Order Placed",
          description: "Waiting for delivery confirmation",
        };
      case "resolved":
        return {
          color: "bg-green-50 border-green-200",
          icon: CheckCircle,
          iconColor: "text-green-600",
          title: "Order Delivered",
          description: "All items have been delivered successfully",
        };
      default:
        return {
          color: "bg-gray-50 border-gray-200",
          icon: Clock,
          iconColor: "text-gray-600",
          title: "Unknown Status",
          description: "",
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className={`mx-4 my-4 p-4 rounded-2xl border ${status.color}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-full bg-white ${status.iconColor}`}>
          <StatusIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{status.title}</h3>
          <p className="text-sm text-gray-600">{status.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="font-bold text-lg text-gray-900">${totalAmount}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <Users className="w-4 h-4" />
          </div>
          <div className="font-bold text-lg text-gray-900">
            {activeMembers.length}
          </div>
          <div className="text-xs text-gray-600">Members</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <div className="font-bold text-lg text-gray-900">
            {timeLeft.hours}h {timeLeft.minutes}m
          </div>
          <div className="text-xs text-gray-600">Left</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {chatroom.state === "waiting" && (
          <button
            onClick={onMarkOrdered}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Mark as Ordered
          </button>
        )}

        {chatroom.state === "ordered" && (
          <button
            onClick={onMarkDelivered}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            Mark as Delivered
          </button>
        )}

        {timeLeft.hours < 5 && canExtend && chatroom.state === "waiting" && (
          <button
            onClick={onExtendTime}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Extend Time (+2h)
          </button>
        )}
      </div>
    </div>
  );
}
