import { useState, useEffect, useRef } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShopSelectionStep } from "../../../components/stores/ShopSelectionStep";
import { LocationStep } from "../../../components/stores/LocationStep";
import { OrderDetailsStep } from "../../../components/stores/OrderDetailsStep";
import { PoolSelectionStep } from "../../../components/stores/PoolSelectionStep";
import { Shop, LocationData, NearbyPool } from "../../../types/stores/types";
import PageLayout from "@/components/ui/PageLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/providers/ThemeProvider";

// ─── Draft persistence ────────────────────────────────────────────────────────

const DRAFT_KEY = "pendingMobileBasketDraft";
const DRAFTS_LIST_KEY = "mobileBasketDraftsList";

export interface PersistedDraft {
  shopId: string | null;
  shopName: string | null;
  shopLogo: string | null;
  location: LocationData | null;
  basketLink: string;
  basketNote: string;
  basketAmount: string;
  step: number;
}

// ── Multi-draft list helpers ──────────────────────────────────────────────────

async function upsertDraftInList(draft: PersistedDraft) {
  if (!draft.shopId) return;
  try {
    const raw = await AsyncStorage.getItem(DRAFTS_LIST_KEY);
    const list: PersistedDraft[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((d) => d.shopId === draft.shopId);
    if (idx >= 0) {
      list[idx] = draft;
    } else {
      list.push(draft);
    }
    await AsyncStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(list));
  } catch {}
}

async function removeDraftFromList(shopId: string) {
  try {
    const raw = await AsyncStorage.getItem(DRAFTS_LIST_KEY);
    if (!raw) return;
    const list: PersistedDraft[] = JSON.parse(raw);
    await AsyncStorage.setItem(
      DRAFTS_LIST_KEY,
      JSON.stringify(list.filter((d) => d.shopId !== shopId))
    );
  } catch {}
}

// ── Single active-draft helpers ───────────────────────────────────────────────

async function saveDraft(draft: PersistedDraft) {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    // Keep the multi-draft list in sync whenever a shop is selected
    if (draft.shopId) {
      await upsertDraftInList(draft);
    }
  } catch {}
}

async function loadDraft(): Promise<PersistedDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as PersistedDraft) : null;
  } catch {
    return null;
  }
}

async function clearDraft(shopId?: string | null) {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
    if (shopId) await removeDraftFromList(shopId);
  } catch {}
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    try {
      new URL(`https://${url.trim()}`);
      return true;
    } catch {
      return false;
    }
  }
}

