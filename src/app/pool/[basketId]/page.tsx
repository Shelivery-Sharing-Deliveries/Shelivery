"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { supabase } from "@/lib/supabase"; // Make sure this import path is correct for your project

interface PoolPageProps {
  params: {
    basketId: string; // Changed from poolId to basketId as per your provided code
  };
}

// Mock data based on Figma design
const mockPoolData = {
  shopName: "Migros",
  shopLogo: "/shop-logos/Migros Logo.png",
  poolTotal: 150,
  currentAmount: 110,
  userAmount: 40,
  minAmount: poolTotal,
  userBasket: {
    total: 20,
    itemsUrl:
      "https://www.coop.ch/en/share-list/invitation accept/FED57ACD-3296-4DA2-9D8B-CBCDCFE31E3B",
  },
  participants: [
    { id: 1, avatar: "/avatars/User Avatar.png", amount: 20 },
    { id: 2, avatar: "/avatars/Others Avatar 01.png", amount: 30 },
    { id: 3, avatar: "/avatars/Others Avatar 02.png", amount: 25 },
    { id: 4, avatar: "/avatars/Others Avatar 03.png", amount: 35 },
    { id: 5, avatar: "/avatars/Others Avatar 04.png", amount: 15 },
    { id: 6, avatar: "/avatars/User Avatar.png", amount: 25 },
  ],
};

