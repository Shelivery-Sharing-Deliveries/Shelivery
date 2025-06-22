"use client";

import { useState } from "react";
import { X, Info, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface NotificationBannerProps {
  type: "info" | "warning" | "success" | "timer";
  title: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function NotificationBanner({
  type,
  title,
  message,
  dismissible = true,
  onDismiss,
  action,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getTypeConfig = () => {
    switch (type) {
      case "info":
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          textColor: "text-blue-900",
          icon: Info,
        };
      case "warning":
        return {
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600",
          textColor: "text-yellow-900",
          icon: AlertTriangle,
        };
      case "success":
        return {
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconColor: "text-green-600",
          textColor: "text-green-900",
          icon: CheckCircle,
        };
      case "timer":
        return {
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          iconColor: "text-orange-600",
          textColor: "text-orange-900",
          icon: Clock,
        };
      default:
        return {
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconColor: "text-gray-600",
          textColor: "text-gray-900",
          icon: Info,
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-4 mx-4 mb-4`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${config.textColor} mb-1`}>
            {title}
          </h4>
          <p className={`text-sm ${config.textColor} opacity-80`}>{message}</p>

          {/* Action Button */}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 text-sm font-medium ${config.iconColor} underline hover:no-underline`}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Preset notification components for common use cases
export function OrderPlacedBanner({ onDismiss }: { onDismiss?: () => void }) {
  const props = {
    type: "success" as const,
    title: "Order Placed Successfully",
    message:
      "The group order has been placed. Waiting for delivery confirmation.",
    ...(onDismiss && { onDismiss }),
  };
  return <NotificationBanner {...props} />;
}

export function OrderDeliveredBanner({
  onDismiss,
}: {
  onDismiss?: () => void;
}) {
  const props = {
    type: "success" as const,
    title: "Order Delivered",
    message:
      "All items have been delivered. You can now leave the group or stay to track final deliveries.",
    ...(onDismiss && { onDismiss }),
  };
  return <NotificationBanner {...props} />;
}

export function TimeRunningOutBanner({
  timeLeft,
  onExtend,
  onDismiss,
}: {
  timeLeft: string;
  onExtend: () => void;
  onDismiss?: () => void;
}) {
  const props = {
    type: "timer" as const,
    title: "Time Running Out",
    message: `Only ${timeLeft} left to place the group order.`,
    action: {
      label: "Extend Time",
      onClick: onExtend,
    },
    ...(onDismiss && { onDismiss }),
  };
  return <NotificationBanner {...props} />;
}

export function NewMemberBanner({
  memberName,
  onDismiss,
}: {
  memberName: string;
  onDismiss?: () => void;
}) {
  const props = {
    type: "info" as const,
    title: "New Member Joined",
    message: `${memberName} has joined the group chat.`,
    ...(onDismiss && { onDismiss }),
  };
  return <NotificationBanner {...props} />;
}

export function AdminAssignedBanner({
  adminName,
  onDismiss,
}: {
  adminName: string;
  onDismiss?: () => void;
}) {
  const props = {
    type: "info" as const,
    title: "New Admin Assigned",
    message: `${adminName} is now an admin and can help manage the group order.`,
    ...(onDismiss && { onDismiss }),
  };
  return <NotificationBanner {...props} />;
}