function normalizeUrl(url: string): string {
  const t = url.trim();
  return t.startsWith("http://") || t.startsWith("https://") ? t : `https://${t}`;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CreateOrderFlow() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();

  // ── Shop state
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopSearchQuery, setShopSearchQuery] = useState("");

  // ── Location state
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [userPreferredKm, setUserPreferredKm] = useState<number>(5);

  // ── Basket form state
  const [basketLink, setBasketLink] = useState("");
  const [basketNote, setBasketNote] = useState("");
  const [basketAmount, setBasketAmount] = useState("");

  // ── Pool matching state
  const [nearbyPools, setNearbyPools] = useState<NearbyPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [expandedSearchLoading, setExpandedSearchLoading] = useState(false);
  const [currentSearchRadius, setCurrentSearchRadius] = useState<number>(5);

  // ── Initialization state
  const [draftInitialized, setDraftInitialized] = useState(false);
  const activeDraftRef = useRef<PersistedDraft | null>(null);

  // ── UI state
  const [step, setStep] = useState(1);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const totalSteps = 4;

  // ── STEP 1: Load draft first (before anything else) ───────────────────────
  useEffect(() => {
    const initDraft = async () => {
      const draft = await loadDraft();
      activeDraftRef.current = draft;

      if (draft) {
        // Apply draft form data immediately
        if (draft.location) setUserLocation(draft.location);
        if (draft.basketLink) setBasketLink(draft.basketLink);
        if (draft.basketNote) setBasketNote(draft.basketNote);
        if (draft.basketAmount) setBasketAmount(draft.basketAmount);
        // Step is set after shops load (need selectedShop to render step 3)
      }

      setDraftInitialized(true);
    };
    initDraft();
  }, []);

  // ── STEP 2: Load shops after draft is initialized ─────────────────────────
  useEffect(() => {
    if (!draftInitialized) return;
    fetchShops();
  }, [draftInitialized]);

  // ── STEP 3: Load profile location ONLY if draft has no location ───────────
  useEffect(() => {
    if (!draftInitialized || !user) return;
    // If draft already has a location, don't overwrite it
    if (activeDraftRef.current?.location) return;

    const loadProfileLocation = async () => {
      try {
        const { data } = await supabase
          .from("user")
          .select("address, lat, lng, prefered_km")
          .eq("id", user.id)
          .single();

        if (data?.lat && data?.lng) {
          setUserLocation({
            latitude: data.lat,
            longitude: data.lng,
            address: data.address || undefined,
          });
        }
        if (data?.prefered_km) {
          setUserPreferredKm(data.prefered_km);
        }
      } catch {}
    };
    loadProfileLocation();
  }, [draftInitialized, user]);

  async function fetchShops() {
    try {
      const { data, error: err } = await supabase
        .from("shop")
        .select("id, name, min_amount, logo_url, is_active")
        .eq("is_active", true)
        .order("name");
      if (err) throw err;
      const shopList = data || [];
      setShops(shopList);

      // Restore shop from draft
      const draft = activeDraftRef.current;
      if (draft?.shopId) {
        const match = shopList.find((s) => s.id === draft.shopId);
        if (match) {
          setSelectedShop(match);
          // Now that shop is loaded, jump to the saved step
          setStep(Math.min(draft.step, 3));
        }
      }
    } catch {
      setError("Failed to load shops");
    } finally {
      setShopsLoading(false);
    }
  }

  // ── Auto-save draft only after user has confirmed shop selection (step >= 2) ──
  useEffect(() => {
    if (!draftInitialized) return; // Don't save until draft is initialized
    if (step < 2) return; // Don't save draft while user is still browsing shops on step 1
    if (success) return; // Don't save draft after a successful pool creation/join
    saveDraft({
      shopId: selectedShop?.id ?? null,
      shopName: selectedShop?.name ?? null,
      shopLogo: selectedShop?.logo_url ?? null,
      location: userLocation,
      basketLink,
      basketNote,
      basketAmount,
      step,
    });
  }, [draftInitialized, selectedShop, userLocation, basketLink, basketNote, basketAmount, step, success]);

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

    // Auth guard: save draft and redirect to auth if not logged in
    if (!user) {
      await saveDraft({
        shopId: selectedShop.id,
        shopName: selectedShop.name,
        shopLogo: selectedShop.logo_url ?? null,
        location: userLocation,
        basketLink,
        basketNote,
        basketAmount,
        step: 3,
      });
      await AsyncStorage.setItem("pendingAuthReturnRoute", "/(tabs)/stores/create");
      router.push("/auth" as any);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc("find_nearby_pools", {
        p_shop_id: selectedShop.id,
        p_lat: userLocation.latitude,
        p_lng: userLocation.longitude,
        p_max_radius_km: userPreferredKm,
      });
      if (rpcError) throw rpcError;
      setNearbyPools(data || []);
      setSelectedPool(null);
      setCurrentSearchRadius(userPreferredKm);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to find nearby pools");
    } finally {
      setSubmitting(false);
    }
  }

  // Expand pool search radius
  async function handleExpandSearch() {
    if (!selectedShop || !userLocation) return;

    setExpandedSearchLoading(true);
    setError(null);

    try {
      const expandedRadius = Math.min(currentSearchRadius * 2, 20);
      const { data, error: rpcError } = await supabase.rpc("find_nearby_pools", {
        p_shop_id: selectedShop.id,
        p_lat: userLocation.latitude,
        p_lng: userLocation.longitude,
        p_max_radius_km: expandedRadius,
      });
      if (rpcError) throw rpcError;
      setNearbyPools(data || []);
      setSelectedPool(null);
      setCurrentSearchRadius(expandedRadius);
    } catch (err: any) {
      setError(err.message || "Failed to expand search");
    } finally {
      setExpandedSearchLoading(false);
    }
  }

  // Step 4: confirm pool choice and create basket
  async function handleConfirmPool(poolId: string | null) {
    if (!selectedShop || !userLocation) {
      setError("Missing shop or location information. Please start over.");
      return;
    }

    // Auth guard: save draft and redirect to auth if not logged in
    if (!user) {
      await saveDraft({
        shopId: selectedShop.id,
        shopName: selectedShop.name,
        shopLogo: selectedShop.logo_url ?? null,
        location: userLocation,
        basketLink,
        basketNote,
        basketAmount,
        step: 3,
      });
      await AsyncStorage.setItem("pendingAuthReturnRoute", "/(tabs)/stores/create");
      router.push("/auth" as any);
      return;
    }

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

      // Track event (best-effort, fire-and-forget)
      (async () => {
        try {
          await supabase.rpc("track_event", {
            event_type_param: "basket_created_mobile",
            metadata_param: {
              user_id: user.id,
              shop_id: selectedShop.id,
              basket_total: calculateTotal(),
              pool_id: data.pool_id,
              basket_id: data.basket_id,
              joined_existing_pool: poolId !== null,
            },
          });
        } catch {}
      })();

      // Pass shopId so both DRAFT_KEY and DRAFTS_LIST_KEY are cleared
      await clearDraft(selectedShop.id);
      activeDraftRef.current = null;
      setSuccess("Basket created! Redirecting...");

      setTimeout(() => {
        router.push(`/pool/${data.basket_id}` as any);
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to create basket");
    } finally {
      setMatchingLoading(false);
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setError(null);
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleReset = async () => {
    await clearDraft();
    activeDraftRef.current = null;
    setSelectedShop(null);
    setUserLocation(null);
    setBasketLink("");
    setBasketNote("");
    setBasketAmount("");
    setNearbyPools([]);
    setSelectedPool(null);
    setError(null);
    setSuccess(null);
    setStep(1);
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!draftInitialized || shopsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? colors['shelivery-card-background'] : "#EAE4E4" }]}>
        <ActivityIndicator size="large" color={colors['shelivery-primary-yellow']} />
        <Text style={[styles.loadingText, { color: colors['shelivery-text-secondary'] }]}>
          {!draftInitialized ? "Restoring draft..." : "Loading shops..."}
        </Text>
      </View>
    );
  }

  const header = (
    <View style={styles.headerRow}>
      <TouchableOpacity style={[styles.backButton, { backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : "#F3F4F6" }]} onPress={handleBack}>
        <Ionicons name="arrow-back" size={22} color={colors['shelivery-text-primary']} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors['shelivery-text-primary'] }]}>Create Order</Text>
      <TouchableOpacity style={[styles.resetButton, { backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : "#F3F4F6" }]} onPress={handleReset}>
        <Text style={[styles.resetButtonText, { color: colors['shelivery-text-secondary'] }]}>Reset</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <PageLayout header={header}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Step indicators */}
        <View style={styles.stepIndicatorRow}>
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <View key={s} style={styles.stepIndicatorItem}>
              <View style={[styles.stepDot, { backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : "#E5E8EB" }, step >= s && styles.stepDotActive]}>
                <Text style={[styles.stepDotText, { color: isDark ? colors['shelivery-text-tertiary'] : "#6B7280" }, step >= s && styles.stepDotTextActive]}>
                  {s}
                </Text>
              </View>
              {s < totalSteps && (
                <View style={[styles.stepConnector, { backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : "#E5E8EB" }, step > s && styles.stepConnectorActive]} />
              )}
            </View>
          ))}
        </View>

        {/* Step 1: Shop Selection */}
        {step === 1 && (
          <ShopSelectionStep
            shops={shops}
            selectedShop={selectedShop}
            shopSearchQuery={shopSearchQuery}
            onShopSelect={setSelectedShop}
            onSearchChange={setShopSearchQuery}
            onContinue={() => setStep(2)}
          />
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <LocationStep
            userLocation={userLocation}
            onLocationSelect={setUserLocation}
            onContinue={() => setStep(3)}
            onBack={handleBack}
          />
        )}

        {/* Step 3: Order Details */}
        {step === 3 && selectedShop && userLocation && (
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
            onBack={handleBack}
          />
        )}

        {/* Step 3 fallback: if shop or location missing, go back to step 1 */}
        {step === 3 && (!selectedShop || !userLocation) && (
          <View style={styles.fallbackContainer}>
            <Text style={[styles.fallbackText, { color: colors['shelivery-text-secondary'] }]}>
              {!selectedShop ? "Please select a shop first." : "Please set your delivery location."}
            </Text>
            <TouchableOpacity style={styles.fallbackButton} onPress={() => setStep(1)}>
              <Text style={styles.fallbackButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4: Pool Selection */}
        {step === 4 && selectedShop && userLocation && (
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
            onBack={() => { setError(null); setStep(3); }}
            onExpandSearch={handleExpandSearch}
            expandedSearchLoading={expandedSearchLoading}
            currentSearchRadius={currentSearchRadius}
          />
        )}
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#EAE4E4",
  },
  loadingText: {
    fontSize: 15,
    color: "#374151",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 12,
  },
  resetButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  stepIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  stepIndicatorItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E8EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: "#FFDB0D",
  },
  stepDotText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  stepDotTextActive: {
    color: "#111827",
  },
  stepConnector: {
    width: 36,
    height: 3,
    backgroundColor: "#E5E8EB",
    borderRadius: 2,
  },
  stepConnectorActive: {
    backgroundColor: "#FFDB0D",
  },
  fallbackContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
  },
  fallbackText: {
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
  },
  fallbackButton: {
    backgroundColor: "#FFDB0D",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  fallbackButtonText: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 15,
  },
});
