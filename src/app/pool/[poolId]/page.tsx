"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { supabase } from "@/lib/supabase"; // Supabase client import
import { useAuth } from "@/hooks/useAuth"; // useAuth hook import
import { Button } from "@/components/ui/Button"; // Assuming you have a Button component

// Define interfaces for fetched data from Supabase
interface FetchedShop {
    id: string;
    name: string;
    logo_url: string | null;
    min_amount: number;
}

interface FetchedUserProfile {
    id: string;
    first_name: string | null;
    image: string | null; // User avatar URL
}

interface FetchedBasket {
    id: string;
    user_id: string;
    shop_id: string;
    pool_id: string;
    amount: number;
    link: string;
    status: 'in_pool' | 'in_chat' | 'resolved';
    is_ready: boolean;
    chatroom_id: string;
    created_at: string;
    user: FetchedUserProfile | null; // Joined user profile data
}

interface FetchedPool {
    id: string;
    shop_id: string;
    created_at: string;
    status: string; // Pool status (e.g., 'open', 'closed')
    shop: FetchedShop | null; // Joined shop data
}

// Interface for processed data to be displayed in the UI
interface PoolPageData {
    shopName: string;
    shopLogo: string | null;
    shopId: string; // ADDED: shopId for navigation
    poolTotal: number; // Sum of all basket amounts in the pool
    currentAmount: number; // Sum of 'ready' basket amounts in the pool
    userAmount: number; // Current user's basket amount
    minAmount: number; // Shop's minimum order amount
    userBasket: {
        id: string;
        total: number;
        link: string; // This is the 'link' from basket
        isReady: boolean; // Current user's basket ready status
    } | null;
    participants: Array<{
        id: string;
        avatar: string;
        amount: number;
        name: string;
    }>;
    poolStatus: string; // Status of the pool itself
}

