"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { useEffect, useState } from "react";

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
  showAmount?: boolean;
  currency?: string;
  variant?: 'default' | 'shops' | 'pool';
}

export function ProgressBar({
  current,
  target,
  users = [],
  className,
  showPercentage = true,
  animated = true,
  showAmount = true,
  currency = "CHF",
  variant = "default",
}: ProgressBarProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Safely parse current and target to ensure they are numbers
  // If they are not valid numbers, default to 0
  const safeCurrent = typeof current === 'number' ? current : parseFloat(current as any) || 0;
  const safeTarget = typeof target === 'number' ? target : parseFloat(target as any) || 0;

  // Calculate percentage using the safe numerical values
  const percentage = safeTarget > 0 ? Math.min((safeCurrent / safeTarget) * 100, 100) : 0;
  const isComplete = percentage >= 100;

  // Effect to mark component as loaded on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Determine fill color based on variant
  const getFillClasses = () => {
    const transitionClasses = isLoaded ? "transition-all duration-500 ease-out" : "";

    switch (variant) {
      case 'shops':
        return cn(
          "bg-shelivery-primary-blue h-full transform-gpu origin-left",
          transitionClasses
        );
      case 'pool':
        return cn(
          "bg-shelivery-success-green h-full transform-gpu origin-left",
          transitionClasses
        );
      default:
        return cn(
          "shelivery-progress-fill",
          isComplete && "shelivery-progress-current",
          "transform-gpu origin-left",
          transitionClasses
        );
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="shelivery-progress-bar">
          <div
            className={getFillClasses()}
            style={{ transform: `scaleX(${percentage / 100})` }}
          />
          {/* Wave overlay - only shows within filled portion */}
          {animated && percentage > 0 && (
            <div
              className="wave-overlay"
              style={{
                maskImage: `linear-gradient(to right, transparent 0%, white ${percentage}%, transparent ${percentage}%)`,
                WebkitMaskImage: `linear-gradient(to right, transparent 0%, white ${percentage}%, transparent ${percentage}%)`,
                opacity: percentage > 10 ? 1 : percentage / 10, // Fade in wave as progress increases
              }}
            />
          )}
        </div>

        {/* User avatars positioned along progress bar */}
        {users.length > 0 && (
          <div className="absolute -top-6 left-0 right-0 flex justify-between items-end">
            {users.map((user, index) => {
              // Safely calculate userPercentage as well
              const userPercentageAmount = users
                .slice(0, index + 1)
                .reduce((sum, u) => sum + (typeof u.amount === 'number' ? u.amount : parseFloat(u.amount as any) || 0), 0);
              const position = safeTarget > 0 ? Math.min((userPercentageAmount / safeTarget) * 100, 100) : 0;

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
                      // Ensure comparison with safeCurrent
                      userPercentageAmount <= safeCurrent ? "opacity-100" : "opacity-50"
                    )}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress information */}
      {showAmount && (
        <div className="flex justify-between items-center text-sm">
          <div className="text-shelivery-text-secondary">
            {safeCurrent.toFixed(0)} / {safeTarget.toFixed(0)}
            {currency && ` ${currency}`}
          </div>
          {showPercentage && (
            <div className="text-shelivery-text-primary font-medium">
              {percentage.toFixed(0)}%
            </div>
          )}
        </div>
      )}

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
