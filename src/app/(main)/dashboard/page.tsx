"use client";

import { Navigation, Button } from "@/components/ui";
import ProfileCard from "@/components/dashboard/ProfileCard";
import AddBasket from "@/components/dashboard/AddBasket";
import Baskets from "@/components/dashboard/Baskets";
import Banner from "@/components/dashboard/Banner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
// REMOVED: User as SupabaseUser import, as we primarily rely on `useAuth` user object or infer from context
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth to get the user directly

// Define the interface for the Shop data as it exists in the 'shop' table
interface ShopData {
    id: string;
    name: string;
    logo_url: string | null;
}

// Define the interface for Basket data as it exists in the 'baskets' table
// and includes the joined 'shop' data
interface Basket {
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
    shop: {
        name: string;
        logo_url: string | null;
    } | null;
}

// Define the interface for baskets displayed in the Baskets component
interface DisplayBasket {
    id: string;
    shopName: string;
    shopLogo: string | null;
    total: string;
    status: 'in_pool' | 'in_chat' | 'resolved';
}

export default function DashboardPage() {
    const [userProfile, setUserProfile] = useState<{ userName: string; userAvatar: string } | null>(null);
    const [baskets, setBaskets] = useState<DisplayBasket[]>([]);
    const [loadingBaskets, setLoadingBaskets] = useState(true); // For loading *baskets* specifically
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { user, loading: authLoading } = useAuth(); // Get user and auth loading state from your hook

    // Fetch user profile and baskets
    useEffect(() => {
        // Only proceed if user is loaded and not null, meaning AuthGuard has done its job
        if (!authLoading && user) {
            async function fetchData() {
                setLoadingBaskets(true);
                setError(null);

                // We can now directly use the `user` object from `useAuth`
                const currentUser = user;

                // Fetch user profile data
                const { data: userData, error: userError } = await supabase
                    .from("user")
                    .select("first_name, image")
                    .eq("id", currentUser.id)
                    .single();

                if (userError) {
                    console.error("Error fetching user profile:", userError);
                    setError("Failed to load user profile."); // Set an error for the dashboard itself
                    setUserProfile({ userName: "User", userAvatar: "/avatars/default-avatar.png" });
                } else if (userData) {
                    setUserProfile({
                        userName: userData.first_name || "User",
                        userAvatar: userData.image || "/avatars/default-avatar.png",
                    });
                }

                // Fetch baskets for the current user, joining with the 'shop' table
                try {
                    const { data: basketsData, error: basketsError } = await supabase
                        .from("basket")
                        .select(`
                            id,
                            amount,
                            status,
                            chatroom_id,
                            shop (
                                name,
                                logo_url
                            )
                        `)
                        .eq("user_id", currentUser.id)
                        .order("created_at", { ascending: false });

                    if (basketsError) {
                        throw basketsError;
                    }

                    if (basketsData) {
                        // Add chatroom_id and status to DisplayBasket
                        const mappedBaskets: (DisplayBasket & { chatroomId?: string; status: 'in_pool' | 'in_chat' | 'resolved' })[] = basketsData.map((basket: any) => ({
                            id: basket.id,
                            shopName: basket.shop?.name || "Unknown Shop",
                            shopLogo: basket.shop?.logo_url || null,
                            total: basket.amount ? `CHF ${basket.amount.toFixed(2)}` : "CHF 0.00",
                            status: basket.status,
                            chatroomId: basket.chatroom_id || undefined,
                        }));
                        setBaskets(mappedBaskets);
                    }
                } catch (err: any) {
                    console.error("Error fetching baskets:", err);
                    setError(err.message || "Failed to load baskets.");
                } finally {
                    setLoadingBaskets(false);
                }
            }

            fetchData();
        }
    }, [user, authLoading]); // Depend on 'user' and 'authLoading' from useAuth

    const handleAddBasket = () => {
        router.push("/shops");
    };

    const handleInviteFriend = () => {
        router.push("/invite-friend");
    };

    // Find the basket by id to determine its status and chatroomId
    const handleBasketClick = (basketId: string) => {
        const basket = baskets.find(b => b.id === basketId);
        if (!basket) return;

        if (basket.status === "in_chat" && (basket as any).chatroomId) {
            router.push(`/chatrooms/${(basket as any).chatroomId}`);
        } else if (basket.status === "in_pool") {
            router.push(`/pool/${basketId}`);
        }
        // Optionally handle 'resolved' or other statuses if needed
    };

    return (
        <div className="min-h-screen bg-[#245B7B] relative flex justify-center">
            {/* Main Content Container - 375px width */}
            <div className="w-[375px] bg-white rounded-t-[30px] min-h-screen px-3 py-[18px] pb-[90px] mx-[10px]">
                {/* Header */}
                <div className="flex justify-between mb-[19px]">
                    <h1 className="text-[16px] font-bold leading-8 text-black">
                        Dashboard
                    </h1>
                    <Button onClick={handleInviteFriend} className="bg-[#245B7B] text-white px-4 py-2 rounded-lg text-[12px] font-semibold">
                        Invite Friends
                    </Button>
                </div>

                {/* Dashboard Components */}
                <div className="px-0">
                    {/* Only show loading for *baskets* if AuthGuard has confirmed the user */}
                    {authLoading || !user ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mr-2" />
                            <p className="text-gray-600">Loading user data...</p>
                        </div>
                    ) : (
                        <>
                            <ProfileCard
                                userName={userProfile ? userProfile.userName : "Loading..."}
                                userAvatar={userProfile ? userProfile.userAvatar : "/avatars/default-avatar.png"}
                            />
                            <AddBasket onClick={handleAddBasket} />
                            {loadingBaskets ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mr-2" />
                                    <p className="text-gray-600">Loading baskets...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8 text-red-600">
                                    <p>{error}</p>
                                    <Button onClick={() => window.location.reload()} className="mt-4">
                                        Retry
                                    </Button>
                                </div>
                            ) : baskets.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>You have no active baskets.</p>
                                </div>
                            ) : (
                                <Baskets baskets={baskets} onBasketClick={handleBasketClick} />
                            )}
                            <Banner />
                        </>
                    )}
                </div>
            </div>

            {/* Navigation - Fixed to bottom */}
            <div className="fixed bottom-0 left-0 right-0">
                <Navigation />
            </div>
        </div>
    );
}