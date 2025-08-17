"use client";

import React from "react";
// Import the ShareButton component as it will replace the copy button
import ShareButton from "@/components/ui/ShareButtons"; 

interface InviteFormProps {
  inviteCode: string;
  // onCopyCode is no longer needed as ShareButton will handle the sharing
  // onCopyCode: () => void; 
  onInviteFriend: () => void; // This button still exists
  className?: string;
  // NEW: Prop to receive the full invite link for the ShareButton
  fullInviteLink: string; 
}

export default function InviteForm({
  inviteCode,
  // onCopyCode, // Removed from destructuring
  onInviteFriend,
  className = "",
  fullInviteLink, // Destructure the new prop
}: InviteFormProps) {
  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {/* Invite Code Field */}
      <div className="flex flex-col gap-1 w-full">
        <div className="w-[343px] mx-auto">
          <div className="bg-white border border-[#E5E8EB] rounded-[18px] px-4 py-3 flex items-center justify-between gap-2">
            {/* Code Display */}
            <div className="flex items-center">
              <span className="text-[14px] font-normal text-[#111827] leading-5">
                {inviteCode}
              </span>
            </div>

            {/* REPLACE Copy Button with ShareButton */}
            {/* ShareButton will handle its own click logic (Web Share API or clipboard fallback) */}
            <ShareButton content={fullInviteLink} />
          </div>
        </div>
      </div>

      {/* Invite Friend Button - remains unchanged as per "dont change anything else" */}
      <div className="w-[343px] mx-auto">
        <button
          onClick={onInviteFriend}
          className="w-full bg-[#FFDB0D] rounded-[16px] px-0 py-3 flex items-center justify-center h-14"
        >
          <span className="text-black text-[18px] font-semibold leading-[26px]">
            Invite your friend
          </span>
        </button>
      </div>
    </div>
  );
}
