"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Navigation } from "@/components/ui/Navigation"; // Assuming this is for general navigation, not a specific header
import { PageLayout } from "@/components/ui/PageLayout"; // Corrected import path for PageLayout based on usage

// Interface for a Shop, including only the fields used/fetched
interface Shop {
    id: string;
    name: string;
    min_amount: number;
    logo_url: string | null;
    is_active: boolean;
}

// Interface for a user's Basket, specifically for checking active baskets
interface Basket {
    id: string;
    shop_id: string;
    status: string; // Assuming a 'status' field to determine if a basket is unresolved
    // Add any other fields you might need from the basket table here
}

export default function ShopsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [activeBaskets, setActiveBaskets] = useState<Basket[]>([]); // New state for user's active baskets
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [warningMessage, setWarningMessage] = useState<string | null>(null); // New state for the warning message

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth");
        }
    }, [user, authLoading, router]);

    // Fetch shops and user's active baskets from Supabase
    useEffect(() => {
        const fetchData = async () => {
            // Don't fetch if user is not available or auth is still loading
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setWarningMessage(null); // Clear any old warnings

            try {
                // --- 1. Fetch Shops ---
                const { data: shopsData, error: shopsError } = await supabase
                    .from("shop")
                    .select("id, name, min_amount, logo_url, is_active")
                    .eq("is_active", true)
                    .order("name");

                if (shopsError) {
                    throw shopsError;
                }
                setShops(shopsData || []);

                // --- 2. Fetch User's Active Baskets ---
                // Updated to check for multiple "unresolved" statuses: in_pool, in_chat, ordered
                const { data: basketsData, error: basketsError } = await supabase
                    .from("basket")
                    .select("id, shop_id, status")
                    .eq("user_id", user.id)
                    .in("status", ["in_pool", "in_chat", "ordered"]); // Check for any of these active statuses

                if (basketsError) {
                    console.error("Error fetching active baskets:", basketsError.message);
                    setActiveBaskets([]); // Ensure activeBaskets is empty on error
                } else {
                    setActiveBaskets(basketsData || []);
                }

            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message || "Failed to load shops or user baskets.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]); // Re-run when user changes (e.g., on initial load after login)

    // Filtered shops (no category filter implemented currently)
    const filteredShops = shops;

    // Handles clicking on a shop card
    const handleShopSelect = (shop: Shop) => {
        // Check if the user already has an active basket for this specific shop
        const hasActiveBasketForShop = activeBaskets.some(
            (basket) => basket.shop_id === shop.id
        );

        if (hasActiveBasketForShop) {
            // If an active basket exists, show a warning message
            setWarningMessage(
                `You already have an active basket for ${shop.name}.\n \n Please resolve it before creating a new one.`
            );
            // Optional: You might want to redirect them to that existing basket
            // const existingBasket = activeBaskets.find(basket => basket.shop_id === shop.id);
            // if (existingBasket) {
            //   router.push(`/basket/${existingBasket.id}`);
            // }
        } else {
            // If no active basket for this shop, proceed to create a new one
            setWarningMessage(null); // Clear any previous warning
            router.push(`/shops/${shop.id}/basket` as any);
        }
    };

    const handleAddStoreClick = () => {
        router.push("/feedback");
    };

    // --- Conditional Rendering for Loading/Error States ---
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-shelivery-background-gray">
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-shelivery-text-secondary">Loading shops...</p>
                    </div>
                </div>
            </div>
        );
    }

    // If user is null after loading, return null (should be redirected by useEffect)
    if (!user) {
        return null;
    }

    // Display a full-screen error message if fetching failed
    if (error) {
        return (
            <div className="min-h-screen bg-shelivery-background-gray">
                <div className="flex items-center justify-center pt-20 p-4">
                    <div className="text-center max-w-md">
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
                            Failed to Load Shops
                        </h2>
                        <p className="text-shelivery-text-secondary mb-6">{error}</p>
                        <Button onClick={() => window.location.reload()}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Content Rendering ---
    const headerContent = (
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-shelivery-text-primary mb-2">
                Choose a Shop
            </h1>
            <p className="text-shelivery-text-secondary">
                Select a delivery service to start your basket
            </p>
        </div>
    );

    return (
        <PageLayout header={headerContent}>
            {/* Warning Message Display */}
            {warningMessage && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-md shadow-sm" role="alert">
                    <p className="font-bold">Warning!</p>
                    <p style={{ whiteSpace: "pre-line" }}>{warningMessage}</p>
                    <button
                        onClick={() => setWarningMessage(null)}
                        className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Shops Grid */}
            {filteredShops.length === 0 ? (
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
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-shelivery-text-primary mb-2">
                        No shops found
                    </h3>
                    <p className="text-shelivery-text-secondary">
                        No shops are currently available.
                    </p>
                </div>
            ) : (
                <div className="space-y-4 py-2">
                    {filteredShops.map((shop) => (
                        <div
                            key={shop.id}
                            className="bg-white rounded-shelivery-lg p-4 border border-gray-200 hover:border-shelivery-primary-blue transition-colors cursor-pointer"
                            onClick={() => handleShopSelect(shop)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Shop Logo */}
                                <div className="w-16 h-16 bg-gray-100 rounded-shelivery-md flex items-center justify-center flex-shrink-0">
                                    {shop.logo_url ? (
                                        <img
                                            src={shop.logo_url}
                                            alt={shop.name}
                                            className="w-full h-full object-cover rounded-shelivery-md"
                                        />
                                    ) : (
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
                                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                            />
                                        </svg>
                                    )}
                                </div>

                                {/* Shop Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-shelivery-text-primary">
                                                {shop.name}
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

                                    {/* Shop Details */}
                                    <div className="flex flex-wrap gap-4 text-sm text-shelivery-text-tertiary">
                                        <div className="flex items-center gap-1">
                                            Min: CHF {shop.min_amount}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* New section for adding a store */}
            <div className="mt-8 p-6 bg-shelivery-primary-blue text-white rounded-shelivery-lg shadow-xl text-center">
                <h3 className="text-xl font-bold mb-2">Want to add a store?</h3>
                <p className="text-sm mb-4">
                    Please open a ticket with some information and we'll add it to Shelivery shortly.
                </p>
                <Button onClick={handleAddStoreClick} variant="primary" className="text-sm font-semibold">
                    Open a Ticket
                </Button>
            </div>
        </PageLayout>
    );
}
