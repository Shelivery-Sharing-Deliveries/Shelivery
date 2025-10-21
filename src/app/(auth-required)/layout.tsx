"use client";

import { NotificationProvider } from "@/components/ui/NotificationsContext";
import { PWAProvider, usePWAPopup } from "@/contexts/PWAContext";
import PWAInstallGuidePopup from "@/components/homepage/PWAInstallGuidePopup";
import AuthGuard from '@/lib/AuthGuard';
import { useUserActivity } from '@/hooks/useActivity';
import { useAuth } from "@/hooks/useAuth";

function AuthRequiredLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { showPwaPopup, setShowPwaPopup } = usePWAPopup();
  
  // Call hook only when user is available and auth is done
  useUserActivity(!authLoading && user ? user.id : null);

  return (
    <AuthGuard>
      <NotificationProvider>
        {children}
      </NotificationProvider>
      <PWAInstallGuidePopup 
        isOpen={showPwaPopup} 
        onClose={() => setShowPwaPopup(false)} 
      />
    </AuthGuard>
  );
}

export default function AuthRequiredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PWAProvider>
      <AuthRequiredLayoutContent>{children}</AuthRequiredLayoutContent>
    </PWAProvider>
  );
}