export default function PoolPage({ params }: { params: { poolId: string } }) {
    const router = useRouter();
    const { user: currentUser, loading: authLoading } = useAuth(); // Get current user from auth hook
    const poolId = params.poolId as string;

    const [poolData, setPoolData] = useState<PoolPageData | null>(null);
    const [loading, setLoading] = useState(true); // For data fetching
    const [error, setError] = useState<string | null>(null);
    const [isReadyLocal, setIsReadyLocal] = useState(false); // Local state for immediate UI feedback

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !currentUser) {
            router.push("/auth");
        }
    }, [currentUser, authLoading, router]);

    // Function to fetch all necessary data
    const fetchData = useCallback(async () => {
        // Only proceed if user is authenticated and poolId is available
        if (!currentUser || !poolId) {
            setLoading(false);
            return;
        }

        setLoading(true); // Start loading for data fetching
        setError(null);

        try {
            // 1. Fetch Pool and Shop Data
            const { data: poolResult, error: poolError } = await supabase
                .from("pools")
                .select(`
          *,
          shop (
            id,
            name,
            logo_url,
            min_amount
          )
        `)
                .eq("id", poolId)
                .single();

            if (poolError) {
                // Enhance error message for specific Supabase single() errors
                if (poolError.code === 'PGRST116') { // No rows found
                    throw new Error("Pool not found. It might have been deleted or never existed.");
                } else if (poolError.code === 'PGRST117') { // Multiple rows found
                    throw new Error("Multiple pools found for this ID. Data integrity issue.");
                }
                throw poolError; // Re-throw other errors
            }
            if (!poolResult || !poolResult.shop) {
                throw new Error("Pool or associated shop data is incomplete.");
            }

            const fetchedPool: FetchedPool = poolResult;
            const fetchedShop: FetchedShop = fetchedPool.shop;

            // 2. Fetch all Baskets for this Pool, including user profiles
            const { data: basketsResult, error: basketsError } = await supabase
                .from("baskets")
                .select(`
          id,
          user_id,
          amount,
          link,
          status,
          is_ready,
          created_at,
          user:user_id (
            id,
            first_name,
            image
          )
        `)
                .eq("pool_id", poolId);

            if (basketsError) {
                throw basketsError;
            }

            const fetchedBaskets: FetchedBasket[] = basketsResult || [];

            // Process data for UI
            let calculatedPoolTotal = 0;
            let calculatedCurrentAmount = 0;
            let currentUserBasket: FetchedBasket | null = null;
            const participants: PoolPageData['participants'] = [];

            for (const basket of fetchedBaskets) {
                calculatedPoolTotal += basket.amount;

                if (basket.is_ready) {
                    calculatedCurrentAmount += basket.amount;
                }

                if (basket.user_id === currentUser.id) {
                    currentUserBasket = basket;
                    setIsReadyLocal(basket.is_ready); // Sync local state with DB
                }

                // Add participant if user data is available
                if (basket.user) {
                    participants.push({
                        id: basket.user.id,
                        avatar: basket.user.image || "/avatars/default-avatar.png", // Fallback avatar
                        amount: basket.amount,
                        name: basket.user.first_name || "Anonymous User", // Fallback name
                    });
                }
            }

            setPoolData({
                shopName: fetchedShop.name,
                shopLogo: fetchedShop.logo_url,
                shopId: fetchedShop.id, // ADDED: Store shop ID
                poolTotal: calculatedPoolTotal,
                currentAmount: calculatedCurrentAmount,
                userAmount: currentUserBasket?.amount || 0,
                minAmount: fetchedShop.min_amount,
                userBasket: currentUserBasket ? {
                    id: currentUserBasket.id,
                    total: currentUserBasket.amount,
                    link: currentUserBasket.link,
                    isReady: currentUserBasket.is_ready,
                } : null,
                participants: participants,
                poolStatus: fetchedPool.status,
            });

        } catch (err: any) {
            console.error("Error fetching pool data:", err);
            setError(err.message || "Failed to load pool data.");
        } finally {
            setLoading(false); // End loading for data fetching
        }
    }, [currentUser, poolId]); // Depend on currentUser and poolId

    // Fetch data on component mount and when currentUser or poolId changes
    useEffect(() => {
        // Only fetch if user is authenticated and not already loading auth
        if (currentUser && !authLoading) {
            fetchData();
        }
    }, [currentUser, authLoading, fetchData]);

    // Handle 'Ready To Order' / 'Cancel' toggle
    const handleToggleReady = async () => {
        if (!currentUser || !poolData?.userBasket) return;

        setLoading(true); // Show loading while updating
        setError(null);

        const newIsReadyStatus = !poolData.userBasket.isReady;

        try {
            const { error: updateError } = await supabase
                .from("baskets")
                .update({ is_ready: newIsReadyStatus })
                .eq("id", poolData.userBasket.id)
                .eq("user_id", currentUser.id); // Ensure only current user's basket is updated

            if (updateError) {
                throw updateError;
            }

            // Optimistically update UI and then re-fetch for consistency
            setIsReadyLocal(newIsReadyStatus);
            await fetchData(); // Re-fetch all data to update pool totals and participant list
        } catch (err: any) {
            console.error("Error updating basket ready status:", err);
            setError(err.message || "Failed to update ready status.");
            setLoading(false); // Stop loading on error
        }
    };

    // MODIFIED: handleEdit to use shopId for navigation
    const handleEdit = () => {
        if (poolData?.userBasket && poolData.shopId) { // Ensure shopId is available
            // Navigate to BasketCreationPage with basket data for editing
            router.push(`/shops/${poolData.shopId}/basket?basketId=${poolData.userBasket.id}&link=${encodeURIComponent(poolData.userBasket.link)}&amount=${poolData.userBasket.total}`);
        } else {
            console.log("No user basket or shop ID to edit.");
            setError("Cannot edit: Basket or Shop information is missing.");
        }
    };

    const handleDelete = async () => {
        if (!currentUser || !poolData?.userBasket) return;

        // Replaced window.confirm with a simple console log for now, as window.confirm is not allowed in Canvas.
        // In a real app, you'd use a custom modal for confirmation.
        console.log("Confirm deletion of basket:", poolData.userBasket.id);
        // if (!window.confirm("Are you sure you want to delete your basket? This action cannot be undone.")) {
        //   return; // User cancelled
        // }

        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from("baskets")
                .delete()
                .eq("id", poolData.userBasket.id)
                .eq("user_id", currentUser.id); // Ensure only current user's basket is deleted

            if (deleteError) {
                throw deleteError;
            }

            console.log("Basket deleted successfully.");
            router.push("/dashboard"); // Redirect to dashboard after deletion
        } catch (err: any) {
            console.error("Error deleting basket:", err);
            setError(err.message || "Failed to delete basket.");
            setLoading(false);
        }
    };

    // Render loading/error states for the page
    // Check authLoading first, then general loading, then error, then no poolData
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#A4A7AE]">Authenticating...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, useEffect will redirect. Return null to prevent rendering.
    if (!currentUser) {
        return null;
    }

    if (loading) { // This loading state is for data fetching after authentication
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#A4A7AE]">Loading pool data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Error Loading Pool
                    </h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                </div>
            </div>
        );
    }

    if (!poolData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Pool Not Found
                    </h2>
                    <p className="text-gray-600 mb-6">
                        The pool you are looking for does not exist or you do not have access.
                    </p>
                    <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                </div>
            </div>
        );
    }

    // Determine if the current user's basket is ready based on local state
    const isUserBasketReady = isReadyLocal; // Using local state for immediate feedback

    return (
        <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto">
            {/* Header */}
            <div className="w-[375px] h-auto">
                {/* Header Bar */}
                <div className="bg-white border-b border-[#E5E8EB] px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()} // Use router.back() for consistent navigation
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

                {/* Content */}
                <div className="flex flex-col justify-between items-center gap-8 px-4 py-6 min-h-[calc(100vh-120px)]">
                    {/* Main Card */}
                    <div className="w-[355px] bg-[#FFFADF] border border-[#E5E8EB] rounded-[24px] p-4 flex flex-col items-center gap-4">
                        {/* User Info Section */}
                        <div className="flex flex-col items-center gap-3 w-[233px]">
                            {/* User Avatar - Display current user's avatar */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#EFF1F3]">
                                <Image
                                    src={currentUser?.user_metadata?.avatar_url || "/avatars/User Avatar.png"} // Assuming avatar_url from user_metadata or default
                                    alt="User Avatar"
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Title and Description */}
                            <div className="flex flex-col items-center gap-2">
                                <h2 className="text-[#111827] font-poppins text-base font-bold text-center">
                                    {isUserBasketReady ? "Joining Soon" : "Ready To Join ?"}
                                </h2>
                                <p className="text-[#374151] font-poppins text-sm font-medium text-center">
                                    {isUserBasketReady
                                        ? "We're collecting enough orders to active free shipping"
                                        : "You can still edit or delete this basket. Tap ready when your done."}
                                </p>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div className="w-full">
                            {/* Pool Progress Labels */}
                            <div className="flex justify-between items-center mb-2">
                                {isUserBasketReady && (
                                    <span className="text-[#111827] font-poppins text-xs font-semibold">
                                        You CHF {poolData.userAmount.toFixed(2)}
                                    </span>
                                )}
                                <span className="text-[#111827] font-poppins text-[10px] font-semibold ml-auto">
                                    Pool Total CHF {poolData.poolTotal.toFixed(2)} / Min CHF {poolData.minAmount.toFixed(2)}
                                </span>
                            </div>

                            {/* Dynamic ProgressBar Component */}
                            <ProgressBar
                                current={poolData.currentAmount}
                                target={poolData.minAmount}
                                users={poolData.participants}
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
                                        Your Basket Total
                                    </span>
                                    <span className="text-[#374151] font-poppins text-sm">
                                        CHF {poolData.userBasket?.total.toFixed(2) || "0.00"}
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
                                        Basket Link
                                    </span>
                                    <a
                                        href={poolData.userBasket?.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#4C8FD3] font-poppins text-xs leading-tight break-all underline hover:text-[#245B7B]"
                                    >
                                        {poolData.userBasket?.link || "N/A"}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {!isUserBasketReady && (
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
                    </div>

                    {/* Bottom Action Button */}
                    <Button
                        onClick={handleToggleReady}
                        className={`w-[343px] h-14 rounded-2xl px-4 py-3 flex items-center justify-center ${isUserBasketReady
                                ? "bg-[#F04438] hover:bg-[#D92D20]" // Red for Cancel
                                : "bg-[#FFDB0D] hover:bg-[#F7C600]" // Yellow for Ready To Order
                            } transition-colors`}
                        disabled={loading} // Disable during loading/updating
                    >
                        <span className="text-white font-poppins text-lg font-semibold">
                            {isUserBasketReady ? "Cancel Ready" : "Ready To Order"}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
