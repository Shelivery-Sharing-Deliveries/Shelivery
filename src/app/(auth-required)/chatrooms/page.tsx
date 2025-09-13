"use client"; // Ensure this is present if it uses client-side features

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Import icons for collapsible section

// Refined Chatroom interface to include shop and dormitory details, and now status
interface ChatroomDisplayData {
    id: string;
    pool_id: string; // The pool this chatroom belongs to
    admin_id: string; // The admin of this chatroom
    created_at: string;
    last_message_at: string | null;
    shop_name: string;
    shop_logo_url: string | null;
    dormitory_name: string;
    status: 'in_pool' | 'in_chat' | 'resolved' | 'unknown'; // Added status from related basket
}

export default function ChatroomsPage() {
    const [activeChatrooms, setActiveChatrooms] = useState<ChatroomDisplayData[]>([]); // State for active chatrooms
    const [resolvedChatrooms, setResolvedChatrooms] = useState<ChatroomDisplayData[]>([]); // State for resolved chatrooms
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOldChats, setShowOldChats] = useState(false); // State to manage collapsible section for old chats

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Redirect if not authenticated (AuthGuard should handle this, but good as a fallback)
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth");
        }
    }, [user, authLoading, router]);

    // Fetch chatrooms and related data
    useEffect(() => {
        const fetchChatroomsData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // 1. Get the user's dormitory name directly from the 'user' table via join
                const { data: userData, error: userError } = await supabase
                    .from("user")
                    .select("dormitory(name)")
                    .eq("id", user.id)
                    .single();

                if (userError) {
                    console.error("Error fetching user's dormitory:", userError);
                    throw new Error(
                        "Could not retrieve user's dormitory information. Please ensure your profile is complete."
                    );
                }
                const dormitoryName = (userData.dormitory?.[0] as { name: string })?.name;

                // 2. Find all baskets associated with the current user, including their status
                const { data: userBaskets, error: basketsError } = await supabase
                    .from("basket")
                    .select("id, chatroom_id, shop_id, status") // <-- Added 'status' here
                    .eq("user_id", user.id);

                if (basketsError) {
                    throw basketsError;
                }

                // Extract unique chatroom_ids and shop_ids, and map chatroom_id to basket status
                const uniqueChatroomIds = Array.from(
                    new Set(userBaskets.map((b) => b.chatroom_id).filter(Boolean))
                ) as string[];
                const uniqueShopIds = Array.from(
                    new Set(userBaskets.map((b) => b.shop_id).filter(Boolean))
                ) as string[];

                // Create a map from chatroom_id to its basket's status
                const chatroomStatusMap = new Map<string, 'in_pool' | 'in_chat' | 'resolved' | 'unknown'>();
                userBaskets.forEach(basket => {
                    if (basket.chatroom_id && basket.status) {
                        chatroomStatusMap.set(basket.chatroom_id, basket.status);
                    }
                });


                if (uniqueChatroomIds.length === 0) {
                    setActiveChatrooms([]);
                    setResolvedChatrooms([]);
                    setLoading(false);
                    return;
                }

                // 3. Fetch chatroom details for these unique IDs
                const { data: fetchedChatrooms, error: chatroomsError } = await supabase
                    .from("chatroom")
                    .select("id, pool_id, admin_id, created_at")
                    .in("id", uniqueChatroomIds);

                if (chatroomsError) {
                    throw chatroomsError;
                }

                // 4. Fetch shop details for all unique shop IDs
                const { data: fetchedShops, error: shopsError } = await supabase
                    .from("shop")
                    .select("id, name, logo_url")
                    .in("id", uniqueShopIds);

                if (shopsError) {
                    throw shopsError;
                }
                const shopMap = new Map(fetchedShops?.map((s) => [s.id, s]));

                // 5. Combine all data and find the latest message for each chatroom
                const chatroomsWithCombinedData = await Promise.all(
                    fetchedChatrooms.map(async (chatroom) => {
                        // Find a basket that links this chatroom to a shop
                        const relatedBasket = userBaskets.find(
                            (b) => b.chatroom_id === chatroom.id
                        );
                        const shopId = relatedBasket?.shop_id;
                        const shop = shopId ? shopMap.get(shopId) : null;

                        // Fetch the latest message for last_message_at
                        const { data: latestMessage, error: messageError } = await supabase
                            .from("message")
                            .select("sent_at")
                            .eq("chatroom_id", chatroom.id)
                            .order("sent_at", { ascending: false })
                            .limit(1)
                            .maybeSingle(); // <--- CHANGED FROM .single() TO .maybeSingle()

                        if (messageError && messageError.code !== "PGRST116") {
                            // PGRST116 means no rows found (which is now handled by maybeSingle returning null)
                            // So, only log other actual errors
                            console.error(
                                `Error fetching latest message for chatroom ${chatroom.id}:`,
                                messageError
                            );
                        }

                        return {
                            ...chatroom,
                            shop_name: shop?.name || "Unknown Shop",
                            shop_logo_url: shop?.logo_url || null,
                            dormitory_name: dormitoryName,
                            last_message_at: latestMessage ? latestMessage.sent_at : null,
                            status: chatroomStatusMap.get(chatroom.id) || 'unknown', // <-- Assign status here
                        };
                    })
                );

                // Sort chatrooms by last message time, most recent first
                chatroomsWithCombinedData.sort((a, b) => {
                    if (!a.last_message_at && !b.last_message_at) return 0;
                    if (!a.last_message_at) return 1; // Nulls (no messages) go to the end
                    if (!b.last_message_at) return -1; // Nulls (no messages) go to the end
                    return (
                        new Date(b.last_message_at).getTime() -
                        new Date(a.last_message_at).getTime()
                    );
                });

                // Filter into active and resolved chatrooms
                const active = chatroomsWithCombinedData.filter(c => c.status === 'in_pool' || c.status === 'in_chat');
                const resolved = chatroomsWithCombinedData.filter(c => c.status === 'resolved');

                setActiveChatrooms(active);
                setResolvedChatrooms(resolved);

            } catch (err: any) {
                console.error("Error fetching chatrooms data:", err);
                setError(err.message || "Failed to load chatrooms");
            } finally {
                setLoading(false);
            }
        };

        fetchChatroomsData();
    }, [user]); // Depend on 'user' to refetch if user changes

    const handleChatroomSelect = (chatroomId: string) => {
        router.push(`/chatrooms/${chatroomId}`);
    };

    // --- Loading State ---
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-shelivery-background-gray">
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-shelivery-text-secondary">
                            Loading chatrooms...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // --- No User State (should redirect via useEffect, but good fallback) ---
    if (!user) {
        return null;
    }

    // --- Error State ---
    if (error) {
        return (
            <PageLayout>
                <div className="text-center max-w-md mx-auto pt-20">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-shelivery-text-primary mb-2">
                        Failed to Load Chatrooms
                    </h2>
                    <p className="text-shelivery-text-secondary mb-6">{error}</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            </PageLayout>
        );
    }

    const headerContent = (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-shelivery-text-primary mb-2">
                Your Chatrooms
            </h1>
            <p className="text-shelivery-text-secondary">
                Access your active conversations
            </p>
        </div>
    );

    return (
        <PageLayout header={headerContent}>
            {/* Conditional rendering based on active and resolved chatrooms */}
            {activeChatrooms.length === 0 && resolvedChatrooms.length === 0 ? (
                // Case 1: No active and no resolved chatrooms
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-shelivery-text-primary mb-2">
                        No Chatrooms Yet
                    </h3>
                    <p className="text-shelivery-text-secondary">
                        You don't have any chatrooms at the moment. Create a basket to start one!
                    </p>
                </div>
            ) : (
                <>
                    {activeChatrooms.length === 0 && resolvedChatrooms.length > 0 ? (
                        // Case 2: No active chatrooms, but there are resolved ones
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-shelivery-text-primary mb-2">
                                You have no active chat
                            </h3>
                            <p className="text-shelivery-text-secondary">
                                Your past chats are in the archive below.
                            </p>
                        </div>
                    ) : (
                        // Case 3: Active chatrooms exist
                        <div className="space-y-4 py-2">
                            {activeChatrooms.map((chatroom) => (
                                <div
                                    key={chatroom.id}
                                    className="bg-white rounded-shelivery-lg p-4 border border-gray-200 hover:border-shelivery-primary-blue transition-colors cursor-pointer"
                                    onClick={() => handleChatroomSelect(chatroom.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Shop Logo - Styled like BasketCard */}
                                        <div
                                            className="w-[54px] h-[54px] rounded-[12px] bg-cover bg-center flex-shrink-0 overflow-hidden"
                                            style={{ backgroundImage: chatroom.shop_logo_url ? `url(${chatroom.shop_logo_url.replace(/ /g, "%20")})` : 'none' }}
                                        >
                                            {!chatroom.shop_logo_url && (
                                                <svg className="w-full h-full text-gray-400 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Chatroom Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-shelivery-text-primary">
                                                        {chatroom.dormitory_name} {chatroom.shop_name} Group
                                                    </h3>
                                                </div>
                                                <svg
                                                    className="w-5 h-5 text-shelivery-text-tertiary"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </div>

                                            {chatroom.last_message_at && (
                                                <p className="text-sm text-shelivery-text-secondary mt-1">
                                                    Last activity:{" "}
                                                    {new Date(chatroom.last_message_at).toLocaleString()}
                                                </p>
                                            )}
                                            {!chatroom.last_message_at && (
                                                <p className="text-sm text-shelivery-text-secondary mt-1 italic">
                                                    No messages yet
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- NEW SECTION: Old Chats (Collapsible) --- */}
                    {resolvedChatrooms.length > 0 && (
                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <button
                                className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 rounded-md text-gray-700 font-semibold text-left"
                                onClick={() => setShowOldChats(!showOldChats)}
                            >
                                <span>Archive ({resolvedChatrooms.length})</span>
                                {showOldChats ? (
                                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                )}
                            </button>
                            {showOldChats && (
                                <div className="mt-4 space-y-4">
                                    {resolvedChatrooms.map((chatroom) => (
                                        <div
                                            key={chatroom.id}
                                            // REMOVED: opacity-70 class
                                            className="bg-white rounded-shelivery-lg p-4 border border-gray-200 hover:border-shelivery-primary-blue transition-colors cursor-pointer"
                                            onClick={() => handleChatroomSelect(chatroom.id)}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Shop Logo - Styled like BasketCard */}
                                                <div
                                                    className="w-[54px] h-[54px] rounded-[12px] bg-cover bg-center flex-shrink-0 overflow-hidden"
                                                    style={{ backgroundImage: chatroom.shop_logo_url ? `url(${chatroom.shop_logo_url.replace(/ /g, "%20")})` : 'none' }}
                                                >
                                                    {!chatroom.shop_logo_url && (
                                                        <svg className="w-full h-full text-gray-400 p-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Chatroom Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-shelivery-text-primary">
                                                                {chatroom.dormitory_name} {chatroom.shop_name} Group
                                                            </h3>
                                                        </div>
                                                        <svg
                                                            className="w-5 h-5 text-shelivery-text-tertiary"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 5l7 7-7 7"
                                                            />
                                                        </svg>
                                                    </div>

                                                    {chatroom.last_message_at && (
                                                        <p className="text-sm text-shelivery-text-secondary mt-1">
                                                            Last activity:{" "}
                                                            {new Date(chatroom.last_message_at).toLocaleString()}
                                                        </p>
                                                    )}
                                                    {!chatroom.last_message_at && (
                                                        <p className="text-sm text-shelivery-text-secondary mt-1 italic">
                                                            No messages yet
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-1">Status: Resolved</p> {/* Indicate resolved status */}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </PageLayout>
    );
}
