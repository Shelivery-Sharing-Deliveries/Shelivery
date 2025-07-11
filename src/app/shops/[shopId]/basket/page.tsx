"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation"; // Import useSearchParams
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Navigation } from "@/components/ui/Navigation";

interface Shop {
    id: string;
    name: string;
    min_amount: number;
    logo_url: string | null;
    is_active: boolean;
}

export default function BasketCreationPage() {
    const [shop, setShop] = useState<Shop | null>(null);

    const [basketLink, setBasketLink] = useState("");
    const [basketAmount, setBasketAmount] = useState(""); // Storing as string for input

    const [loading, setLoading] = useState(true); // For initial shop data fetch
    const [submitting, setSubmitting] = useState(false); // For basket creation/update process
    const [error, setError] = useState<string | null>(null);

    const [isEditMode, setIsEditMode] = useState(false); // New state to track edit mode
    const [existingBasketId, setExistingBasketId] = useState<string | null>(null); // To store the basket ID if in edit mode
    const [currentBasketPoolId, setCurrentBasketPoolId] = useState<string | null>(null); // NEW: To store the pool ID of the existing basket

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams(); // Get search params
    const shopId = params?.shopId as string;

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/auth");
        }
    }, [user, authLoading, router]);

    // Fetch shop details and handle edit mode pre-population
    useEffect(() => {
        const fetchShopAndBasket = async () => {
            if (!shopId || !user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // 1. Fetch Shop Details
                const { data: shopData, error: fetchShopError } = await supabase
                    .from("shop")
                    .select("id, name, min_amount, logo_url, is_active")
                    .eq("id", shopId)
                    .eq("is_active", true)
                    .single();

                if (fetchShopError) {
                    throw fetchShopError;
                }

                if (!shopData) {
                    throw new Error("Shop not found or not active.");
                }
                setShop(shopData);

                // 2. Check for Edit Mode and Fetch Existing Basket
                const urlBasketId = searchParams.get("basketId");
                const urlLink = searchParams.get("link");
                const urlAmount = searchParams.get("amount");

                if (urlBasketId && urlLink && urlAmount) {
                    setIsEditMode(true);
                    setExistingBasketId(urlBasketId);
                    setBasketLink(decodeURIComponent(urlLink));
                    setBasketAmount(urlAmount); // Amount is a string from URL

                    // NEW: Fetch the pool_id for the existing basket
                    const { data: basketData, error: fetchBasketError } = await supabase
                        .from("basket")
                        .select("pool_id")
                        .eq("id", urlBasketId)
                        .eq("user_id", user.id) // Ensure fetching current user's basket
                        .single();

                    if (fetchBasketError) {
                        console.error("Error fetching existing basket's pool_id:", fetchBasketError);
                        // Don't throw, just log and proceed without poolId if not found
                        setCurrentBasketPoolId(null);
                    } else if (basketData) {
                        setCurrentBasketPoolId(basketData.id);
                    } else {
                        setCurrentBasketPoolId(null);
                    }

                } else {
                    setIsEditMode(false);
                    setExistingBasketId(null);
                    setBasketLink("");
                    setBasketAmount("");
                    setCurrentBasketPoolId(null); // Reset pool ID for new basket mode
                }

            } catch (err: any) {
                console.error("Error fetching shop or basket details:", err);
                setError(err.message || "Failed to load shop or basket details.");
            } finally {
                setLoading(false);
            }
        };

        fetchShopAndBasket();
    }, [user, shopId, searchParams]); // Depend on searchParams to react to URL changes

    const calculateTotalAmount = () => {
        const amount = parseFloat(basketAmount);
        return isNaN(amount) || amount <= 0 ? 0 : amount;
    };

    const canSubmitBasket = () => {
        const totalAmount = calculateTotalAmount();
        return (
            basketLink.trim() !== "" &&
            totalAmount > 0
        );
    };

    const handleSubmitBasket = async () => {
        if (!canSubmitBasket() || !user || !shop) {
            setError("Please fill in required fields (Link, Amount).");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const basketData = {
                shop_id: shop.id,
                amount: calculateTotalAmount(),
                link: basketLink.trim(),
                user_id: user.id, // Ensure user_id is included for both create/update
            };

            if (isEditMode && existingBasketId) {
                // UPDATE existing basket
                const { error: updateError } = await supabase
                    .from("basket")
                    .update(basketData)
                    .eq("id", existingBasketId)
                    .eq("user_id", user.id); // Ensure user can only update their own basket

                if (updateError) {
                    throw updateError;
                }
                console.log("Basket updated successfully.");
                // NEW: Redirect to the actual pool_id of the updated basket
                if (currentBasketPoolId) {
                    router.push(`/pool/${currentBasketId}` as any);
                } else {
                    // Fallback if pool_id was not found for some reason (shouldn't happen if basket exists)
                    router.push("/dashboard"); // Redirect to dashboard if pool_id is missing
                    setError("Basket updated, but could not find associated pool to redirect.");
                }
            } else {
                // CREATE new basket and join pool
                const { data, error: rpcError } = await supabase.rpc(
                    "create_basket_and_join_pool",
                    {
                        basket_data: basketData,
                    }
                );

                if (rpcError) {
                    throw rpcError;
                }

                if (!data || !data.pool_id) {
                    throw new Error("Failed to create basket and join pool: Missing pool ID.");
                }

                await supabase.rpc("track_event", {
                    event_type_param: "basket_created",
                    metadata_param: {
                        user_id: user.id,
                        shop_id: shop.id,
                        basket_total: calculateTotalAmount(),
                        pool_id: data.pool_id,
                        chatroom_id: data.chatroom_id || null,
                        basket_id: data.basket_id,
                    },
                });

                console.log("New basket created and joined pool successfully.");
                router.push(`/pool/${data.basket_id}` as any);
            }
        } catch (err: any) {
            console.error(`Error ${isEditMode ? "updating" : "creating"} basket:`, err);
            setError(err.message || `Failed to ${isEditMode ? "update" : "create"} basket`);
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-shelivery-background-gray">
                <Navigation />
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-shelivery-text-secondary">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (error && !shop) { // Only show shop not found error if shop data is missing
        return (
            <div className="min-h-screen bg-shelivery-background-gray">
                <Navigation />
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
                            Shop Not Found
                        </h2>
                        <p className="text-shelivery-text-secondary mb-6">{error}</p>
                        <Button onClick={() => router.push("/shops")}>Browse Shops</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!shop) return null; // Should be caught by the error above, but as a fallback

    const currentAmount = calculateTotalAmount();

    return (
        <div className="min-h-screen bg-shelivery-background-gray">
            <Navigation />

            <div className="pt-20 pb-6 px-4 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push("/shops")}
                        className="flex items-center gap-2 text-shelivery-text-secondary hover:text-shelivery-text-primary mb-4"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Shops
                    </button>

                    <div className="flex items-center gap-4 mb-4">
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
                        <div>
                            <h1 className="text-2xl font-bold text-shelivery-text-primary">
                                {shop.name}
                            </h1>
                            <div className="flex gap-4 text-sm text-shelivery-text-tertiary mt-1">
                                <span>Min: CHF {shop.min_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basket Details Form */}
                <div className="bg-white rounded-shelivery-lg p-4 mb-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-shelivery-text-primary mb-4">
                        {isEditMode ? "Edit Basket Details" : "Enter Basket Details"}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="basketLink" className="block text-sm font-medium text-shelivery-text-secondary mb-1">Basket Link (URL)</label>
                            <input
                                type="url"
                                id="basketLink"
                                placeholder="e.g., https://shop.com/my-order"
                                value={basketLink}
                                onChange={(e) => setBasketLink(e.target.value)}
                                className="shelivery-input w-full"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="basketAmount" className="block text-sm font-medium text-shelivery-text-secondary mb-1">Total Amount (CHF)</label>
                            <input
                                type="number"
                                id="basketAmount"
                                placeholder="e.g., 25.50"
                                value={basketAmount}
                                onChange={(e) => setBasketAmount(e.target.value)}
                                step="0.01"
                                min="0"
                                className="shelivery-input w-full"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-shelivery-sm text-sm mt-4">
                            {error}
                        </div>
                    )}
                </div>

                {/* Order Summary (Simplified) */}
                <div className="bg-white rounded-shelivery-lg p-4 border border-gray-200 mb-6">
                    <h3 className="text-lg font-semibold text-shelivery-text-primary mb-4">
                        Order Summary
                    </h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between font-semibold">
                            <span className="text-shelivery-text-primary">Total</span>
                            <span className="text-shelivery-text-primary">
                                CHF {currentAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Create/Update Basket Button */}
                <Button
                    onClick={handleSubmitBasket}
                    disabled={!canSubmitBasket() || submitting}
                    loading={submitting}
                    className="w-full"
                    size="lg"
                >
                    {submitting
                        ? (isEditMode ? "Saving Changes..." : "Creating Basket...")
                        : (isEditMode ? "Save Changes" : "Join Pool & Create Basket")}
                </Button>
            </div>
        </div>
    );
}
