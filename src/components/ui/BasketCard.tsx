"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";

interface BasketCardProps {
  id: string;
  shopName: string;
  shopLogo?: string | null | undefined;
  amount: number;
  isReady: boolean;
  status: "in_pool" | "in_chat" | "resolved";
  link?: string | null;
  onToggleReady?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  variant?: "small" | "large";
  className?: string;
}

const statusColors = {
  in_pool: "shelivery-badge-waiting",
  in_chat: "shelivery-badge-ordering",
  resolved: "shelivery-badge-delivered",
};

const statusLabels = {
  in_pool: "In Pool",
  in_chat: "In Chat",
  resolved: "Delivered",
};

export function BasketCard({
  id,
  shopName,
  shopLogo,
  amount,
  isReady,
  status,
  link,
  onToggleReady,
  onEdit,
  onDelete,
  variant = "large",
  className,
}: BasketCardProps) {
  const isInteractive = status === "in_pool";

  return (
    <div
      className={cn(
        "shelivery-basket-card",
        variant === "small"
          ? "shelivery-basket-card-small"
          : "shelivery-basket-card-large",
        className
      )}
    >
      {/* Header with shop info and status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar
            src={shopLogo}
            name={shopName}
            size={variant === "small" ? "sm" : "md"}
            className="border-2 border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-shelivery-text-primary truncate">
              {shopName}
            </h3>
            <p className="text-sm text-shelivery-text-secondary">
              Total: ${amount.toFixed(2)}
            </p>
          </div>
        </div>

        <span className={cn("shelivery-badge", statusColors[status])}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Actions for interactive baskets */}
      {isInteractive && variant === "large" && (
        <div className="flex flex-col space-y-3 mt-4">
          {/* Ready toggle */}
          <button
            onClick={onToggleReady}
            className={cn(
              "ready-toggle w-full py-2",
              isReady ? "ready-toggle-active" : "ready-toggle-inactive"
            )}
          >
            {isReady ? "Ready to Order" : "Mark as Ready"}
          </button>

          {/* Secondary actions */}
          <div className="flex space-x-2">
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2 text-sm text-shelivery-primary-blue hover:underline"
              >
                View Items
              </a>
            )}

            {onEdit && (
              <button
                onClick={onEdit}
                className="shelivery-button-secondary flex-1"
              >
                Edit
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 text-sm text-shelivery-error-red hover:bg-red-50 rounded-shelivery-sm transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Compact view for small variant */}
      {variant === "small" && (
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-shelivery-text-tertiary">
            {isReady ? "✓ Ready" : "⏳ Pending"}
          </div>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-shelivery-primary-blue hover:underline"
            >
              View
            </a>
          )}
        </div>
      )}
    </div>
  );
}