export default function PoolPage({ params }: PoolPageProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // <--- DECLARED HERE
  const [error, setError] = useState<string | null>(null); // <--- DECLARED HERE

  const handleBack = () => {
    router.back();
  };

  const handleToggleReady = async () => {
    if (isLoading) return; // Prevent multiple clicks while a request is in progress

    setIsLoading(true); // Start loading
    setError(null); // Clear previous errors

    const newIsReadyState = !isReady; // Determine the desired new state (true or false)
    const basketIdToUpdate = params.basketId; // Use basketId from params

    try {
      const { data, error: supabaseError } = await supabase
        .from('basket') // Target the 'basket' table
        .update({ is_ready: newIsReadyState }) // Set the 'is_ready' column to the new state
        .eq('id', basketIdToUpdate) // Find the row where 'id' matches the basketIdToUpdate
        .select(); // To get the updated data back, though not strictly necessary for this use case

      if (supabaseError) {
        // Handle Supabase-specific errors (e.g., RLS violation, network issues)
        console.error('Supabase update error:', supabaseError);
        setError(supabaseError.message || 'Failed to update basket status via Supabase.');
        return;
      }

      if (data && data.length > 0) {
        // If the update was successful and data was returned
        setIsReady(newIsReadyState); // Update local state
        console.log(`Basket ${basketIdToUpdate} 'is_ready' set to ${newIsReadyState}`);
      } else {
        // This might happen if the basketId doesn't exist or RLS prevented the update silently
        // Check Supabase dashboard logs for more details in such cases.
        setError('Basket not found or permission denied.');
        console.warn(`Basket ${basketIdToUpdate} not found or update failed silently.`);
      }
    } catch (generalError) {
      // Catch any unexpected errors during the async operation (e.g., network down)
      console.error('General error during update:', generalError);
      setError('An unexpected error occurred. Please check your network connection.');
    } finally {
      setIsLoading(false); // End loading, regardless of success or failure
    }
  };

  const handleEdit = () => {
    // TODO: Navigate to edit basket
    console.log("Edit basket");
  };

  const handleDelete = () => {
    // TODO: Handle delete basket
    console.log("Delete basket");
  };

  const progressPercentage = isReady
    ? ((mockPoolData.currentAmount + mockPoolData.userAmount) /
        mockPoolData.minAmount) *
      100
    : (mockPoolData.currentAmount / mockPoolData.minAmount) * 100;

  return (
    <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto">
      {/* Header */}
      <div className="w-[375px] h-auto">
        {/* System Bar - Skip as requested */}

        {/* Header Bar */}
        <div className="bg-white border-b border-[#E5E8EB] px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="w-6 h-6 flex items-center justify-center"
              >
                <Image
                  src="/icons/back-arrow.svg"
                  alt="Back"
                  width={20}
                  height={20}
                />
              </button>
              <div className="flex flex-col">
                <h1 className="text-black font-poppins text-base font-bold leading-6">
                  {mockPoolData.shopName} Basket
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between items-center gap-8 px-4 py-6 min-h-[calc(100vh-120px)]">
        {/* Main Card */}
        <div className="w-[355px] bg-[#FFFADF] border border-[#E5E8EB] rounded-[24px] p-4 flex flex-col items-center gap-4">
          {/* User Info Section */}
          <div className="flex flex-col items-center gap-3 w-[233px]">
            {/* User Avatar */}
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#EFF1F3]">
              <Image
                src="/avatars/User Avatar.png"
                alt="User Avatar"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title and Description */}
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-[#111827] font-poppins text-base font-bold text-center">
                {isReady ? "Joining Soon" : "Ready To Join ?"}
              </h2>
              <p className="text-[#374151] font-poppins text-sm font-medium text-center">
                {isReady
                  ? "We're collecting enough orders to active free shipping"
                  : "You can still edit or delete this basket. Tap ready when your done."}
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="w-full">
            {/* Pool Progress Labels */}
            <div className="flex justify-between items-center mb-2">
              {isReady && (
                <span className="text-[#111827] font-poppins text-xs font-semibold">
                  You ${mockPoolData.userAmount}
                </span>
              )}
              <span className="text-[#111827] font-poppins text-[10px] font-semibold ml-auto">
                Pool Total ${mockPoolData.poolTotal}
              </span>
            </div>

            {/* Dynamic ProgressBar Component */}
            <ProgressBar
              current={
                isReady
                  ? mockPoolData.currentAmount + mockPoolData.userAmount
                  : mockPoolData.currentAmount
              }
              target={mockPoolData.minAmount}
              users={mockPoolData.participants.map((participant) => ({
                id: participant.id.toString(),
                name: `User ${participant.id}`,
                avatar: participant.avatar,
                amount: participant.amount,
              }))}
              showPercentage={false}
              animated={true}
              className="w-full"
            />
          </div>

          {/* Details Section */}
          <div className="w-full flex flex-col gap-2">
            {/* Total */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#292D32"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="7.5" r="3" />
                  <path d="M16 11.5v3c0 1.1-.9 2-2 2H10c-1.1 0-2-.9-2-2v-3" />
                  <path d="M12 7v8" />
                  <path d="M8 7h8" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[#111827] font-poppins text-sm font-semibold">
                  Total
                </span>
                <span className="text-[#374151] font-poppins text-sm">
                  $
                  {isReady
                    ? mockPoolData.userAmount
                    : mockPoolData.userBasket.total}
                </span>
              </div>
            </div>

            {/* Items Detail */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 flex items-center justify-center mt-0.5">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#292D32"
                  strokeWidth="1.5"
                >
                  <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[#111827] font-poppins text-sm font-semibold">
                  Items Detail
                </span>
                <span className="text-[#4C8FD3] font-poppins text-xs leading-tight break-all">
                  {mockPoolData.userBasket.itemsUrl}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isReady && (
            <div className="flex gap-3 w-[311px]">
              <button
                onClick={handleEdit}
                className="flex-1 bg-[#EAF7FF] border border-[#D8F0FE] rounded-lg px-4 py-2 flex items-center justify-center gap-1.5 h-9"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#245B7B"
                  strokeWidth="1.5"
                >
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span className="text-[#245B7B] font-poppins text-xs font-semibold">
                  Edit
                </span>
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-[#FEF3F2] border border-[#FEE4E2] rounded-lg px-4 py-2 flex items-center justify-center gap-1.5 h-9"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B42318"
                  strokeWidth="1.5"
                >
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                <span className="text-[#B42318] font-poppins text-xs font-semibold">
                  Delete
                </span>
              </button>
            </div>
          )}
          {error && ( // Display error message if present
            <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
          )}
        </div>

        {/* Bottom Action Button */}
        <button
          onClick={handleToggleReady}
          disabled={isLoading} // Disable button when loading
          className={`w-[343px] h-14 rounded-2xl px-4 py-3 flex items-center justify-center ${
            isReady
              ? "bg-[#F04438] hover:bg-[#D92D20]"
              : "bg-[#FFDB0D] hover:bg-[#F7C600]"
          } transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-white font-poppins text-lg font-semibold">
            {isLoading ? (isReady ? "Cancelling..." : "Setting Ready...") : (isReady ? "Cancel" : "Ready To Order")}
          </span>
        </button>
      </div>
    </div>
  );
}