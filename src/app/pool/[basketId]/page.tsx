"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { supabase } from "@/lib/supabase";

// 1. Define Interfaces for the Data Structure
interface ShopData {
  name: string;
  logo_url: string;
}

interface PoolInfo {
  min_amount: number;
  current_amount: number;
}

interface BasketData {
  id: string; // Assuming basketId is UUID or similar
  shop_id: string;
  pool_id: string;
  amount: number; // This is the user's basket amount
  link: string; // The items URL
  is_ready: boolean;
  shop: ShopData; // Nested shop data from join
  pool: PoolInfo; // Nested pool data from join
}

// Interface for the structured data after fetching and processing
interface DisplayPoolData {
  shopName: string;
  shopLogo: string;
  poolTotal: number; // Mapped to pool.min_amount
  currentAmount: number; // Mapped to pool.amount (or whatever its actual name is)
  userAmount: number; // Mapped to basket.amount
  minAmount: number; // Mapped to pool.min_amount
  pool_id?: string; // Optional, if you want to use it in polling or realtime updates
  userBasket: {
    total: number;
    itemsUrl: string;
  };
  participants: { id: number; avatar: string; amount: number }[];
}

interface PoolPageProps {
  params: {
    basketId: string; // The ID of the basket for the current user
  };
}

const mockParticipants = [
  { id: 1, avatar: "/avatars/User Avatar.png", amount: 20 },
  { id: 2, avatar: "/avatars/Others Avatar 01.png", amount: 30 },
  { id: 3, avatar: "/avatars/Others Avatar 02.png", amount: 25 },
  { id: 4, avatar: "/avatars/Others Avatar 03.png", amount: 35 },
  { id: 5, avatar: "/avatars/Others Avatar 04.png", amount: 15 },
  { id: 6, avatar: "/avatars/User Avatar.png", amount: 25 },
];


