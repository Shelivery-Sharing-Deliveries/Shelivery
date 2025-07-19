import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useEffect, useState } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
