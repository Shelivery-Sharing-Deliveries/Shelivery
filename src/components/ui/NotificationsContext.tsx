"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/hooks/useAuth"; // adjust path
import { pushNotificationManager } from "@/lib/push-notifications";

interface NotificationConfig {
  id?: string;
  type: "info" | "warning" | "success" | "timer";
  title: string;
  message: string;
  dismissible?: boolean;
  duration?: number;
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
  const [queue, setQueue] = useState<NotificationConfig[]>([]);
  const supabase = createClientComponentClient();
  const { user, loading: authLoading } = useAuth();

  const notify = useCallback((config: NotificationConfig) => {
    setQueue((prev) => [...prev, config]);
  }, []);

  const dismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  const current = queue[0];

  // Mark as read after showing
  useEffect(() => {
    if (current?.id) {
      supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", current.id)
        .then();
    }
  }, [current?.id, supabase]);

  // Auto-dismiss after duration
  useEffect(() => {
    if (!current) return;
    if (current.dismissible === false) return;

    const duration = current.duration ?? 3000;

    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [current, dismiss]);

  // Fetch unread notifications on load
  useEffect(() => {
    if (authLoading || !user?.id) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false });

      if (data) {
        const mapped = data.map((notif) => ({
          id: notif.id,
          type: notif.type || "info",
          title: notif.title,
          message: notif.message,
          dismissible: true,
          duration: 5000,
        }));

        setQueue((prev) => [...prev, ...mapped]);
      }
    };

    fetchNotifications();
  }, [user?.id, authLoading, supabase]);

  // Initialize push notifications when user is authenticated
  useEffect(() => {
    if (authLoading || !user?.id) return;

    const initializePushNotifications = async () => {
      try {
        // Check if push notifications are supported
        if (!pushNotificationManager.isSupported()) {
          console.log('Push notifications not supported on this device');
          return;
        }

        // Check current permission status
        const permission = pushNotificationManager.getPermissionStatus();
        
        // If permission is granted, ensure user is subscribed
        if (permission === 'granted') {
          const status = await pushNotificationManager.getSubscriptionStatus();
          if (!status.isSubscribed) {
            // Auto-subscribe if permission is granted but not subscribed
            await pushNotificationManager.subscribe();
          }
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializePushNotifications();
  }, [user?.id, authLoading]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (authLoading || !user?.id) return;

    const channel = supabase
      .channel(`notifications:user:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notif = payload.new;
          setTimeout(() => {
          notify({
            id: notif.id,
            type: notif.type || "info",
            title: notif.title,
            message: notif.message,
            dismissible: true,
            duration: 5000,
          });
          }, 0);
          //console.log("New notification received:", notif);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, authLoading, notify, supabase]);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {current && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center">
          <div className="w-full max-w-md">
            <NotificationBanner
              {...current}
              {...(current.dismissible !== false && { onDismiss: dismiss })}
            />
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
