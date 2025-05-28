"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null | undefined;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "shelivery-avatar-sm",
  md: "shelivery-avatar-md",
  lg: "shelivery-avatar-lg",
  xl: "shelivery-avatar-xl",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initialsColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  const colorIndex = name ? name.charCodeAt(0) % initialsColors.length : 0;
  const backgroundColor = initialsColors[colorIndex];

  return (
    <div className={cn("shelivery-avatar", sizeClasses[size], className)}>
      {src && !imageError ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center text-white font-medium",
            backgroundColor
          )}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
