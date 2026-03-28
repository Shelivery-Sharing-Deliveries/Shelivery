"use client";

import { useState, useEffect, useRef } from "react";
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

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "pendingAlphaBasket";

interface PersistedDraft {
  shopId: string | null;
  location: LocationData | null;
  basketLink: string;
  basketNote: string;
  basketAmount: string;
  step: number;
}

function saveDraft(draft: PersistedDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {}
}

function loadDraft(): PersistedDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedDraft) : null;
  } catch {
    return null;
  }
}

function clearDraft() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlphaTrialPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ── Shop state
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopSearchQuery, setShopSearchQuery] = useState("");

  // ── Location state
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [userPreferedKm, setUserPreferedKm] = useState<number>(5);

  // ── Basket form state
  const [basketLink, setBasketLink] = useState("");
  const [basketNote, setBasketNote] = useState("");
  const [basketAmount, setBasketAmount] = useState("");

  // ── Pool matching state
  const [nearbyPools, setNearbyPools] = useState<NearbyPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [expandedSearchLoading, setExpandedSearchLoading] = useState(false);
  const [currentSearchRadius, setCurrentSearchRadius] = useState<number>(5);

  // ── UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [restoredFromDraft, setRestoredFromDraft] = useState(false);

  // Prevent saving during the initial restore phase
  const isRestoring = useRef(true);

  // ── Fetch shops then restore draft ───────────────────────────────────────
  useEffect(() => {
    fetchShops();
  }, []);

  // ── Load user location data when authenticated ───────────────────────────
  useEffect(() => {
    const loadUserLocationData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("user")
          .select("address, lat, lng, prefered_km")
          .eq("id", user.id)
          .single();

        if (error) {
          
          console.log("No user location data found, will use defaults");
          return;
        }

        if (data && data.lat && data.lng) {
          // Initialize user location with saved data
          const locationData: LocationData = {
            latitude: data.lat,
            longitude: data.lng,
            address: data.address || undefined,
          };

          // Check for draft during restoration and prioritize it over user location
          const isRestored = typeof window !== 'undefined' && window.location.search.includes('restored=true');
          if (isRestored) {
            const draft = loadDraft();
            if (draft && draft.location) {
              setUserLocation(draft.location);
            } else {
              setUserLocation(locationData);
            }
          } else {
            setUserLocation(locationData);
          }

          // Also set the user's preferred distance for pool finding
          if (data.prefered_km) {
            setUserPreferedKm(data.prefered_km);
          }
        }
      } catch (err) {
        console.log("Error loading user location data:", err);
      }
    };

    loadUserLocationData();
  }, [user]);

  async function fetchShops() {
    try {
      const { data, error } = await supabase
        .from("shop")
        .select("id, name, min_amount, logo_url, is_active")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;

      const fetchedShops: Shop[] = data || [];
      setShops(fetchedShops);

      // Restore draft after shops are loaded so we can match shopId → Shop object
      // ONLY restore if we came back from an auth redirect
      const isRestored = typeof window !== 'undefined' && window.location.search.includes('restored=true');
      console.log('Checking the isRestored', isRestored);
      if (isRestored) {
        const draft = loadDraft();
        if (draft) {
          if (draft.shopId) {
            const match = fetchedShops.find((s) => s.id === draft.shopId);
            if (match) setSelectedShop(match);
          }
          if (draft.basketLink) setBasketLink(draft.basketLink);
          if (draft.basketNote) setBasketNote(draft.basketNote);
          if (draft.basketAmount) setBasketAmount(draft.basketAmount);
          // Restore to furthest useful step (max step 3 — don't skip to pool selection)
          setCurrentStep(Math.min(draft.step, 3));
          setRestoredFromDraft(true);
        }
      } else {
        clearDraft();
      }
    } catch {
      setError("Failed to load shops");
    } finally {
      setLoading(false);
      // Allow saving after a tick so the restored state is committed first
      setTimeout(() => { isRestoring.current = false; }, 50);
    }
  }

  // ── Auto-save draft whenever form state changes ───────────────────────────
  useEffect(() => {
    if (isRestoring.current) return;
    saveDraft({
      shopId: selectedShop?.id ?? null,
      location: userLocation,
      basketLink,
      basketNote,
      basketAmount,
      step: currentStep,
    });
  }, [selectedShop, userLocation, basketLink, basketNote, basketAmount, currentStep]);

  // ─────────────────────────────────────────────────────────────────────────

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

    // Unauthenticated: save full draft & redirect to login
    if (!user) {
      saveDraft({
        shopId: selectedShop.id,
        location: userLocation,
        basketLink: basketLink.trim() ? normalizeUrl(basketLink) : "",
        basketNote: basketNote.trim(),
        basketAmount,
        step: 3,
      });
      
      const params = new URLSearchParams();
      params.set('redirect', '/alpha?restored=true');
      router.push(`/auth?${params.toString()}` as any);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc("find_nearby_pools", {
        p_shop_id: selectedShop.id,
        p_lat: userLocation.latitude,
        p_lng: userLocation.longitude,
        p_max_radius_km: userPreferedKm,
      });
      if (rpcError) throw rpcError;
      setNearbyPools(data || []);
      setSelectedPool(null);
      setCurrentSearchRadius(userPreferedKm); // Set current search radius
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to find nearby pools");
    } finally {
      setSubmitting(false);
    }
  }

  // Expand search range when no pools found
  async function handleExpandSearch() {
    if (!selectedShop || !userLocation) return;

    setExpandedSearchLoading(true);
    setError(null);

    try {
      // Double the search radius for expanded search, but cap at 20km
      // If current search radius is already >= 20km, don't expand further
      const expandedRadius = Math.min(Math.max(currentSearchRadius * 2, currentSearchRadius), 20);

      const { data, error: rpcError } = await supabase.rpc("find_nearby_pools", {
        p_shop_id: selectedShop.id,
        p_lat: userLocation.latitude,
        p_lng: userLocation.longitude,
        p_max_radius_km: expandedRadius,
      });
      if (rpcError) throw rpcError;

      setNearbyPools(data || []);
      setSelectedPool(null);
      setCurrentSearchRadius(expandedRadius); // Update current search radius
    } catch (err: any) {
      setError(err.message || "Failed to expand search");
    } finally {
      setExpandedSearchLoading(false);
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

      // Clear draft after successful submission
      clearDraft();

      setSuccess("Basket created! Redirecting...");
      setTimeout(() => router.push(`/pool/${data.basket_id}` as any), 500);
    } catch (err: any) {
      setError(err.message || "Failed to create basket");
    } finally {
      setMatchingLoading(false);
    }
  }

  // ── Loading screen ────────────────────────────────────────────────────────
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

  const totalSteps = 4;

  const header = (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-shelivery-primary-yellow text-black text-xs font-bold rounded">ALPHA</span>
        <span className="text-sm text-shelivery-text-secondary">Create Your Order</span>
      </div>
      <button
        onClick={() => {
          clearDraft();
          setSelectedShop(null);
          setUserLocation(null);
          setBasketLink("");
          setBasketNote("");
          setBasketAmount("");
          setCurrentStep(1);
          setRestoredFromDraft(false);
        }}
        className="text-xs text-shelivery-text-secondary hover:text-shelivery-text-primary bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
        title="Clear Draft"
      >
        Reset
      </button>
    </div>
  );

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
          onExpandSearch={handleExpandSearch}
          expandedSearchLoading={expandedSearchLoading}
          currentSearchRadius={currentSearchRadius}
        />
      )}

    </PageLayout>
  );
}