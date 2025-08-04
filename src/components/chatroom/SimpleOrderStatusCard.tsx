"use client";

import { Clock, Users, DollarSign, CheckCircle, Package } from "lucide-react";
import { TimeLeft } from "@/components/chatroom/TimeLeft";


interface SimpleOrderStatusCardProps {
  id?: string; // Add id prop
  state: "waiting" | "active" | "ordered" | "resolved";
  poolTotal: number;
  orderCount: number;
  timeLeft: string;
  isAdmin: boolean;
  onMarkOrdered?: () => void;
  onMarkDelivered?: () => void;
}

export function SimpleOrderStatusCard({
  id, // Destructure id prop
  state,
  poolTotal,
  orderCount,
  timeLeft,
  isAdmin,
  onMarkOrdered,
  onMarkDelivered,
}: SimpleOrderStatusCardProps) {
  const getStatusConfig = () => {
    switch (state) {
      case "waiting":
      case "active":
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
    <div id={id} className={`p-4 rounded-lg border ${status.color}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-full bg-white`}>
          <StatusIcon className={`w-5 h-5 ${status.iconColor}`} />
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
          <div className="font-bold text-lg text-gray-900">{poolTotal}CHF</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <Users className="w-4 h-4" />
          </div>
          <div className="font-bold text-lg text-gray-900">{orderCount}</div>
          <div className="text-xs text-gray-600">Members</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <div className="font-bold text-lg text-gray-900">
            <TimeLeft expireAt={timeLeft} />
            </div>
          <div className="text-xs text-gray-600">Left</div>
        </div>
      </div>

      
    </div>
  );
}