export default function PoolPage({ params }: PoolPageProps) {
  const router = useRouter();
  const [poolData, setPoolData] = useState<DisplayPoolData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  // --- useEffect for Initial Data Fetch ---
  useEffect(() => {
    async function fetchPoolData() {
      console.log("Fetching pool data for basket ID:", params.basketId); // Debug log
      setIsPageLoading(true);
      setError(null);

      if (!params.basketId) {
        setError("No basket ID provided.");
        setIsPageLoading(false);
        return;
      }

      try {
        const { data, error: supabaseError } = await supabase
          .from('basket')
          .select(`
            id,
            amount,
            link,
            is_ready,
            shop_id,
            pool_id,
            shop (
              name,
              logo_url
            ),
            pool (
              min_amount,
              current_amount
            )
          `)
          .eq('id', params.basketId)
          .single();

        if (supabaseError) {
          console.error("Error fetching pool data:", supabaseError.message);
          setError(`Failed to load basket data: ${supabaseError.message}`);
          setPoolData(null);
          return;
        }

        if (data) {
          //console.log("Fetched basket data:", data); // Debug log

          const fetchedBasket: BasketData = data as unknown as BasketData;

          if (!fetchedBasket.shop || !fetchedBasket.pool) {
            setError("Missing shop or pool data for this basket. Check foreign keys.");
            setPoolData(null);
            return;
          }

          const structuredData: DisplayPoolData = {
            shopName: fetchedBasket.shop.name,
            shopLogo: fetchedBasket.shop.logo_url,
            poolTotal: fetchedBasket.pool.min_amount,
            currentAmount: fetchedBasket.pool.current_amount,
            userAmount: fetchedBasket.amount,
            minAmount: fetchedBasket.pool.min_amount,
            pool_id: fetchedBasket.pool_id, // Optional, if you want to use it in polling or realtime updates
            userBasket: {
              total: fetchedBasket.amount,
              itemsUrl: fetchedBasket.link,
            },
            participants: mockParticipants,
          };

          console.log("Structured pool data:", structuredData); // Debug log
          setPoolData(structuredData);
          setIsReady(fetchedBasket.is_ready); // Initialize isReady state from fetched data
        } else {
          setError("Basket not found.");
          setPoolData(null);
        }
      } catch (generalError) {
        console.error("General fetch error:", generalError);
        setError("An unexpected error occurred while loading data.");
        setPoolData(null);
      } finally {
        setIsPageLoading(false);
      }
    }

    fetchPoolData();
  }, [params.basketId]);

// --- useEffect for Polling ---
useEffect(() => {
  if (!poolData?.pool_id) {
    return;
  }

  const POLLING_INTERVAL_MS = 500; // Poll every 5 seconds

  const intervalId = setInterval(async () => {
    try {
      const { data, error } = await supabase
        .from('pool')
        .select('current_amount, min_amount')
        .eq('id', poolData.pool_id)
        .single();

      if (error) {
        return;
      }

      if (data) {
        setPoolData(prevData => {
          if (prevData) {
            if (prevData.currentAmount !== data.current_amount || prevData.minAmount !== data.min_amount) {
              return {
                ...prevData,
                currentAmount: data.current_amount,
                minAmount: data.min_amount,
              };
            }
          }
          return prevData;
        });
      }
    } catch (pollError) {
      // Handle polling error if necessary
    }
  }, POLLING_INTERVAL_MS);

  return () => {
    clearInterval(intervalId);
  };
}, [poolData?.pool_id]); // Dependency array: the effect re-runs if pool_id changes.

// --- useEffect for Realtime Subscription ---
useEffect(() => {
  if (!poolData?.pool_id) {
    console.log("Realtime subscription skipped: pool_id not available yet."); // Debug log
    return;
  }

  console.log(`Starting realtime subscription for pool ID: ${poolData.pool_id}`); // Debug log

  const subscription = supabase
    .channel('public:pool')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'pool', filter: `id=eq.${poolData.pool_id}` },
      (payload) => {
        console.log("Realtime update received:", payload.new); // Debug log

        setPoolData(prevData => {
          if (prevData) {
            return {
              ...prevData,
              currentAmount: payload.new.current_amount,
              minAmount: payload.new.min_amount,
            };
          }
          return prevData;
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
    console.log('Realtime subscription stopped.'); // Debug log
  };
}, [poolData?.pool_id]); // Dependency array: the effect re-runs if pool_id changes.

  // --- handleToggleReady for updating is_ready status ---
  const handleToggleReady = async () => {
    if (!poolData || isButtonLoading) return;

    setIsButtonLoading(true);
    setError(null);

    const newIsReadyState = !isReady;
    const basketIdToUpdate = params.basketId;

    try {
      const { data, error: supabaseError } = await supabase
        .from('basket')
        .update({ is_ready: newIsReadyState })
        .eq('id', basketIdToUpdate)
        .select();

      if (supabaseError) {
        console.error('Supabase update error:', supabaseError);
        setError(supabaseError.message || 'Failed to update basket status via Supabase.');
        return;
      }

      if (data && data.length > 0) {
        setIsReady(newIsReadyState); // Update local state
        console.log(`Basket ${basketIdToUpdate} 'is_ready' set to ${newIsReadyState}`);
      } else {
        setError('Basket not found or permission denied for update.');
        console.warn(`Basket ${basketIdToUpdate} not found or update failed silently.`);
      }
    } catch (generalError) {
      console.error('General error during update:', generalError);
      setError('An unexpected error occurred during update.');
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleEdit = () => {
    console.log("Edit basket");
  };

  const handleDelete = () => {
    console.log("Delete basket");
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto flex items-center justify-center">
        <p className="text-gray-600 font-poppins">Loading basket data...</p>
      </div>
    );
  }

  if (error && !poolData) {
    return (
      <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto flex flex-col items-center justify-center p-4">
        <p className="text-red-600 font-poppins text-center mb-4">Error: {error}</p>
        <button
          onClick={() => router.back()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!poolData) {
    return (
      <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 font-poppins text-center mb-4">Basket not found or invalid ID.</p>
        <button
          onClick={() => router.back()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  // The progress bar will now ALWAYS use poolData.currentAmount
  const currentProgressBarAmount = poolData.currentAmount;

  return (
    <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto">
      {/* Header */}
      <div className="w-[375px] h-auto">
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
                  {poolData.shopName} Basket
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
          {/* Shop Logo */}
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#EFF1F3]">
            <Image
              src={poolData?.shopLogo || "/default-logo.png"} // Fallback for shop logo
              alt={poolData?.shopName + " Logo"}
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
                ? "We're collecting enough orders to activate free shipping."
                : "You can still edit or delete this basket. Tap ready when you're done."}
            </p>
          </div>
        </div>
 
        {/* Progress Section */}
        <div className="w-full">
          {/* Pool Progress Labels */}
          <div className="flex justify-between items-center mb-2">
            {isReady && (
              <span className="text-[#111827] font-poppins text-xs font-semibold">
                You ${poolData.userAmount}
              </span>
            )}
            <span className="text-[#111827] font-poppins text-[10px] font-semibold ml-auto">
              Pool Total ${poolData.poolTotal}
            </span>
          </div>

          {/* Dynamic ProgressBar Component */}
          <ProgressBar
            current={currentProgressBarAmount} // This now directly uses poolData.currentAmount
            target={poolData.minAmount}
            users={[]} // No users are sent to the ProgressBar
            // users={poolData.participants.map((participant) => ({
            //   id: participant.id.toString(),
            //   name: `User ${participant.id}`,
            //   // avatar: participant.avatar,
            //   amount: participant.amount,
            // }))}
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
                ${poolData.userBasket.total}
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
                {poolData.userBasket.itemsUrl}
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
        {error && (
          <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
        )}
      </div>

      {/* Bottom Action Button */}
      <button
        onClick={handleToggleReady}
        disabled={isButtonLoading}
        className={`w-[343px] h-14 rounded-2xl px-4 py-3 flex items-center justify-center ${
          isReady
            ? "bg-[#F04438] hover:bg-[#D92D20]"
            : "bg-[#FFDB0D] hover:bg-[#F7C600]"
        } transition-colors ${isButtonLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="text-white font-poppins text-lg font-semibold">
          {isButtonLoading ? (isReady ? "Cancelling..." : "Setting Ready...") : (isReady ? "Cancel" : "Ready To Order")}
        </span>
      </button>
    </div>
  );
}