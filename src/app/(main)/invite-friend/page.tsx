"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/invite-friend/Header";
import InviteCard from "@/components/invite-friend/InviteCard";
import InviteForm from "@/components/invite-friend/InviteForm";
import { generateInvite } from "@/lib/invites";
import { PageLayout } from "@/components/ui";

export default function InviteFriendPage() {
  const { user, loading: authLoading } = useAuth();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      //router.push("/auth"); // ✅ redirect to your actual auth flow
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
    alert("Invite code copied!");
  };

  const handleInviteFriend = () => {
    if (!inviteCode) return;
    const fullUrl = `${window.location.origin}/auth?invite=${inviteCode}`;
    navigator.clipboard.writeText(fullUrl);
    alert("Invite link copied! Send it to your friend.");
  };

  const headerContent = (
    <Header />
  );


  return (
      <PageLayout header={headerContent}> 

      <div className="flex-1 px-4 py-6 flex flex-col items-center gap-6">
        {loading ? (
          <p>Loading your invite code...</p>
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
