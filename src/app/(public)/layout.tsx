"use client";

import { NotificationProvider } from "@/components/ui/NotificationsContext";
import { useUserActivity } from '@/hooks/useActivity';
import { useAuth } from "@/hooks/useAuth";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  // Call hook only when user is available and auth is done
  useUserActivity(!authLoading && user ? user.id : null);

  return (
      <NotificationProvider>
        {children}
      </NotificationProvider>
  );
}
