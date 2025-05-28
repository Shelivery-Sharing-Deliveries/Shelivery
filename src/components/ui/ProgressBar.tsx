"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";

interface ProgressBarProps {
  current: number;
  target: number;
  users?: Array<{
    id: string;
    name: string;
    avatar?: string | null;
    amount: number;
  }>;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  current,
  target,
  users = [],
  className,
  showPercentage = true,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = percentage >= 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="shelivery-progress-bar">
          <div
            className={cn(
              "shelivery-progress-fill",
              isComplete && "shelivery-progress-current",
              animated && "pool-progress-animate"
            )}
            style={{ transform: `scaleX(${percentage / 100})` }}
          />
        </div>

        {/* User avatars positioned along progress bar */}
        {users.length > 0 && (
          <div className="absolute -top-6 left-0 right-0 flex justify-between items-end">
            {users.map((user, index) => {
              const userPercentage = users
                .slice(0, index + 1)
                .reduce((sum, u) => sum + u.amount, 0);
              const position = Math.min((userPercentage / target) * 100, 100);

              return (
                <div
                  key={user.id}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${position}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="sm"
                    className={cn(
                      "transition-all duration-300",
                      userPercentage <= current ? "opacity-100" : "opacity-50"
                    )}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress information */}
      <div className="flex justify-between items-center text-sm">
        <div className="text-shelivery-text-secondary">
          ${current.toFixed(2)} / ${target.toFixed(2)}
        </div>
        {showPercentage && (
          <div className="text-shelivery-text-primary font-medium">
            {percentage.toFixed(0)}%
          </div>
        )}
      </div>

      {/* Completion status */}
      {isComplete && (
        <div className="text-center">
          <span className="shelivery-badge shelivery-badge-delivered">
            Pool Complete!
          </span>
        </div>
      )}
    </div>
  );
}
