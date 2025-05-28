"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/invite-friend/Header";
import InviteCard from "@/components/invite-friend/InviteCard";
import InviteForm from "@/components/invite-friend/InviteForm";

export default function InviteFriendPage() {
  const [inviteCode] = useState("FH554D25");
  const router = useRouter();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    // You could add a toast notification here
  };

  const handleInviteFriend = () => {
    // Handle invite friend logic
    console.log("Inviting friend...");
    // For now, navigate back
    router.back();
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto flex flex-col">
      {/* Header */}
      <Header />

      {/* Content Section */}
      <div className="flex-1 px-4 py-6 flex flex-col items-center gap-6">
        {/* Main Content */}
        <div className="flex flex-col items-center gap-4 w-full">
          <InviteCard />
        </div>

        {/* Form Section */}
        <div className="w-full">
          <InviteForm
            inviteCode={inviteCode}
            onCopyCode={handleCopyCode}
            onInviteFriend={handleInviteFriend}
          />
        </div>
      </div>
    </div>
  );
}
