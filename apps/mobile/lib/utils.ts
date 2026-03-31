// Utility functions for Shelivery mobile app
// Adapted from src/lib/utils.ts

import { useEffect, useState } from "react";

// Simple style merging utility for React Native
export function mergeStyles(...styles: any[]) {
  return styles.filter(Boolean).reduce((acc, style) => {
    if (Array.isArray(style)) {
      return { ...acc, ...mergeStyles(...style) };
    }
    if (typeof style === 'object') {
      return { ...acc, ...style };
    }
    return acc;
  }, {});
}

// Format expireAt timestamp into days, hours, minutes string
export function formatTimeLeft(expireAt: string): string {
  const now = new Date();
  const expireDate = new Date(expireAt);
  let diffMs = expireDate.getTime() - now.getTime();

  if (diffMs <= 0) return "Expired";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  diffMs -= days * 1000 * 60 * 60 * 24;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * 1000 * 60 * 60;

  const minutes = Math.floor(diffMs / (1000 * 60));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(" ") : "Less than a minute";
}

// Custom React hook to return a live-updating formatted time left string
export function useAutoUpdatingTimeLeft(expireAt: string, intervalMs: number = 60 * 1000) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(expireAt));

  useEffect(() => {
    const update = () => setTimeLeft(formatTimeLeft(expireAt));
    update(); // initial set

    const interval = setInterval(update, intervalMs);

    return () => clearInterval(interval);
  }, [expireAt, intervalMs]);

  return timeLeft;
}

// Helper to get initials from a name
export function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Helper to get a consistent color for initials based on name
export function getInitialsColor(name?: string): string {
  const initialsColors = [
    '#3B82F6', // blue-500
    '#10B981', // green-500
    '#F59E0B', // yellow-500
    '#8B5CF6', // purple-500
    '#EC4899', // pink-500
    '#6366F1', // indigo-500
  ];

  const colorIndex = name ? name.charCodeAt(0) % initialsColors.length : 0;
  return initialsColors[colorIndex];
}

// Optimize image URLs for React Native (simplified version)
export function optimizeImageUrl(src?: string | null): string {
  if (!src) return '';
  
  // For now, return the src as-is
  // In a real implementation, you might want to:
  // - Use different image sizes for mobile
  // - Handle different storage providers
  // - Add caching strategies
  
  return src;
}