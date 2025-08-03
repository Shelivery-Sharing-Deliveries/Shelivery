// app/pool/[basketId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { supabase } from "@/lib/supabase";
import { PageLayout } from '@/components/ui/PageLayout'; // Import PageLayout
import PoolPageTutorial from "@/components/pool/PoolPageTutorial"; // NEW: Import the tutorial component

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
    id: string;
    user_id: string;
    shop_id: string;
    pool_id: string | null; // Made nullable as it can be NULL when in chatroom
    chatroom_id: string | null; // Added chatroom_id
    amount: number;
    link: string | null;
    note: string | null;
    is_ready: boolean;
    status: 'resolved' | 'in_pool' | 'in_chat'; // Added status
    shop: ShopData; // Nested shop data from join
    pool: PoolInfo | null; // Nested pool data from join, made nullable as pool_id can be null
}

interface DisplayPoolData {
    shopName: string;
    shopLogo: string;
    poolTotal: number;
    currentAmount: number;
    userAmount: number;
    minAmount: number;
    pool_id: string | null;
    shop_id: string;
    userBasket: {
        total: number;
        itemsUrl: string | null;
        itemsNote: string | null;
        status: 'resolved' | 'in_pool' | 'in_chat'; // Added status
        chatroomId: string | null; // Added chatroom ID
    };
    participants: { id: number; avatar: string; amount: number }[];
}

interface PoolPageProps {
    params: {
        basketId: string;
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
    console.log("PoolPage component rendering..."); // Debugging log
    const router = useRouter();
    const [poolData, setPoolData] = useState<DisplayPoolData | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showTutorial, setShowTutorial] = useState(() => {
        if (typeof window !== 'undefined') {
            return !localStorage.getItem('hasSeenPoolPageTutorial');
        }
        return false; // Default to false on server-side render
    }); // NEW: State for tutorial visibility


    const handleBack = () => {
        router.back();
    };

    // Function to fetch and process basket data (used for initial load and polling)
    const fetchAndProcessBasketData = async (basketId: string) => {
        try {
            const { data, error: supabaseError } = await supabase
                .from('basket') // Use singular 'basket'
                .select(`
          id,
          amount,
          link,
          note,
          is_ready,
          status,             
          shop_id,
          pool_id,
          chatroom_id,        
          shop (              
            name,
            logo_url
          ),
          pool (              
            min_amount,
            current_amount
          )
        `)
                .eq('id', basketId)
                .single();

            if (supabaseError) {
                console.error("FETCH_ERROR: Error fetching basket data:", supabaseError.message);
                throw new Error(`Failed to load basket data: ${supabaseError.message}`);
            }

            if (!data) {
                throw new Error("Basket not found.");
            }

            const fetchedBasket: BasketData = data as unknown as BasketData;

            // CRITICAL: Check for chatroom_id and status to redirect immediately
            if (fetchedBasket.status === 'in_chat' && fetchedBasket.chatroom_id) {
                console.log(`REDIRECT_TRIGGER: Basket ${basketId} is in chat state. Redirecting to chatroom ${fetchedBasket.chatroom_id}`);
                router.replace(`/chatrooms/${fetchedBasket.chatroom_id}`);
                return null; // Indicate that a redirect is happening
            }

            // Handle cases where shop or pool data might be missing (e.g., if basket is resolved)
            if (!fetchedBasket.shop || (fetchedBasket.status === 'in_pool' && !fetchedBasket.pool)) {
                if (fetchedBasket.status !== 'in_chat' && fetchedBasket.status !== 'resolved') {
                    throw new Error("Missing shop or pool data for this basket. Check foreign keys or basket status.");
                }
            }

            const structuredData: DisplayPoolData = {
                shopName: fetchedBasket.shop?.name || 'Unknown Shop',
                shopLogo: fetchedBasket.shop?.logo_url || "/shop-logos/default-logo.png",
                poolTotal: fetchedBasket.pool?.min_amount || 0,
                currentAmount: fetchedBasket.pool?.current_amount || 0,
                userAmount: fetchedBasket.amount,
                minAmount: fetchedBasket.pool?.min_amount || 0,
                pool_id: fetchedBasket.pool_id,
                shop_id: fetchedBasket.shop_id,
                userBasket: {
                    total: fetchedBasket.amount,
                    itemsUrl: fetchedBasket.link,
                    itemsNote: fetchedBasket.note,
                    status: fetchedBasket.status,
                    chatroomId: fetchedBasket.chatroom_id,
                },
                participants: mockParticipants,
            };

            return { structuredData, fetchedBasket };

        } catch (generalError: any) {
            console.error("FETCH_ERROR: General fetch error:", generalError);
            setError(generalError.message || "An unexpected error occurred while loading data.");
            return null;
        }
    };

