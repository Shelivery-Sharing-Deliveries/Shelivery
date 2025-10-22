// app/dashboard/page.tsx
"use client";

import { Button, PageLayout } from "@/components/ui";
import ProfileCard from "@/components/dashboard/ProfileCard";
import SignInCard from "@/components/dashboard/SignInCard";
import AddBasket from "@/components/dashboard/AddBasket";
import Baskets from "@/components/dashboard/Baskets";
import Banner from "@/components/dashboard/Banner";
import SquareBanner from "@/components/dashboard/SquareBanner";
import DashboardTutorial from "@/components/dashboard/DashboardTutorial"; // NEW: Import the tutorial component
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Import icons for collapsible section
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { TicketIcon } from '@heroicons/react/24/outline';

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
    status: 'in_pool' | 'in_chat' | 'resolved'; // Ensure status is part of DisplayBasket
    chatroomId?: string; // Add chatroomId as optional for navigation
}

export default function DashboardPage() {
    const [userProfile, setUserProfile] = useState<{ userName: string; userAvatar: string } | null>(null);
    const [activeBaskets, setActiveBaskets] = useState<DisplayBasket[]>([]); // New state for active baskets
    const [resolvedBaskets, setResolvedBaskets] = useState<DisplayBasket[]>([]); // New state for resolved baskets
    const [loadingBaskets, setLoadingBaskets] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOldOrders, setShowOldOrders] = useState(false); // State to manage collapsible section
    const [showTutorial, setShowTutorial] = useState(false); // NEW: State for tutorial visibility

    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    // Fetch user profile and baskets
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            
            setLoadingBaskets(true);
            setError(null);

            // Fetch user profile data
            const { data: userData, error: userError } = await supabase
                .from("user")
                .select("first_name, image")
                .eq("id", user.id)
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
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                    if (basketsError) {
                        throw basketsError;
                    }

                    if (basketsData) {
                        // Map the fetched data to DisplayBasket interface
                        const mappedBaskets: DisplayBasket[] = basketsData.map((basket: any) => ({
                            id: basket.id,
                            shopName: basket.shop?.name || "Unknown Shop",
                            shopLogo: basket.shop?.logo_url || null,
                            total: basket.amount ? `CHF ${basket.amount.toFixed(2)}` : "CHF 0.00",
                            status: basket.status,
                            chatroomId: basket.chatroom_id || undefined, // Ensure chatroomId is included
                        }));

                        // Filter into active and resolved baskets
                        const active = mappedBaskets.filter(b => b.status === 'in_pool' || b.status === 'in_chat');
                        const resolved = mappedBaskets.filter(b => b.status === 'resolved');

                        setActiveBaskets(active);
                        setResolvedBaskets(resolved);
                    }
                } catch (err: any) {
                    console.error("Error fetching baskets:", err);
                    setError(err.message || "Failed to load baskets.");
            } finally {
                setLoadingBaskets(false);
            }
        };

        // Only proceed if user is loaded and not null, meaning AuthGuard has done its job
        if (!authLoading && user) {
            fetchData();
            // NEW: Check localStorage for tutorial status
            const hasSeenTutorial = localStorage.getItem('hasSeenDashboardTutorial');
            if (!hasSeenTutorial) {
                setShowTutorial(true);
            }
        }
    }, [user, authLoading]); // Depend on 'user' and 'authLoading' from useAuth

    const handleAddBasket = () => {
        router.push("/shops");
    };

    const handleInviteFriend = () => {
        router.push("/invite-friend");
    };

    // MODIFIED: handleBasketClick function
    const handleBasketClick = (basketId: string) => {
        // Search in both active and resolved baskets
        const basket = [...activeBaskets, ...resolvedBaskets].find(b => b.id === basketId);
        if (!basket) {
            console.warn(`Basket with ID ${basketId} not found.`);
            return;
        }

        console.log(`Basket clicked: ${basket.id}, Status: ${basket.status}, Chatroom ID: ${basket.chatroomId}`);

        if (basket.status === "in_chat" && basket.chatroomId) {
            router.push(`/chatrooms/${basket.chatroomId}`);
        } else if (basket.status === "in_pool") {
            router.push(`/pool/${basket.id}`);
        } else if (basket.status === "resolved" && basket.chatroomId) { // <-- NEW CONDITION HERE
            // If the basket is resolved and has a chatroom ID, navigate to the chatroom
            router.push(`/chatrooms/${basket.chatroomId}`);
        }
        // For resolved baskets without a chatroomId (e.g., if it was a direct order,
        // though your current setup implies all have chatrooms), no navigation would occur.
    };

    // NEW: Function to handle tutorial completion
    const handleTutorialComplete = () => {
        setShowTutorial(false);
        localStorage.setItem('hasSeenDashboardTutorial', 'true'); // Mark tutorial as seen
    };
    
    return (
        <PageLayout >
            {authLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mr-2" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            ) : !user ? (
                <>
                    <div className="py-1 flex justify-between items-center" id="dashboard-header">
                    </div>

                    <SignInCard id="sign-in-card" />

                    <SquareBanner id="square-banner" />

                    <AddBasket onClick={handleAddBasket} id="add-basket-button" />
                </>
            ) : (
                <>  
                    <div className="py-1 flex justify-between items-center" id="dashboard-header">
                    <h1 className="text-[20px] font-bold leading-8 text-black">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleInviteFriend}
                            className="bg-[#245B7B] text-white px-2 py-2 rounded-lg text-[12px] font-semibold"
                            id="invite-friends-button"
                        >
                            Invite Friends
                        </Button>
                        <a
                            onClick={() => router.push("/feedback")}
                            className="flex items-center justify-center px-2 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            title="Support Ticket"
                        >
                            <div className="flex items-center gap-1">
                                <TicketIcon className="w-5 h-5" />
                                <span className="text-[12px] font-semibold">Support</span>
                            </div>
                        </a>
                    </div>
                </div>
                    {userProfile ? (
                        <ProfileCard
                            userName={userProfile.userName}
                            userAvatar={userProfile.userAvatar}
                            id="profile-card" // ADDED ID
                        />
                        
                    ) : (<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}> {/* Inline Flexbox */}
                        <Skeleton circle width={54} height={54} style={{ marginBottom: '0px' }} /> {/* Override default margin */}
                        <div> {/* Container for stacked text skeletons */}
                        <Skeleton height={15} width={200} count={1} />
                        <Skeleton height={12} width={150} count={1} style={{ marginTop: '5px' }}/>
                        </div>
                    </div>)}
                    
                    <AddBasket onClick={handleAddBasket} id="add-basket-button" /> 
                    {loadingBaskets ? (
                        
                        <div className="flex items-center justify-center py-8">
                            <div>
                            <Skeleton height={20} width={300} />
                            <Skeleton height={15} width={300} count={5} /></div>
                        </div>

                            
                            
                    ) : error ? (
                        <div className="text-center py-8 text-red-600">
                            <p>{error}</p>
                            <Button onClick={() => window.location.reload()} className="mt-4">
                                Retry
                            </Button>
                        </div>
                    ) : (
                        <>
                            {activeBaskets.length === 0 ? (
                                <div className="text-center text-gray-500" id="no-active-baskets-message"> {/* ADDED ID */}
                                    <img
                                        src="/graphics/empty-basket.svg"  // Replace with your actual image path
                                        alt="No active baskets"
                                        className="w-full h-auto"  // Adjust sizing as needed
                                    />

                                    <p className="mt-4 py-2 text-lg font-semibold">No active baskets</p>
                                    <p>Create a basket and have shared shopping experience!</p>
                                </div>
                            ) : (
                                <Baskets baskets={activeBaskets} onBasketClick={handleBasketClick} id="active-baskets-list" />
                            )}
                            <Banner id="dashboard-banner" /> {/* ADDED ID */}

                            {resolvedBaskets.length > 0 && (
                                <div className="mt-6 border-t border-gray-200 pt-4" id="old-orders-section"> {/* ADDED ID */}
                                    <button
                                        className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 rounded-md text-gray-700 font-semibold text-left"
                                        onClick={() => setShowOldOrders(!showOldOrders)}
                                        id="old-orders-toggle" 
                                    >
                                        <span>Archive ({resolvedBaskets.length})</span>
                                        {showOldOrders ? (
                                            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                        )}
                                    </button>
                                    {showOldOrders && (
                                        <div className="mt-4" id="resolved-baskets-list"> {/* ADDED ID */}
                                            {/* Re-using Baskets component for resolved baskets */}
                                            <Baskets baskets={resolvedBaskets} onBasketClick={handleBasketClick} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
            {/* Render tutorial conditionally */}
            {showTutorial && <DashboardTutorial onComplete={handleTutorialComplete} />}
        </PageLayout>
    );
}
