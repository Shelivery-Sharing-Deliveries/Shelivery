"use client"; // must be client component

import { NotificationProvider } from "@/components/ui/NotificationsContext";
import AuthGuard from '@/lib/AuthGuard';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <AuthGuard>
        {/* Your protected layout content */}
        {children}
      </AuthGuard>
    </NotificationProvider>
  );
}
