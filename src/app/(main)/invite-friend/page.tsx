"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/invite-friend/Header";
import InviteCard from "@/components/invite-friend/InviteCard";
import InviteForm from "@/components/invite-friend/InviteForm";
import { generateInvite } from "@/lib/invites";
import { PageLayout } from "@/components/ui/PageLayout"; 
// ShareButton is now imported and used within InviteForm.tsx
// No need to import it directly here anymore.

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

  // handleCopyCode is no longer directly used by the InviteForm,
  // as the ShareButton now handles copying/sharing.
  // Keeping it here for now, as it might be referenced elsewhere or for future use.
  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    console.log("Invite code copied!"); // Replaced alert
    // In a real app, you might show a toast notification here
  };

  const handleInviteFriend = () => {
    if (!inviteCode) return;
    const fullUrl = `${window.location.origin}/auth?invite=${inviteCode}`;
    // The ShareButton handles copying/sharing, so this might become redundant.
    // For now, keeping it as it was part of the original onInviteFriend prop.
    navigator.clipboard.writeText(fullUrl);
    console.log("Invite link copied! Send it to your friend."); // Replaced alert
    // In a real app, you might show a toast notification here
  };

  // Generate the full invitation link for the ShareButton
  const fullInviteLink = inviteCode ? `${window.location.origin}/auth?invite=${inviteCode}` : "";

  // Extract the Header component to be passed as the 'header' prop
  const headerContent = (
    <Header />
  );

  return (
    <PageLayout header={headerContent}> 
      <div className="flex flex-col items-center gap-6 py-6 w-full">
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
                // REMOVED: onCopyCode prop as it's no longer expected by InviteForm
                onInviteFriend={handleInviteFriend}
                fullInviteLink={fullInviteLink} // Pass the full link to InviteForm for the ShareButton
              />
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