    // --- useEffect for Initial Data Fetch ---
    useEffect(() => {
        console.log("useEffect for initial data fetch triggered."); // Debugging log
        const loadInitialData = async () => {
            console.log("FETCH_INIT: Starting initial data load for basket ID:", params.basketId);
            setIsPageLoading(true);
            setError(null);

            if (!params.basketId) {
                setError("No basket ID provided.");
                setIsPageLoading(false);
                return;
            }

            const result = await fetchAndProcessBasketData(params.basketId);
            console.log("Result from fetchAndProcessBasketData:", result); // Debugging log
            if (result) {
                setPoolData(result.structuredData);
                setIsReady(result.fetchedBasket.is_ready);
                console.log("FETCH_INIT_SUCCESS: Initial poolData set.");

                // NEW: Only show tutorial if data loaded successfully and not seen before
                const hasSeenTutorial = localStorage.getItem('hasSeenPoolPageTutorial');
                console.log("hasSeenPoolPageTutorial from localStorage:", hasSeenTutorial); // Debugging log
                if (!hasSeenTutorial) {
                    setShowTutorial(true);
                    console.log("setShowTutorial(true) called."); // Debugging log
                }
            } else {
                console.log("FETCH_INIT_COMPLETE: No data set, possibly redirected or error occurred.");
            }
            setIsPageLoading(false);
        };

        loadInitialData();
    }, [params.basketId, router]); // Added router to dependencies

    // Debugging log for showTutorial state
    useEffect(() => {
        console.log("Current showTutorial state:", showTutorial);
        console.log("Current poolData state:", poolData);
    }, [showTutorial, poolData]);


    // --- useEffect for Realtime Pool Subscription (for progress bar) and Basket Polling (for status/redirect) ---
    useEffect(() => {
        if (!params.basketId) {
            console.log("REALTIME_POLLING_INIT: Subscriptions/Polling skipped - basketId not available yet.");
            return;
        }

        // 1. Pool Channel Realtime Subscription (for progress bar updates)
        let poolSubscription: any;
        // Only subscribe to pool channel if poolData and pool_id are available
        // This will re-run if poolData.pool_id changes (e.g., on initial fetch)
        if (poolData?.pool_id) {
            console.log(`REALTIME_INIT: Starting realtime subscription for pool ID: ${poolData.pool_id}`);
            poolSubscription = supabase
                .channel(`pool_updates:${poolData.pool_id}`) // Unique channel name
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'pool', filter: `id=eq.${poolData.pool_id}` }, // Use singular 'pool'
                    (payload) => {
                        console.log("REALTIME_POOL_UPDATE: RECEIVED payload:", payload.new);
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
                .subscribe((status, err) => {
                    if (status === 'SUBSCRIBED') {
                        console.log(`REALTIME_POOL_STATUS: Channel '${poolSubscription.topic}' SUBSCRIBED.`);
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error(`REALTIME_POOL_STATUS_ERROR: Channel '${poolSubscription.topic}' encountered an error:`, err);
                    } else {
                        console.log(`REALTIME_POOL_STATUS: Channel '${poolSubscription.topic}' status: ${status}`);
                    }
                });
        }

        // 2. Basket Polling Fallback (for status change and redirect)
        console.log("POLLING_INIT: Starting polling for basket status...");
        const pollingInterval = setInterval(async () => {
            console.log("POLLING: Fetching latest basket status via poll...");
            const result = await fetchAndProcessBasketData(params.basketId);
            if (result) {
                // If result is not null, it means no redirect happened yet (or error was handled)
                setPoolData(result.structuredData);
                setIsReady(result.fetchedBasket.is_ready);
                console.log(`POLLING_SUCCESS: Basket status: ${result.fetchedBasket.status}`);
            } else {
                // If result is null, it means fetchAndProcessBasketData either redirected or hit an error.
                // In case of redirect, this interval will be cleared by the cleanup function.
                console.log("POLLING_INFO: Fetch result was null (possibly redirected or error handled).");
            }
        }, 3000); // Poll every 3 seconds (adjust as needed)


        // Cleanup function for both subscriptions and polling interval
        return () => {
            console.log('CLEANUP: Cleaning up Realtime subscriptions and polling interval...');
            if (poolSubscription) {
                supabase.removeChannel(poolSubscription);
            }
            clearInterval(pollingInterval); // Clear the polling interval
            console.log('CLEANUP: Realtime subscriptions and polling stopped.');
        };
    }, [params.basketId, router, poolData?.pool_id]); // poolData?.pool_id is kept as a dependency
    // to ensure the pool subscription is correctly
    // initialized or re-initialized if the basket's
    // associated pool changes.


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
                .update({ is_ready: newIsReadyState,updated_at: new Date().toISOString() })
                .eq('id', basketIdToUpdate)
                .select('id, status, chatroom_id') // Select status and chatroom_id to check for immediate redirect
                .single();

