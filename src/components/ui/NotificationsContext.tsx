"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { NotificationBanner } from "@/components/chatroom/NotificationBanner"; // Adjust path as needed

interface NotificationConfig {
  type: "info" | "warning" | "success" | "timer";
  title: string;
  message: string;
  dismissible?: boolean;
  duration?: number; // optional auto-dismiss duration in ms
  action?: {
    label: string;
    onClick: () => void;
  };
}

type NotifyFunction = (config: NotificationConfig) => void;

const NotificationContext = createContext<NotifyFunction>(() => {});

export function useNotify() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationConfig | null>(null);

  const notify = useCallback((config: NotificationConfig) => {
    setNotification(config);
  }, []);

  const dismiss = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    if (!notification) return;

    // If dismissible is false, don't auto-dismiss
    if (notification.dismissible === false) return;

    // Use custom duration or default to 3000 ms
    const duration = notification.duration ?? 3000;

    const timer = setTimeout(() => {
      setNotification(null);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification]);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {notification && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center">
          <div className="w-full max-w-md">
            <NotificationBanner
              {...notification}
              onDismiss={notification.dismissible !== false ? dismiss : undefined}
            />
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
