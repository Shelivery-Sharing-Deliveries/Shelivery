"use client";

interface InviteCardProps {
  className?: string;
}

export default function InviteCard({ className = "" }: InviteCardProps) {
  return (
    <div className={`flex flex-col items-center gap-4 w-full ${className}`}>
      {/* Illustration Container */}
      <div className="relative w-[205px] h-[205px] flex items-center justify-center">
        {/* Background Shape */}
        <div className="absolute inset-0 bg-[#FFFADF] rounded-full"></div>

        {/* Main Illustration */}
        <div className="relative w-[205px] h-[205px] rounded-full overflow-hidden">
          <img
            src="/icons/invite-illustration.png"
            alt="Group shopping illustration"
            width={205}
            height={205}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-center gap-4 w-full">
        <h1 className="text-[16px] font-bold text-black leading-8 text-center">
          Group up, Save more !
        </h1>
        <p className="text-[14px] font-normal text-black leading-[17px] text-left w-full">
          Add Your Friend, share the order and unlock free delivery together
        </p>
      </div>
    </div>
  );
}