            if (supabaseError) {
                console.error('UPDATE_ERROR: Supabase update error:', supabaseError);
                setError(supabaseError.message || 'Failed to update basket status via Supabase.');
                return;
            }

            if (data) {
                setIsReady(newIsReadyState);
                console.log(`UPDATE_SUCCESS: Basket ${basketIdToUpdate} 'is_ready' set to ${newIsReadyState}. New status from direct update response: ${data.status}`);

                // Immediate redirect check after the update operation
                if (data.status === 'in_chat' && data.chatroom_id) {
                    console.log("REDIRECT_IMMEDIATE: Basket status immediately became in_chat after direct update. Redirecting.");
                    router.replace(`/chatrooms/${data.chatroom_id}`);
                }
            } else {
                setError('Basket not found or permission denied for update.');
                console.warn(`UPDATE_WARNING: Basket ${basketIdToUpdate} not found or update failed silently.`);
            }
        } catch (generalError) {
            console.error('UPDATE_ERROR: General error during update:', generalError);
            setError('An unexpected error occurred during update.');
        } finally {
            setIsButtonLoading(false);
        }
    };

    // --- handleGoToChat for navigating to chatroom ---
    const handleGoToChat = () => {
        if (poolData?.userBasket.chatroomId) {
            console.log(`NAVIGATE_CHAT: Going to chatroom ${poolData.userBasket.chatroomId}`);
            router.push(`/chatrooms/${poolData.userBasket.chatroomId}`);
        } else {
            console.warn("NAVIGATE_CHAT_WARNING: Chatroom ID not available for navigation.");
            setError("Chatroom not ready yet.");
        }
    };

    const handleEdit = () => {
        if (!poolData) return;

        const editUrl = `/shops/${poolData.shop_id}/basket?basketId=${params.basketId}`;
        console.log("NAVIGATE: Navigating to edit URL:", editUrl);
        router.push(editUrl as any);
    };

    // --- handleDelete for removing a basket entry ---
    const handleDelete = async () => {
        if (!poolData || isButtonLoading) return;

        // Using a custom modal/dialog instead of window.confirm as per instructions
        // For this example, we'll simulate the confirmation
        const confirmed = true; // In a real app, this would be from a custom modal
        if (!confirmed) {
            return;
        }
        console.log("Simulating: User confirmed deletion."); // Log for demo

        setIsButtonLoading(true);
        setError(null);

        const basketIdToDelete = params.basketId;

        try {
            const { error: supabaseError } = await supabase
                .from('basket')
                .delete()
                .eq('id', basketIdToDelete);

            if (supabaseError) {
                console.error('DELETE_ERROR: Supabase delete error:', supabaseError);
                setError(supabaseError.message || 'Failed to delete basket.');
                return;
            }

            console.log(`DELETE_SUCCESS: Basket ${basketIdToDelete} deleted successfully.`);
            router.push('/dashboard');

        } catch (generalError) {
            console.error('DELETE_ERROR: General error during delete:', generalError);
            setError('An unexpected error occurred during deletion.');
        } finally {
            setIsButtonLoading(false);
        }
    };

    // NEW: Function to handle tutorial completion
    const handleTutorialComplete = () => {
        setShowTutorial(false);
        localStorage.setItem('hasSeenPoolPageTutorial', 'true'); // Mark tutorial as seen
        console.log("DEBUG: handleTutorialComplete called. hasSeenPoolPageTutorial set to true.");
    };

    // --- Loading, Error, Not Found States (outside PageLayout) ---
    // These states should render full-page content, so they remain outside PageLayout
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

    if (!poolData || (poolData.userBasket.status === 'resolved' && !poolData.userBasket.chatroomId)) {
        return (
            <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto flex flex-col items-center justify-center p-4">
                <p className="text-gray-600 font-poppins text-center mb-4">Basket not found, deleted, or no longer active in a pool.</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    const currentProgressBarAmount = poolData.currentAmount;
    const isPoolFilled = poolData.currentAmount >= poolData.minAmount && poolData.minAmount > 0;

    // Determine button text and action based on state
    let buttonText = "";
    let buttonColorClass = "";
    let buttonOnClick = () => { };

    if (isPoolFilled && isReady && poolData.userBasket.chatroomId) {
        buttonText = isButtonLoading ? "Entering Chat..." : "Chat";
        buttonColorClass = "bg-[#4C8FD3] hover:bg-[#3A70A6]"; // Primary blue color
        buttonOnClick = handleGoToChat;
    } else if (isReady) {
        buttonText = isButtonLoading ? "Cancelling..." : "Cancel";
        buttonColorClass = "bg-[#F04438] hover:bg-[#D92D20]"; // Red for Cancel
        buttonOnClick = handleToggleReady;
    } else {
        buttonText = isButtonLoading ? "Setting Ready..." : "Ready To Order";
        buttonColorClass = "bg-[#FFDB0D] hover:bg-[#F7C600]"; // Yellow for Ready
        buttonOnClick = handleToggleReady;
    }

    // --- Header Content for PageLayout ---
    const poolHeader = (
        <div className="flex items-center gap-4" id="pool-header"> {/* ADDED ID */}
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
    );

    return (
        <PageLayout header={poolHeader} showNavigation={false}> {/* No footer prop passed */}
            {/* Main Content Area - this will be scrollable */}
            <div className="flex flex-col justify-between items-center gap-8 py-6">
                {showTutorial && poolData && (
                    <PoolPageTutorial onComplete={handleTutorialComplete} />
                )}
                {/* Main Card */}
                <div className="w-full bg-[#FFFADF] border border-[#E5E8EB] rounded-[24px] p-4 flex flex-col items-center gap-4" id="pool-status-card"> {/* ADDED ID */}
                    {/* Shop Logo */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#EFF1F3]">
                        <Image
                            src={poolData.shopLogo || "/shop-logo/default-logo.png"}
                            alt={poolData.shopName + " Logo"}
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
                <div className="w-full" id="pool-progress-bar"> {/* ADDED ID */}
                    {/* Pool Progress Labels */}
                    <div className="flex justify-between items-center mb-2">
                        {isReady && (
                            <span className="text-[#111827] font-poppins text-xs font-semibold">
                                You {poolData.userAmount} CHF
                            </span>
                        )}
                        <span className="text-[#111827] font-poppins text-[10px] font-semibold ml-auto">
                            Pool Total {poolData.currentAmount} CHF / {poolData.minAmount} CHF
                        </span>
                    </div>

                    {/* Dynamic ProgressBar Component */}
                    <ProgressBar
                        current={currentProgressBarAmount}
                        target={poolData.minAmount}
                        users={[]}
                        showPercentage={false}
                        animated={true}
                        className="w-full"
                    />
                </div>

                {/* Details Section */}
                <div className="w-full flex flex-col gap-2" id="user-basket-details"> {/* ADDED ID */}
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
                                {poolData.userBasket.total} CHF
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
                            <div className="space-y-2">
                                {poolData.userBasket.itemsUrl && (
                                    <div className="flex flex-col">
                                        <span className="text-[#6B7280] font-poppins text-xs font-medium mb-1">
                                            Basket Link:
                                        </span>
                                        <a 
                                            href={poolData.userBasket.itemsUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-[#4C8FD3] font-poppins text-xs leading-tight break-all underline hover:text-[#3A70A6] transition-colors"
                                        >
                                            {poolData.userBasket.itemsUrl}
                                        </a>
                                    </div>
                                )}
                                
                                {poolData.userBasket.itemsNote && (
                                    <div className="flex flex-col">
                                        <span className="text-[#6B7280] font-poppins text-xs font-medium mb-1">
                                            Order Note:
                                        </span>
                                        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3">
                                            <p className="text-[#374151] font-poppins text-xs leading-relaxed whitespace-pre-wrap">
                                                {poolData.userBasket.itemsNote}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {!poolData.userBasket.itemsUrl && !poolData.userBasket.itemsNote && (
                                    <span className="text-[#9CA3AF] font-poppins text-xs italic">
                                        No order details provided
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons (Edit/Delete) */}
                {!isReady && (
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleEdit}
                            className="flex-1 bg-[#EAF7FF] border border-[#D8F0FE] rounded-lg px-4 py-2 flex items-center justify-center gap-1.5 h-9"
                            id="edit-basket-button" 
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
                            id="delete-basket-button" 
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

                {/* Bottom Action Button - Dynamic Text and Color (MOVED BACK HERE) */}
                <button
                    onClick={buttonOnClick}
                    disabled={isButtonLoading}
                    className={`w-full h-14 rounded-2xl px-4 py-3 flex items-center justify-center ${buttonColorClass
                        } transition-colors ${isButtonLoading ? 'opacity-50 cursor-not-allowed' : ''} mt-auto`}
                    id="main-action-button" 
                >
                    <span className="text-white font-poppins text-lg font-semibold">
                        {buttonText}
                    </span>
                </button>
            </div>
        </PageLayout>
    );
}
