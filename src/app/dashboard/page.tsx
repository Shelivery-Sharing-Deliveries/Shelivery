"use client";

import { Navigation, Button } from "@/components/ui";
import ProfileCard from "@/components/dashboard/ProfileCard";
import AddBasket from "@/components/dashboard/AddBasket";
import Baskets from "@/components/dashboard/Baskets";
import Banner from "@/components/dashboard/Banner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js"; // Import Supabase User type

// Define the interface for the Shop data as it exists in the 'shop' table
interface ShopData {
    id: string;
    name: string;
    logo_url: string | null;
    // Add other shop fields if needed for display
}

// Define the interface for Basket data as it exists in the 'baskets' table
// and includes the joined 'shop' data
interface Basket {
    id: string;
    user_id: string;
    shop_id: string;
    pool_id: string;
    amount: number; // The price of the basket
    link: string;
    status: 'in_pool' | 'in_chat' | 'resolved'; // Valid statuses from your DB schema
    is_ready: boolean;
    chatroom_id: string;
    created_at: string;
    // Nested shop data from the join
    shop: {
        name: string;
        logo_url: string | null;
    } | null; // Shop might be null if the foreign key reference is broken
}

// Define the interface for baskets displayed in the Baskets component
// This maps the fetched data to the expected props of the Baskets component
interface DisplayBasket {
    id: string;
    shopName: string;
    shopLogo: string | null;
    total: string; // Formatted amount
    status: 'in_pool' | 'in_chat' | 'resolved'; // Using actual DB statuses for now
}

export default function DashboardPage() {
    const [userProfile, setUserProfile] = useState<{ userName: string; userAvatar: string } | null>(null);
    const [baskets, setBaskets] = useState<DisplayBasket[]>([]);
    const [loadingBaskets, setLoadingBaskets] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    // Fetch user profile and baskets
    useEffect(() => {
        async function fetchData() {
            setLoadingBaskets(true);
            setError(null);

            const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

            if (authError || !currentUser) {
                console.error("No user or auth error:", authError);
                // Redirect to auth page if not logged in
                router.push("/auth");
                setLoadingBaskets(false);
                return;
            }

            // Fetch user profile data
            const { data: userData, error: userError } = await supabase
                .from("user")
                .select("first_name, image")
                .eq("id", currentUser.id)
                .single();

            if (userError) {
                console.error("Error fetching user profile:", userError);
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
                    .from("baskets")
                    .select(`
            id,
            amount,
            status,
            shop (
              name,
              logo_url
            )
          `)
                    .eq("user_id", currentUser.id)
                    .order("created_at", { ascending: false }); // Order by newest first

                if (basketsError) {
                    throw basketsError;
                }

                if (basketsData) {
                    // Map fetched data to the DisplayBasket interface
                    const mappedBaskets: DisplayBasket[] = basketsData.map((basket: any) => ({
                        id: basket.id,
                        shopName: basket.shop?.name || "Unknown Shop", // Use optional chaining for safety
                        shopLogo: basket.shop?.logo_url || null,
                        total: basket.amount ? `CHF ${basket.amount.toFixed(2)}` : "CHF 0.00",
                        status: basket.status, // Directly use DB status
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
    }, [router]); // Re-run when router changes (e.g., after login/logout)

    const handleAddBasket = () => {
        router.push("/shops");
    };

    const handleInviteFriend = () => {
        router.push("/invite-friend");
    };

    const handleBasketClick = (basketId: string) => {
        // Navigate to the basket details page or pool page
        router.push(`/pool/${basketId}`); // Assuming basketId can be used to navigate to pool
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
                            <p>You have no active baskets.</p> {/* MODIFIED: Changed message */}
                        </div>
                    ) : (
                        <Baskets baskets={baskets} onBasketClick={handleBasketClick} />
                    )}
                    <Banner />
                </div>
            </div>

            {/* Navigation - Fixed to bottom */}
            <div className="fixed bottom-0 left-0 right-0">
                <Navigation />
            </div>
        </div>
    );
}
