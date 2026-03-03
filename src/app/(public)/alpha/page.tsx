"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";
import { MapboxLocationPicker } from "@/components/mapbox";

interface LocationData {
  longitude: number;
  latitude: number;
  address?: string;
  placeName?: string;
}

interface Shop {
  id: string;
  name: string;
  min_amount: number;
  logo_url: string | null;
  is_active: boolean;
}

export default function AlphaTrialPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Shop selection state
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopSearchQuery, setShopSearchQuery] = useState("");
  
  // Location state
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  
  // Basket form state
  const [basketLink, setBasketLink] = useState("");
  const [basketNote, setBasketNote] = useState("");
  const [basketAmount, setBasketAmount] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Current step for multi-step form
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch shops on mount
  useEffect(() => {
    fetchShops();
  }, []);

  // Filter shops based on search query
  useEffect(() => {
    if (!shopSearchQuery.trim()) {
      setFilteredShops(shops);
    } else {
      const query = shopSearchQuery.toLowerCase();
      setFilteredShops(
        shops.filter((shop) =>
          shop.name.toLowerCase().includes(query)
        )
      );
    }
  }, [shopSearchQuery, shops]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("shop")
        .select("id, name, min_amount, logo_url, is_active")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setShops(data || []);
      setFilteredShops(data || []);
    } catch (err: any) {
      console.error("Error fetching shops:", err);
      setError("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: LocationData) => {
    setUserLocation(location);
  };

  const calculateTotalAmount = () => {
    const amount = parseFloat(basketAmount);
    return isNaN(amount) || amount <= 0 ? 0 : amount;
  };

  const isValidUrl = (url: string) => {
    if (!url.trim()) return true;
    const trimmedUrl = url.trim();
    try {
      const urlObj = new URL(trimmedUrl);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      try {
        new URL(`https://${trimmedUrl}`);
        return true;
      } catch {
        return false;
      }
    }
  };

  const normalizeUrl = (url: string) => {
    if (!url.trim()) return "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  const canProceedToStep2 = () => {
    return selectedShop !== null;
  };

  const canProceedToStep3 = () => {
    return userLocation !== null;
  };

  const canSubmitBasket = () => {
    const totalAmount = calculateTotalAmount();
    const hasLink = basketLink.trim() !== "";
    const hasNote = basketNote.trim() !== "";
    const isLinkValid = isValidUrl(basketLink);

    return (
      (hasLink || hasNote) &&
      totalAmount > 0 &&
      isLinkValid &&
      selectedShop !== null &&
      userLocation !== null
    );
  };

  const handleSubmitBasket = async () => {
    if (!canSubmitBasket() || !selectedShop || !userLocation) {
      setError("Please fill in all required fields");
      return;
    }

    // If user is not authenticated, store basket data and redirect to auth
    if (!user) {
      const basketData = {
        shopId: selectedShop.id,
        shopName: selectedShop.name,
        amount: calculateTotalAmount(),
        link: basketLink.trim() ? normalizeUrl(basketLink) : "",
        note: basketNote.trim() || "",
        location: userLocation,
      };

      localStorage.setItem("pendingBasket", JSON.stringify(basketData));
      router.push("/submit-basket");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Store location data directly in basket (not in location table)
      const basketData = {
        shop_id: selectedShop.id,
        amount: calculateTotalAmount(),
        link: basketLink.trim() ? normalizeUrl(basketLink) : null,
        note: basketNote.trim() || null,
        user_id: user.id,
        // Store location directly in basket
        delivery_address: userLocation.address || null,
        delivery_latitude: userLocation.latitude,
        delivery_longitude: userLocation.longitude,
      };

      // Create basket and join pool
      const { data, error: rpcError } = await supabase.rpc(
        "create_basket_and_join_pool",
        { basket_data: basketData }
      );

      if (rpcError) throw rpcError;

      if (!data || !data.pool_id) {
        throw new Error("Failed to create basket and join pool: Missing pool ID.");
      }

      // Track event
      await supabase.rpc("track_event", {
        event_type_param: "basket_created_alpha",
        metadata_param: {
          user_id: user.id,
          shop_id: selectedShop.id,
          basket_total: calculateTotalAmount(),
          pool_id: data.pool_id,
          chatroom_id: data.chatroom_id || null,
          basket_id: data.basket_id,
          location_address: userLocation.address,
        },
      });

      setSuccess("Basket created successfully! Redirecting to pool...");
      
      setTimeout(() => {
        router.push(`/pool/${data.basket_id}` as any);
      }, 1500);
    } catch (err: any) {
      console.error("Error creating basket:", err);
      setError(err.message || "Failed to create basket");
    } finally {
      setSubmitting(false);
    }
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

  const headerContent = (
    <div>
      <div className="flex items-center gap-2 text-shelivery-text-secondary hover:text-shelivery-text-primary mb-4">
        <span className="px-2 py-1 bg-shelivery-primary-yellow text-black text-xs font-bold rounded">
          ALPHA
        </span>
        <span className="text-sm">Trial Version</span>
      </div>
      <h1 className="text-2xl font-bold text-shelivery-text-primary">
        Create Your Order
      </h1>
      <p className="text-shelivery-text-secondary mt-1">
        Test the new Mapbox location picker and basket creation flow
      </p>
    </div>
  );

  return (
    <PageLayout header={headerContent}>
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step
                  ? "bg-shelivery-primary-yellow text-black"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 ${
                  currentStep > step ? "bg-shelivery-primary-yellow" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Shop */}
      {currentStep === 1 && (
        <div className="bg-white rounded-shelivery-lg p-4 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-shelivery-text-primary mb-4">
            Step 1: Select a Shop
          </h2>

          {/* Search Box */}
          <div className="relative mb-4">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search shops..."
              value={shopSearchQuery}
              onChange={(e) => setShopSearchQuery(e.target.value)}
              className="shelivery-input w-full pl-10"
            />
          </div>

          {/* Scrollable Shop Grid */}
          <div className="max-h-[400px] overflow-y-auto pr-1 -mr-1">
            <div className="grid grid-cols-2 gap-3">
              {filteredShops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShop(shop)}
                  className={`p-4 rounded-shelivery-lg border-2 transition-all text-left h-[100px] ${
                    selectedShop?.id === shop.id
                      ? "border-shelivery-primary-yellow bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-shelivery-md flex items-center justify-center flex-shrink-0">
                      {shop.logo_url ? (
                        <img
                          src={shop.logo_url}
                          alt={shop.name}
                          className="w-full h-full object-contain rounded-shelivery-md"
                        />
                      ) : (
                        <svg
                          className="w-6 h-6 text-gray-400"
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
                    <div className="text-center">
                      <p className="font-medium text-shelivery-text-primary text-sm truncate w-full">
                        {shop.name}
                      </p>
                      <p className="text-xs text-shelivery-text-tertiary">
                        Min: CHF {shop.min_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredShops.length === 0 && (
              <div className="text-center py-8 text-shelivery-text-secondary">
                No shops found matching "{shopSearchQuery}"
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedToStep2()}
              className="w-full"
            >
              Continue to Location
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Set Location */}
      {currentStep === 2 && (
        <div className="bg-white rounded-shelivery-lg p-4 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-shelivery-text-primary mb-4">
            Step 2: Set Your Delivery Location
          </h2>

          <MapboxLocationPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={userLocation || undefined}
            label="Delivery Address"
            placeholder="Search for your address in Switzerland..."
          />

          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              disabled={!canProceedToStep3()}
              className="flex-1"
            >
              Continue to Order Details
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Order Details */}
      {currentStep === 3 && (
        <div className="bg-white rounded-shelivery-lg p-4 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-shelivery-text-primary mb-4">
            Step 3: Enter Order Details
          </h2>

          {/* Selected Shop & Location Summary */}
          <div className="bg-gray-50 rounded-shelivery-sm p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-shelivery-text-secondary">Shop:</span>
              <span className="text-sm font-medium text-shelivery-text-primary">
                {selectedShop?.name}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm text-shelivery-text-secondary flex-shrink-0">Location:</span>
              <span className="text-sm font-medium text-shelivery-text-primary text-right">
                {userLocation?.placeName || userLocation?.address}
              </span>
            </div>
            {userLocation && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-shelivery-text-tertiary">
                  📍 {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Link Input */}
            <div>
              <label
                htmlFor="basketLink"
                className="block text-sm font-medium text-shelivery-text-secondary mb-1"
              >
                Basket Link (URL)
              </label>
              <input
                type="url"
                id="basketLink"
                placeholder="e.g., https://shop.com/my-order"
                value={basketLink}
                onChange={(e) => setBasketLink(e.target.value)}
                className="shelivery-input w-full"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-sm text-shelivery-text-tertiary">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Note Input */}
            <div>
              <label
                htmlFor="basketNote"
                className="block text-sm font-medium text-shelivery-text-secondary mb-1"
              >
                Order Note
              </label>
              <textarea
                id="basketNote"
                placeholder="Describe what you want to order..."
                value={basketNote}
                onChange={(e) => setBasketNote(e.target.value)}
                className="shelivery-input w-full min-h-[100px] resize-y"
                rows={4}
              />
            </div>

            {/* Amount Input */}
            <div>
              <label
                htmlFor="basketAmount"
                className="block text-sm font-medium text-shelivery-text-secondary mb-1"
              >
                Total Amount (CHF) *
              </label>
              <input
                type="number"
                id="basketAmount"
                placeholder="e.g., 25.50"
                value={basketAmount}
                onChange={(e) => setBasketAmount(e.target.value)}
                step="0.1"
                min="0"
                className="shelivery-input w-full"
                required
              />
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-shelivery-sm text-sm mt-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-shelivery-sm text-sm mt-4">
              {success}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(2)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmitBasket}
              disabled={!canSubmitBasket() || submitting}
              loading={submitting}
              className="flex-1"
            >
              {submitting ? "Creating..." : "Create Basket"}
            </Button>
          </div>
        </div>
      )}

      {/* Alpha Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-shelivery-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          🧪 Alpha Trial Information
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• This page uses Mapbox for location selection</li>
          <li>• Your location is stored directly with your basket</li>
          <li>• All features are in testing - expect changes</li>
          <li>• Feedback is appreciated!</li>
        </ul>
      </div>
    </PageLayout>
  );
}
