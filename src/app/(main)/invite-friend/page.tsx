"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/invite-friend/Header";
import InviteCard from "@/components/invite-friend/InviteCard";
import InviteForm from "@/components/invite-friend/InviteForm";
import { generateInvite } from "@/lib/invites";
import { PageLayout } from "@/components/ui/PageLayout"; // Corrected import path for PageLayout

export default function InviteFriendPage() {
  const { user, loading: authLoading } = useAuth();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      //router.push("/auth"); // ✅ redirect to your actual auth flow
      console.log("No user found, redirecting to auth flow."); // Replaced alert
      return;
    }

    const fetchCode = async () => {
      const code = await generateInvite(user.id);
      setInviteCode(code);
      setLoading(false);
    };

    fetchCode();
  }, [user, authLoading, router]);

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    console.log("Invite code copied!"); // Replaced alert
    // In a real app, you might show a toast notification here
  };

  const handleInviteFriend = () => {
    if (!inviteCode) return;
    const fullUrl = `${window.location.origin}/auth?invite=${inviteCode}`;
    navigator.clipboard.writeText(fullUrl);
    console.log("Invite link copied! Send it to your friend."); // Replaced alert
    // In a real app, you might show a toast notification here
  };

  // Extract the Header component to be passed as the 'header' prop
  const headerContent = (
    <Header />
  );

  return (
    // Wrap the entire page content with PageLayout
    // The headerContent will be rendered in the fixed header area.
    // showNavigation is true by default, but you can set it to false if this page doesn't need it.
    <PageLayout header={headerContent}> 
      {/*
        The main content area. PageLayout already provides horizontal padding (px-4)
        and manages overall layout, so removed redundant padding and flex-1 from here.
      */}
      <div className="flex flex-col items-center gap-6 py-6 w-full"> {/* Added w-full for full width within PageLayout's content area */}
        {loading ? (
          <p className="text-gray-600">Loading your invite code...</p>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 w-full">
              <InviteCard />
            </div>

            <div className="w-full">
              <InviteForm
                inviteCode={inviteCode || ""}
                onCopyCode={handleCopyCode}
                onInviteFriend={handleInviteFriend}
              />
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
