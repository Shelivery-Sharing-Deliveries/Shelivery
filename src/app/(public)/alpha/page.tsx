"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { PageLayout } from "@/components/ui/PageLayout";
import {
  ShopSelectionStep,
  LocationStep,
  OrderDetailsStep,
  PoolSelectionStep,
  type Shop,
  type LocationData,
  type NearbyPool,
} from "@/components/alpha";

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    try { new URL(`https://${url.trim()}`); return true; } catch { return false; }
  }
}

function normalizeUrl(url: string): string {
  const t = url.trim();
  return t.startsWith("http://") || t.startsWith("https://") ? t : `https://${t}`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AlphaTrialPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ── Shop state
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopSearchQuery, setShopSearchQuery] = useState("");

  // ── Location state
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);

  // ── Basket form state
  const [basketLink, setBasketLink] = useState("");
  const [basketNote, setBasketNote] = useState("");
  const [basketAmount, setBasketAmount] = useState("");

  // ── Pool matching state
  const [nearbyPools, setNearbyPools] = useState<NearbyPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);

  // ── UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { fetchShops(); }, []);

  async function fetchShops() {
    try {
      const { data, error } = await supabase
        .from("shop")
        .select("id, name, min_amount, logo_url, is_active")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      setShops(data || []);
    } catch {
      setError("Failed to load shops");
    } finally {
      setLoading(false);
    }
  }

  function calculateTotal(): number {
    const v = parseFloat(basketAmount);
    return isNaN(v) || v <= 0 ? 0 : v;
  }

  function canSubmitBasket(): boolean {
    return (
      (basketLink.trim() !== "" || basketNote.trim() !== "") &&
      calculateTotal() > 0 &&
      isValidUrl(basketLink) &&
      selectedShop !== null &&
      userLocation !== null
    );
  }

  // Step 3 → 4: find nearby pools
  async function handleFindPools() {
    if (!canSubmitBasket() || !selectedShop || !userLocation) return;

    // Unauthenticated: save & redirect
    if (!user) {
      localStorage.setItem("pendingBasket", JSON.stringify({
        shopId: selectedShop.id,
        shopName: selectedShop.name,
        amount: calculateTotal(),
        link: basketLink.trim() ? normalizeUrl(basketLink) : "",
        note: basketNote.trim() || "",
        location: userLocation,
      }));
      router.push("/submit-basket");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc("find_nearby_pools", {
        p_shop_id: selectedShop.id,
        p_lat: userLocation.latitude,
        p_lng: userLocation.longitude,
        p_max_radius_km: 5.0,
      });
      if (rpcError) throw rpcError;
      setNearbyPools(data || []);
      setSelectedPool(null); // default: create new pool
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to find nearby pools");
    } finally {
      setSubmitting(false);
    }
  }

  // Step 4: confirm pool choice and create basket
  async function handleConfirmPool(poolId: string | null) {
    if (!selectedShop || !userLocation || !user) return;

    setMatchingLoading(true);
    setError(null);

    try {
      const basketData = {
        shop_id: selectedShop.id,
        amount: calculateTotal(),
        link: basketLink.trim() ? normalizeUrl(basketLink) : null,
        note: basketNote.trim() || null,
        user_id: user.id,
        address: userLocation.address || null,
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius_km: 1.0,
      };

      const { data, error: rpcError } = await supabase.rpc(
        "create_basket_and_join_pool",
        { basket_data: basketData, pool_id: poolId }
      );
      if (rpcError) throw rpcError;
      if (!data?.pool_id) throw new Error("Failed to create basket: missing pool ID.");

      await supabase.rpc("track_event", {
        event_type_param: "basket_created_alpha",
        metadata_param: {
          user_id: user.id,
          shop_id: selectedShop.id,
          basket_total: calculateTotal(),
          pool_id: data.pool_id,
          basket_id: data.basket_id,
          joined_existing_pool: poolId !== null,
        },
      });

      setSuccess("Basket created! Redirecting...");
      setTimeout(() => router.push(`/pool/${data.basket_id}` as any), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create basket");
    } finally {
      setMatchingLoading(false);
    }
  }

  // ── Loading screen
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-shelivery-background-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-shelivery-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const header = (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-1 bg-shelivery-primary-yellow text-black text-xs font-bold rounded">ALPHA</span>
        <span className="text-sm text-shelivery-text-secondary">Create Your Order</span>
      </div>
    </div>
  );

  // Progress dots (steps 1–4, but show 1–3 visually like before + extend to 4)
  const totalSteps = 4;

  return (
    <PageLayout header={header}>
      {/* Step indicators */}
      <div className="flex items-center justify-center mb-6">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step ? "bg-shelivery-primary-yellow text-black" : "bg-gray-200 text-gray-500"}`}>
              {step}
            </div>
            {step < totalSteps && (
              <div className={`w-12 h-1 ${currentStep > step ? "bg-shelivery-primary-yellow" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {currentStep === 1 && (
        <ShopSelectionStep
          shops={shops}
          selectedShop={selectedShop}
          shopSearchQuery={shopSearchQuery}
          onShopSelect={setSelectedShop}
          onSearchChange={setShopSearchQuery}
          onContinue={() => setCurrentStep(2)}
        />
      )}

      {/* Step 2 */}
      {currentStep === 2 && (
        <LocationStep
          userLocation={userLocation}
          onLocationSelect={setUserLocation}
          onContinue={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {/* Step 3 */}
      {currentStep === 3 && selectedShop && userLocation && (
        <OrderDetailsStep
          selectedShop={selectedShop}
          userLocation={userLocation}
          basketLink={basketLink}
          basketNote={basketNote}
          basketAmount={basketAmount}
          canSubmit={canSubmitBasket()}
          submitting={submitting}
          error={error}
          onLinkChange={setBasketLink}
          onNoteChange={setBasketNote}
          onAmountChange={setBasketAmount}
          onSubmit={handleFindPools}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {/* Step 4 */}
      {currentStep === 4 && selectedShop && userLocation && (
        <PoolSelectionStep
          selectedShop={selectedShop}
          userLocation={userLocation}
          nearbyPools={nearbyPools}
          selectedPool={selectedPool}
          totalAmount={calculateTotal()}
          loading={matchingLoading}
          error={error}
          success={success}
          onPoolSelect={setSelectedPool}
          onConfirm={handleConfirmPool}
          onBack={() => { setError(null); setCurrentStep(3); }}
        />
      )}
    </PageLayout>
  );
}