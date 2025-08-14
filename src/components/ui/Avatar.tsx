"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "shelivery-avatar-sm", // e.g. w-8 h-8
  md: "shelivery-avatar-md", // e.g. w-10 h-10
  lg: "shelivery-avatar-lg", // e.g. w-12 h-12
  xl: "shelivery-avatar-xl", // e.g. w-16 h-16
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

  // Resize if backend supports (Supabase example)
  const optimizedSrc =
    src && src.includes("supabase")
      ? `${src}?width=128&quality=70`
      : src || "";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full flex items-center justify-center text-white font-medium",
        sizeClasses[size],
        className
      )}
    >
      {optimizedSrc && !imageError ? (
        <Image
          src={optimizedSrc}
          alt={name || "Avatar"}
          fill
          sizes="64px"
          className="object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center",
            backgroundColor
          )}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}
