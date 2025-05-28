"use client";

interface InviteFormProps {
  inviteCode: string;
  onCopyCode: () => void;
  onInviteFriend: () => void;
  className?: string;
}

export default function InviteForm({
  inviteCode,
  onCopyCode,
  onInviteFriend,
  className = "",
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

            {/* Copy Button */}
            <button
              onClick={onCopyCode}
              className="bg-[#245B7B] rounded-lg px-0 py-2 flex items-center justify-center min-w-[111px] h-9"
            >
              <span className="text-white text-[12px] font-semibold leading-4">
                Copy
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Invite Friend Button */}
      <div className="w-[343px] mx-auto">
        <button
          onClick={onInviteFriend}
          className="w-full bg-[#FFDB0D] rounded-[16px] px-0 py-3 flex items-center justify-center h-14"
        >
          <span className="text-black text-[18px] font-semibold leading-[26px]">
            Invite you friend
          </span>
        </button>
      </div>
    </div>
  );
}
