// shops/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import ShopBasketTutorial from "@/components/create-basket/ShopBasketTutorial"; // UPDATED: Import the tutorial component from the new path

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
    const [basketNote, setBasketNote] = useState("");
    const [basketAmount, setBasketAmount] = useState(""); // Storing as string for input
    const [selectedLocationId, setSelectedLocationId] = useState<string>("");
    const [locationType, setLocationType] = useState<'residence' | 'meetup'>('residence');
    const [selectedLocationName, setSelectedLocationName] = useState<string>("");

    const [loading, setLoading] = useState(true); // For initial shop data fetch
    const [submitting, setSubmitting] = useState(false); // For basket creation/update process
    const [error, setError] = useState<string | null>(null);

    const [isEditMode, setIsEditMode] = useState(false); // New state to track edit mode
    const [existingBasketId, setExistingBasketId] = useState<string | null>(null); // To store the basket ID if in edit mode
    const [currentBasketPoolId, setCurrentBasketPoolId] = useState<string | null>(null); // NEW: To store the pool ID of the existing basket
    const [showTutorial, setShowTutorial] = useState(false); // NEW: State for tutorial visibility

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams(); // Get search params
    const shopId = params?.shopId as string;

    // No longer redirect if not authenticated - allow anonymous basket creation
    // Authentication will be handled at submission time

    // Read location type and meetup location from URL parameters
    useEffect(() => {
        const typeParam = searchParams.get('type');
        const meetupLocationParam = searchParams.get('meetupLocation');

        if (typeParam === 'residence' || typeParam === 'meetup') {
            setLocationType(typeParam);
        }

        if (meetupLocationParam && typeParam === 'meetup') {
            setSelectedLocationId(meetupLocationParam);
        }
    }, [searchParams]);

    // Fetch location name when selectedLocationId changes
    useEffect(() => {
        const fetchLocationName = async () => {
            if (selectedLocationId && locationType === 'meetup') {
                try {
                    const { data, error } = await supabase
                        .from('location')
                        .select('name')
                        .eq('id', selectedLocationId)
                        .single();

                    if (error) throw error;
                    setSelectedLocationName(data?.name || '');
                } catch (err) {
                    console.error('Error fetching location name:', err);
                    setSelectedLocationName('');
                }
            } else {
                setSelectedLocationName('');
            }
        };

        fetchLocationName();
    }, [selectedLocationId, locationType]);

    // Fetch shop details and handle edit mode pre-population
    useEffect(() => {
        const fetchShopAndBasket = async () => {
            if (!shopId) {
                setLoading(false);
                return;
            }

            // For anonymous users, only fetch shop data (no basket editing)
            if (!user) {
                setLoading(true);
                setError(null);

                try {
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
                } catch (err: any) {
                    console.error("Error fetching shop details:", err);
                    setError(err.message || "Failed to load shop details.");
                    setShop(null);
                } finally {
                    setLoading(false);
                }
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

                if (urlBasketId) {
                    setIsEditMode(true);
                    setExistingBasketId(urlBasketId);

                    // Fetch the full basket details for pre-population
                    const { data: existingBasketData, error: fetchBasketError } = await supabase
                        .from("basket")
                        .select("amount, link, note, pool_id, shop_id") // Select all needed fields, including shop_id for validation
                        .eq("id", urlBasketId)
                        .eq("user_id", user.id) // IMPORTANT: Ensure the user owns this basket
                        .single();

                    if (fetchBasketError || !existingBasketData) {
                        console.error("Error fetching existing basket or not found:", fetchBasketError);
                        setError("Existing basket not found or you don't have permission to edit it. Starting a new basket.");
                        setIsEditMode(false);
                        setExistingBasketId(null);
                        setBasketLink("");
                        setBasketNote("");
                        setBasketAmount("");
                        setCurrentBasketPoolId(null);
                        router.replace(`/shops/${shopId}/basket`); // Clean the URL query params
                        return; // Exit early as we're not in edit mode
                    }

                    // Validate if the basket's shop_id matches the one in the URL path
                    if (existingBasketData.shop_id !== shopId) {
                        console.warn("Mismatched shop_id for existing basket. Redirecting to new basket for this shop.");
                        setError("The basket you tried to edit belongs to a different shop. Starting a new basket.");
                        setIsEditMode(false);
                        setExistingBasketId(null);
                        setBasketLink("");
                        setBasketNote("");
                        setBasketAmount("");
                        setCurrentBasketPoolId(null);
                        router.replace(`/shops/${shopId}/basket`); // Clean the URL query params
                        return; // Exit early
                    }

                    // Pre-populate form fields
                    setBasketLink(existingBasketData.link || "");
                    setBasketNote(existingBasketData.note || "");
                    setBasketAmount(existingBasketData.amount.toString()); // Convert number to string for input
                    setCurrentBasketPoolId(existingBasketData.pool_id);

                } else {
                    // This block runs if urlBasketId is NOT present (new basket mode)
                    setIsEditMode(false);
                    setExistingBasketId(null);
                    setBasketLink("");
                    setBasketNote("");
                    setBasketAmount("");
                    setCurrentBasketPoolId(null); // Reset pool ID for new basket mode
                }

            } catch (err: any) {
                console.error("Error fetching shop or basket details:", err);
                setError(err.message || "Failed to load shop or basket details.");
                setShop(null); // Ensure shop is null on error to trigger error UI
            } finally {
                setLoading(false);
            }
        };

        fetchShopAndBasket();

        // NEW: Check localStorage for tutorial status
        const hasSeenTutorial = localStorage.getItem('hasSeenShopBasketTutorial');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, [user, shopId, searchParams, router]); // Depend on searchParams and router to react to URL changes and redirect

    const calculateTotalAmount = () => {
        const amount = parseFloat(basketAmount);
        return isNaN(amount) || amount <= 0 ? 0 : amount;
    };

    const isValidUrl = (url: string) => {
        if (!url.trim()) return true; // Empty URL is valid (optional field)
        
        const trimmedUrl = url.trim();
        
        // Try to parse as-is first
        try {
            const urlObj = new URL(trimmedUrl);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            // If it fails, try adding https:// prefix
            try {
                const urlWithProtocol = new URL(`https://${trimmedUrl}`);
                return true; // If it can be parsed with https://, it's valid
            } catch {
                return false;
            }
        }
    };

    const normalizeUrl = (url: string) => {
        if (!url.trim()) return "";
        
        const trimmedUrl = url.trim();
        
        // If it already has a protocol, return as-is
        if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
            return trimmedUrl;
        }
        
        // Otherwise, add https:// prefix
        return `https://${trimmedUrl}`;
    };

    const canSubmitBasket = () => {
        const totalAmount = calculateTotalAmount();
        const hasLink = basketLink.trim() !== "";
        const hasNote = basketNote.trim() !== "";
        const isLinkValid = isValidUrl(basketLink);

        // For meetup mode, location must be selected
        const hasLocation = locationType === 'meetup' ? selectedLocationId !== "" : true;

        // At least link OR note must be filled (can be both), amount must be > 0, link must be valid if provided
        // Location validation depends on mode
        return (
            (hasLink || hasNote) &&
            totalAmount > 0 &&
            isLinkValid &&
            hasLocation
        );
    };

    const handleSubmitBasket = async () => {
        if (!canSubmitBasket() || !shop) {
            const hasLink = basketLink.trim() !== "";
            const hasNote = basketNote.trim() !== "";
            const isLinkValid = isValidUrl(basketLink);
            
            if (!hasLink && !hasNote) {
                setError("Please provide at least a basket link or a note (or both).");
            } else if (hasLink && !isLinkValid) {
                setError("Please provide a valid URL (must start with http:// or https://).");
            } else {
                setError("Please fill in the amount field.");
            }
            return;
        }

        // If user is not authenticated, store basket data and redirect to submit-basket
        if (!user) {
            const basketData = {
                shopId: shop.id,
                shopName: shop.name,
                amount: calculateTotalAmount(),
                link: basketLink.trim() ? normalizeUrl(basketLink) : "",
                note: basketNote.trim() || ""
            };

            localStorage.setItem('pendingBasket', JSON.stringify(basketData));
            router.push("/submit-basket");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Determine the correct location_id based on delivery mode
            let finalLocationId = selectedLocationId;
            if (locationType === 'residence') {
                // Get user's dormitory and find corresponding location
                const { data: userData, error: userError } = await supabase
                    .from("user")
                    .select("dormitory_id")
                    .eq("id", user.id)
                    .single();

                if (userError || !userData?.dormitory_id) {
                    throw new Error("Unable to determine your dormitory location. Please update your profile.");
                }

                // Find the location that corresponds to this dormitory (type = 'dormitory')
                const { data: locationData, error: locationError } = await supabase
                    .from("location")
                    .select("id")
                    .eq("dormitory_id", userData.dormitory_id)
                    .eq("type", "dormitory")
                    .single();

                if (locationError || !locationData) {
                    throw new Error("Unable to find location for your dormitory.");
                }

                finalLocationId = locationData.id;
            }
            // For meetup mode, selectedLocationId is already the correct location_id

            const basketData = {
                shop_id: shop.id,
                amount: calculateTotalAmount(),
                link: basketLink.trim() ? normalizeUrl(basketLink) : null,
                note: basketNote.trim() || null,
                location_id: finalLocationId,
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
                    router.push(`/pool/${existingBasketId}` as any);
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

    // NEW: Function to handle tutorial completion
    const handleTutorialComplete = () => {
        setShowTutorial(false);
        localStorage.setItem('hasSeenShopBasketTutorial', 'true'); // Mark tutorial as seen
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-shelivery-background-gray">
                
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-shelivery-text-secondary">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Allow both authenticated and anonymous users to see the page
    // Anonymous users will be redirected to auth at submission time

    if (error && !shop) { // Only show shop not found error if shop data is missing
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

    const headerContent = (
        <div>
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

            <div className="flex items-center gap-4">
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
    );

    return (
        <PageLayout header={headerContent}>
            {/* Basket Details Form */}
            <div className="bg-white rounded-shelivery-lg p-4 mb-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-shelivery-text-primary mb-4">
                    {isEditMode ? "Edit Basket Details" : "Enter Basket Details"}
                </h2>

                <div className="space-y-6">
                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-shelivery-sm p-3" id="basket-instructions-info"> {/* ADDED ID */}
                        <p className="text-sm text-blue-800">
                            <strong>Provide order details:</strong> You can use a basket link, write a note, or use both to describe your order.
                        </p>
                    </div>

                    {/* Link Input */}
                    <div>
                        <label htmlFor="basketLink" className="block text-sm font-medium text-shelivery-text-secondary mb-1">
                            Basket Link (URL)
                        </label>
                        <input
                            type="url"
                            id="basket-link-input" // CORRECTED ID
                            placeholder="e.g., https://shop.com/my-order"
                            value={basketLink}
                            onChange={(e) => setBasketLink(e.target.value)}
                            className="shelivery-input w-full"
                        />
                    </div>

                    {/* AND/OR Divider */}
                    <div className="flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Note Input */}
                    <div>
                        <label htmlFor="basketNote" className="block text-sm font-medium text-shelivery-text-secondary mb-1">
                            Order Note
                        </label>
                        <p className="text-xs text-shelivery-text-tertiary mt-1 mb-2">
                            Provide details about what you want to order from this shop
                        </p>
                        <textarea
                            id="basket-note-input" // ADDED ID
                            placeholder="Put your shopping list or your notes here."
                            value={basketNote}
                            onChange={(e) => setBasketNote(e.target.value)}
                            className="shelivery-input w-full min-h-[120px] resize-y"
                            rows={5}
                        />
                       
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label htmlFor="basketAmount" className="block text-sm font-medium text-shelivery-text-secondary mb-1">
                            Total Amount (CHF) *
                        </label>
                        <input
                            type="number"
                            id="basket-amount-input" // CORRECTED ID
                            placeholder="e.g., 25.50"
                            value={basketAmount}
                            onChange={(e) => setBasketAmount(e.target.value)}
                            step="0.1"
                            min="0"
                            className="shelivery-input w-full"
                            required
                        />
                    </div>

                    {/* Selected Location Display */}
                    {locationType === 'meetup' && selectedLocationId && selectedLocationName && (
                        <div className="bg-blue-50 border border-blue-200 rounded-shelivery-sm p-3">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm text-blue-800">
                                    Meetup point is set to {selectedLocationName}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-shelivery-sm text-sm mt-4">
                        {error}
                    </div>
                )}
            </div>

            {/* Order Summary (Simplified) */}
            <div className="bg-white rounded-shelivery-lg p-4 border border-gray-200 mb-6" id="order-summary-section"> {/* ADDED ID */}
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
                id="submit-basket-button" // ADDED ID
            >
                {submitting
                    ? (isEditMode ? "Saving Changes..." : "Creating Basket...")
                    : (isEditMode ? "Save Changes" : "Join Pool & Create Basket")}
            </Button>

            {/* NEW: Render tutorial conditionally */}
            {showTutorial && <ShopBasketTutorial onComplete={handleTutorialComplete} />}
        </PageLayout>
    );
}
