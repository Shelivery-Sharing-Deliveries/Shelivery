// app/pool/[basketId]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
    id: string;
    user_id: string;
    shop_id: string;
    pool_id: string | null;
    chatroom_id: string | null;
    amount: number;
    link: string;
    is_ready: boolean;
    status: 'resolved' | 'in_pool' | 'in_chat';
    shop: ShopData;
    pool: PoolInfo | null;
}

// Interface for the structured data after fetching and processing
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
        itemsUrl: string;
        status: 'resolved' | 'in_pool' | 'in_chat';
        chatroomId: string | null;
    };
    participants: { id: number; avatar: string; amount: number }[]; // Placeholder for now
}

interface PoolPageProps {
    params: {
        basketId: string;
    };
}

// Ensure mockParticipants is defined AT THE TOP LEVEL, before the component
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
    const [isDeleting, setIsDeleting] = useState(false);

    // Use a ref to store the pool_id once it's available,
    // so it doesn't trigger useEffect re-runs when poolData changes.
    const poolIdRef = useRef<string | null>(null);

    const handleBack = () => {
        router.back();
    };

    // --- useEffect for Initial Data Fetch ---
    useEffect(() => {
        async function fetchPoolData() {
            console.log("FETCH: Initial data fetch for basket ID:", params.basketId);
            setIsPageLoading(true);
            setError(null);

            if (!params.basketId) {
                setError("No basket ID provided.");
                setIsPageLoading(false);
                return;
            }

            try {
                const { data, error: supabaseError } = await supabase
                    .from('basket') // Use singular 'basket'
                    .select(`
            id,
            amount,
            link,
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
                    .eq('id', params.basketId)
                    .single();

                if (supabaseError) {
                    console.error("FETCH_ERROR: Error fetching pool data:", supabaseError.message);
                    setError(`Failed to load basket data: ${supabaseError.message}`);
                    setPoolData(null);
                    return;
                }

                if (data) {
                    console.log("FETCH_SUCCESS: Fetched basket data:", data);

                    const fetchedBasket: BasketData = data as unknown as BasketData;

                    // Crucial: Check for chatroom_id and status to redirect immediately
                    if (fetchedBasket.status === 'in_chat' && fetchedBasket.chatroom_id) {
                        console.log(`REDIRECT_CHECK: Basket ${params.basketId} is in chat state. Redirecting to chatroom ${fetchedBasket.chatroom_id}`);
                        router.replace(`/chatrooms/${fetchedBasket.chatroom_id}`);
                        return; // Stop further processing on this page
                    }

                    // Handle cases where basket might be resolved or in an unexpected state without a pool
                    if (!fetchedBasket.shop || (fetchedBasket.status === 'in_pool' && !fetchedBasket.pool)) {
                        if (fetchedBasket.status !== 'in_chat' && fetchedBasket.status !== 'resolved') {
                            setError("Missing shop or pool data for this basket. Check foreign keys or basket status.");
                            setPoolData(null);
                            return;
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
                            status: fetchedBasket.status,
                            chatroomId: fetchedBasket.chatroom_id,
                        },
                        participants: mockParticipants, // This line uses mockParticipants
                    };

                    console.log("FETCH_SUCCESS: Structured pool data for display:", structuredData);
                    setPoolData(structuredData);
                    setIsReady(fetchedBasket.is_ready);

                    // Store pool_id in ref once available
                    if (fetchedBasket.pool_id) {
                        poolIdRef.current = fetchedBasket.pool_id;
                    }

                } else {
                    console.log("FETCH_WARNING: Basket not found for ID:", params.basketId);
                    setError("Basket not found.");
                    setPoolData(null);
                }
            } catch (generalError) {
                console.error("FETCH_ERROR: General fetch error:", generalError);
                setError("An unexpected error occurred while loading data.");
                setPoolData(null);
            } finally {
                setIsPageLoading(false);
            }
        }

        fetchPoolData();
    }, [params.basketId, router]);


    // --- useEffect for Realtime Subscription ---
    useEffect(() => {
        if (!params.basketId) {
            console.log("REALTIME_INIT: Subscription skipped - basketId not available yet.");
            return;
        }

        // Basket Channel Subscription
        console.log("REALTIME_INIT: Attempting to subscribe to basket channel for ID:", params.basketId);
        const basketChannel = supabase
            .channel(`basket_updates:${params.basketId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'basket', filter: `id=eq.${params.basketId}` },
                (payload) => {
                    console.log("REALTIME_BASKET_UPDATE: RECEIVED payload:", payload.new);
                    const updatedBasket = payload.new as BasketData;

                    if (updatedBasket.status === 'in_chat' && updatedBasket.chatroom_id) {
                        console.log(`REALTIME_REDIRECT: Basket ${updatedBasket.id} updated to in_chat. Initiating redirect to chatroom ${updatedBasket.chatroom_id}`);
                        router.replace(`/chatrooms/${updatedBasket.chatroom_id}`);
                    } else {
                        console.log(`REALTIME_BASKET_UPDATE: Status is '${updatedBasket.status}'. Not yet in 'in_chat' or missing chatroom_id. Updating local state and refetching.`);
                        setIsReady(updatedBasket.is_ready);
                        // Re-fetch pool data to ensure current_amount updates if relevant
                        supabase
                            .from('basket')
                            .select(`
                    id, amount, link, is_ready, status, shop (name, logo_url), pool (min_amount, current_amount), pool_id, chatroom_id
                `)
                            .eq('id', params.basketId)
                            .single()
                            .then(({ data: reFetchedData, error: reFetchError }) => {
                                if (reFetchedData && !reFetchError) {
                                    const reFetchedBasket: BasketData = reFetchedData as unknown as BasketData;
                                    const structuredData: DisplayPoolData = {
                                        shopName: reFetchedBasket.shop?.name || 'Unknown Shop',
                                        shopLogo: reFetchedBasket.shop?.logo_url || "/shop-logos/default-logo.png",
                                        poolTotal: reFetchedBasket.pool?.min_amount || 0,
                                        currentAmount: reFetchedBasket.pool?.current_amount || 0,
                                        userAmount: reFetchedBasket.amount,
                                        minAmount: reFetchedBasket.pool?.min_amount || 0,
                                        pool_id: reFetchedBasket.pool_id,
                                        shop_id: reFetchedBasket.shop_id,
                                        userBasket: {
                                            total: reFetchedBasket.amount,
                                            itemsUrl: reFetchedBasket.link,
                                            status: reFetchedBasket.status,
                                            chatroomId: reFetchedBasket.chatroom_id,
                                        },
                                        participants: mockParticipants,
                                    };
                                    setPoolData(structuredData);
                                    console.log("REALTIME_BASKET_UPDATE: Local poolData updated from re-fetch.");
                                } else if (reFetchError) {
                                    console.error("REALTIME_BASKET_UPDATE_ERROR: Error refetching on basket update:", reFetchError);
                                }
                            });
                    }
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`REALTIME_BASKET_STATUS: Channel '${basketChannel.topic}' SUBSCRIBED.`);
                } else if (status === 'CHANNEL_ERROR') {
                    console.error(`REALTIME_BASKET_STATUS_ERROR: Channel '${basketChannel.topic}' encountered an error:`, err);
                } else {
                    console.log(`REALTIME_BASKET_STATUS: Channel '${basketChannel.topic}' status: ${status}`);
                }
            });

        // Pool Channel Subscription (use poolIdRef.current for stability)
        let poolChannel: any;
        // Only attempt to subscribe to pool channel if poolIdRef has a value
        if (poolIdRef.current) {
            console.log("REALTIME_INIT: Attempting to subscribe to pool channel for ID (from ref):", poolIdRef.current);
            poolChannel = supabase
                .channel(`pool_updates:${poolIdRef.current}`)
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'pool', filter: `id=eq.${poolIdRef.current}` },
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
                        console.log(`REALTIME_POOL_STATUS: Channel '${poolChannel.topic}' SUBSCRIBED.`);
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error(`REALTIME_POOL_STATUS_ERROR: Channel '${poolChannel.topic}' encountered an error:`, err);
                    } else {
                        console.log(`REALTIME_POOL_STATUS: Channel '${poolChannel.topic}' status: ${status}`);
                    }
                });
        }

        return () => {
            console.log('REALTIME_CLEANUP: Cleaning up Realtime subscriptions...');
            supabase.removeChannel(basketChannel);
            if (poolChannel) {
                supabase.removeChannel(poolChannel);
            }
            console.log('REALTIME_CLEANUP: Realtime subscriptions stopped.');
        };
    }, [params.basketId, router]); // poolData?.pool_id removed from dependencies!

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
                .select('id, status, chatroom_id')
                .single();

            if (supabaseError) {
                console.error('UPDATE_ERROR: Supabase update error:', supabaseError);
                setError(supabaseError.message || 'Failed to update basket status via Supabase.');
                return;
            }

            if (data) {
                setIsReady(newIsReadyState);
                console.log(`UPDATE_SUCCESS: Basket ${basketIdToUpdate} 'is_ready' set to ${newIsReadyState}. New status from direct update response: ${data.status}`);

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

    const handleEdit = () => {
        if (!poolData) return;
        const editUrl = `/shops/${poolData.shop_id}/basket?basketId=${params.basketId}`;
        console.log("NAVIGATE: Navigating to edit URL:", editUrl);
        router.push(editUrl);
    };

    const handleDelete = async () => {
        if (!poolData || isDeleting) return;

        const confirmed = window.confirm("Are you sure you want to delete this basket?");
        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
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
            setIsDeleting(false);
        }
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

    if (!poolData || poolData.userBasket.status === 'resolved') {
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
                            src={poolData.shopLogo}
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
                <div className="w-full">
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
                            <span className="text-[#4C8FD3] font-poppins text-xs leading-tight break-all">
                                <a href={poolData.userBasket.itemsUrl} target="_blank" rel="noopener noreferrer" className="underline">
                                    {poolData.userBasket.itemsUrl}
                                </a>
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
                className={`w-[343px] h-14 rounded-2xl px-4 py-3 flex items-center justify-center ${isReady
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