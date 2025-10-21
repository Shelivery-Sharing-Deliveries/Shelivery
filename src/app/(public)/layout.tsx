"use client";

import { NotificationProvider } from "@/components/ui/NotificationsContext";
import { PWAProvider, usePWAPopup } from "@/contexts/PWAContext";
import PWAInstallGuidePopup from "@/components/homepage/PWAInstallGuidePopup";
import { useUserActivity } from '@/hooks/useActivity';
import { useAuth } from "@/hooks/useAuth";

function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { showPwaPopup, setShowPwaPopup } = usePWAPopup();
  
  // Call hook only when user is available and auth is done
  useUserActivity(!authLoading && user ? user.id : null);

  return (
    <>
      <NotificationProvider>
        {children}
      </NotificationProvider>
      <PWAInstallGuidePopup 
        isOpen={showPwaPopup} 
        onClose={() => setShowPwaPopup(false)} 
      />
    </>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PWAProvider>
      <PublicLayoutContent>{children}</PublicLayoutContent>
    </PWAProvider>
  );
}
