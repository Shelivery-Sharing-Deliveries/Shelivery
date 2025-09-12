"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageLayout } from '@/components/ui/PageLayout';
import ShareButtons from "@/components/ui/ShareButtons";

const mockPoolData = {
  shopName: "Migros",
  shopLogo: "/shop-logos/Migros Logo.png",
  poolTotal: 100,
  currentAmount: 55,
  userAmount: 25.50,
  minAmount: 100,
  userBasket: {
    total: 25.50,
    itemsUrl: "https://www.migros.ch/en/product/123456",
    itemsNote: "Please get the organic bananas.",
  },
  participants: [
    { id: 1, avatar: "/avatars/User Avatar.png", amount: 25.50 },
    { id: 2, avatar: "/avatars/Others Avatar 01.png", amount: 29.50 },
  ],
};

export default function TestPoolPage({ params }: { params: { basketId: string } }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleToggleReady = () => {
    setIsReady(!isReady);
  };

  const handleGoToChat = () => {
    router.push(`/test/chatrooms/test-chatroom-1`);
  };

  const isPoolFilled = mockPoolData.currentAmount >= mockPoolData.minAmount;

  let buttonText = "";
  let buttonColorClass = "";
  let buttonOnClick = () => { };

  if (isPoolFilled && isReady) {
    buttonText = "Chat";
    buttonColorClass = "bg-[#4C8FD3] hover:bg-[#3A70A6]";
    buttonOnClick = handleGoToChat;
  } else if (isReady) {
    buttonText = "Cancel";
    buttonColorClass = "bg-[#F04438] hover:bg-[#D92D20]";
    buttonOnClick = handleToggleReady;
  } else {
    buttonText = "Ready To Order & Join Pool";
    buttonColorClass = "bg-[#FFDB0D] hover:bg-[#F7C600]";
    buttonOnClick = handleToggleReady;
  }

  const poolHeader = (
    <div className="flex items-center gap-4">
      <button onClick={handleBack} className="w-6 h-6 flex items-center justify-center">
        <Image src="/icons/back-arrow.svg" alt="Back" width={20} height={20} />
      </button>
      <div className="flex flex-col">
        <h1 className="text-black font-poppins text-base font-bold leading-6">
          {mockPoolData.shopName} Basket
        </h1>
      </div>
      <div className="flex-1"></div>
      <ShareButtons content={`Join me in the Shelivery pool for ${mockPoolData.shopName}!`} />
    </div>
  );

  return (
    <PageLayout header={poolHeader} showNavigation={false}>
      <div className="flex flex-col justify-between items-center gap-8 py-6">
        <div className="w-full bg-[#FFFADF] border border-[#E5E8EB] rounded-[24px] p-4 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#EFF1F3]">
            <Image
              src={mockPoolData.shopLogo}
              alt={mockPoolData.shopName + " Logo"}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-[#111827] font-poppins text-base font-bold text-center">
              {isReady ? "Joining Soon" : "Ready To Join ?"}
            </h2>
            <p className="text-[#374151] font-poppins text-sm font-medium text-center">
              {isReady
                ? "We're collecting enough orders to activate free shipping."
                : "You can still edit or delete this basket. Tap ready when you're done."}
            </p>
          </div>
        </div>
        <div className="w-full">
          <div className="flex justify-between items-center mb-2">
            {isReady && (
              <span className="text-[#111827] font-poppins text-xs font-semibold">
                You {mockPoolData.userAmount} CHF
              </span>
            )}
            <span className="text-[#111827] font-poppins text-[10px] font-semibold ml-auto">
              Pool Total {mockPoolData.currentAmount} CHF / {mockPoolData.minAmount} CHF
            </span>
          </div>
          <ProgressBar
            current={mockPoolData.currentAmount}
            target={mockPoolData.minAmount}
            users={[]}
            showPercentage={false}
            animated={true}
            className="w-full"
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          {/* Details Section... */}
        </div>
        <button
          onClick={buttonOnClick}
          className={`w-full h-14 rounded-2xl px-4 py-3 flex items-center justify-center ${buttonColorClass} transition-colors mt-auto`}
        >
          <span className="text-white font-poppins text-lg font-semibold">
            {buttonText}
          </span>
        </button>
      </div>
    </PageLayout>
  );
}
