"use client";

import { NotificationProvider } from "@/components/ui/NotificationsContext";
import TestNavbar from "@/components/ui/TestNavbar";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow pb-[74px]">{children}</main>
        <TestNavbar />
      </div>
    </NotificationProvider>
  );
}
