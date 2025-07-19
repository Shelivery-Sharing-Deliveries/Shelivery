"use client";

import { Tables } from "@/lib/supabase";
import { AlertTriangle, Info, CheckCircle, Clock, Users } from "lucide-react";

interface ChatNotificationsProps {
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
  isAdmin: boolean;
}

export function ChatNotifications({
  chatroom,
  members,
  isAdmin,
}: ChatNotificationsProps) {
  const getTimeLeft = () => {
    if (!chatroom.created_at) return 0;
    const createdAt = new Date(chatroom.created_at);
    const now = new Date();
    const hoursPassed =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 24 - hoursPassed);
  };

  const timeLeft = getTimeLeft();
  const totalAmount = members.reduce(
    (sum, member) => sum + (member.basket?.amount || 0),
    0
  );
  const activeMembers = members.filter((member) => member.basket);

  // Different notification states
  const notifications = [];

  // Welcome notification for new chatrooms
  if (chatroom.state === "waiting" && timeLeft > 20) {
    notifications.push({
      id: "welcome",
      type: "info" as const,
      icon: <Users className="h-4 w-4" />,
      title: "Welcome to your group order!",
      message: `You have ${Math.round(timeLeft)} hours to coordinate and place your order from ${chatroom.pool.shop.name}.`,
    });
  }

  // Time warnings
  if (timeLeft <= 5 && timeLeft > 1 && chatroom.state !== "resolved") {
    notifications.push({
      id: "time-warning",
      type: "warning" as const,
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "Time running out!",
      message: `Only ${Math.round(timeLeft)} hours left to place your order. ${isAdmin ? "Consider extending the time if needed." : ""}`,
    });
  }

  if (timeLeft <= 1 && timeLeft > 0 && chatroom.state !== "resolved") {
    notifications.push({
      id: "time-critical",
      type: "error" as const,
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "Final hour!",
      message: `Less than 1 hour remaining! ${isAdmin ? "Place the order soon or extend time." : "Waiting for admin to place the order."}`,
    });
  }

  // Order status notifications
  if (chatroom.state === "ordered") {
    notifications.push({
      id: "order-placed",
      type: "success" as const,
      icon: <CheckCircle className="h-4 w-4" />,
      title: "Order placed successfully!",
      message: `Your group order of $${totalAmount} has been placed. Tracking information will be shared when available.`,
    });
  }

  if (chatroom.state === "resolved") {
    notifications.push({
      id: "order-delivered",
      type: "success" as const,
      icon: <CheckCircle className="h-4 w-4" />,
      title: "Order delivered!",
      message:
        "Your group order has been delivered successfully. Don't forget to leave feedback!",
    });
  }

  // Admin-specific notifications
  if (isAdmin && chatroom.state === "waiting" && activeMembers.length >= 2) {
    notifications.push({
      id: "ready-to-order",
      type: "info" as const,
      icon: <Info className="h-4 w-4" />,
      title: "Ready to place order",
      message: `${activeMembers.length} members with $${totalAmount} total. You can now coordinate and place the group order.`,
    });
  }

  if (notifications.length === 0) return null;

  return (
    <div className="px-4 py-3 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-3 rounded-lg border ${
            notification.type === "info"
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : notification.type === "warning"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                  : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div
            className={`flex-shrink-0 ${
              notification.type === "info"
                ? "text-blue-600"
                : notification.type === "success"
                  ? "text-green-600"
                  : notification.type === "warning"
                    ? "text-yellow-600"
                    : "text-red-600"
            }`}
          >
            {notification.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <p className="text-sm mt-1 opacity-90">{notification.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
