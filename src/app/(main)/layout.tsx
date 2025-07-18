"use client"; // must be client component

import { NotificationProvider } from "@/components/ui/NotificationsContext";
import AuthGuard from '@/lib/AuthGuard';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthGuard>
  );
}
