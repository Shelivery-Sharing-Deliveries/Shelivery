import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Modal, Share, Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { ProgressBar } from "@/components/ui/ProgressBar";
import PageLayout from "@/components/ui/PageLayout";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopData {
  name: string;
  logo_url: string | null;
}

interface PoolInfo {
  min_amount: number;
  current_amount: number;
}

interface BasketData {
  id: string;
  user_id: string;
  shop_id: string;
  pool_id: string | null;
  chatroom_id: string | null;
  amount: number;
  link: string | null;
  note: string | null;
  is_ready: boolean;
  status: "resolved" | "in_pool" | "in_chat";
  lat: number | null;
  lng: number | null;
  address: string | null;
  shop: ShopData;
  pool: PoolInfo | null;
}

interface DisplayPoolData {
  shopName: string;
  shopLogo: string | null;
  poolTotal: number;
  currentAmount: number;
  userAmount: number;
  minAmount: number;
  pool_id: string | null;
  shop_id: string;
  userBasket: {
    total: number;
    itemsUrl: string | null;
    itemsNote: string | null;
    status: "resolved" | "in_pool" | "in_chat";
    chatroomId: string | null;
  };
}

// ─── Pool Page ────────────────────────────────────────────────────────────────

export default function PoolPage() {
  const { basketId } = useLocalSearchParams<{ basketId: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [poolData, setPoolData] = useState<DisplayPoolData | null>(null);
  const [rawBasketData, setRawBasketData] = useState<BasketData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // ── Fetch basket data ────────────────────────────────────────────────────
  const fetchAndProcessBasketData = useCallback(async (id: string) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from("basket")
        .select(`
          id, amount, link, note, is_ready, status, shop_id, pool_id,
          chatroom_id, lat, lng, address,
          shop ( name, logo_url ),
          pool ( min_amount, current_amount )
        `)
        .eq("id", id)
        .single();

      if (supabaseError) throw new Error(supabaseError.message);
      if (!data) throw new Error("Basket not found.");

      const fetchedBasket = data as unknown as BasketData;

      // Redirect to chatroom if basket moved to chat state
      if (fetchedBasket.status === "in_chat" && fetchedBasket.chatroom_id) {
        router.replace(`/chatrooms/${fetchedBasket.chatroom_id}` as any);
        return null;
      }

      const structuredData: DisplayPoolData = {
        shopName: fetchedBasket.shop?.name || "Unknown Shop",
        shopLogo: fetchedBasket.shop?.logo_url || null,
        poolTotal: fetchedBasket.pool?.min_amount || 0,
        currentAmount: fetchedBasket.pool?.current_amount || 0,
        userAmount: fetchedBasket.amount,
        minAmount: fetchedBasket.pool?.min_amount || 0,
        pool_id: fetchedBasket.pool_id,
        shop_id: fetchedBasket.shop_id,
        userBasket: {
          total: fetchedBasket.amount,
          itemsUrl: fetchedBasket.link,
          itemsNote: fetchedBasket.note,
          status: fetchedBasket.status,
          chatroomId: fetchedBasket.chatroom_id,
        },
      };

      return { structuredData, fetchedBasket };
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      return null;
    }
  }, [router]);

  // ── Initial data load ────────────────────────────────────────────────────
  useEffect(() => {
    if (!basketId) {
      setError("No basket ID provided.");
      setIsPageLoading(false);
      return;
    }

    const loadData = async () => {
      setIsPageLoading(true);
      const result = await fetchAndProcessBasketData(basketId);
      if (result) {
        setPoolData(result.structuredData);
        setRawBasketData(result.fetchedBasket);
        setIsReady(result.fetchedBasket.is_ready);
      }
      setIsPageLoading(false);
    };

    loadData();
  }, [basketId, fetchAndProcessBasketData]);

  // ── Realtime pool subscription + polling ─────────────────────────────────
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!basketId) return;

    // 2. Polling for basket status changes (redirect detection)
    const pollingInterval = setInterval(async () => {
      const result = await fetchAndProcessBasketData(basketId);
      if (result) {
        setPoolData(result.structuredData);
        setRawBasketData(result.fetchedBasket);
        setIsReady(result.fetchedBasket.is_ready);
      }
    }, 4000);

    return () => {
      clearInterval(pollingInterval);
    };
  }, [basketId, fetchAndProcessBasketData]);

  // Separate effect for real-time subscription to avoid dependency issues
  useEffect(() => {
    if (!poolData?.pool_id) {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      return;
    }

    // Use a unique channel name on every mount to avoid the Supabase error:
    // "cannot add postgres_changes callbacks after subscribe()".
    // Supabase reuses channel objects by topic name; a unique suffix guarantees
    // we always get a fresh, unsubscribed channel object.
    const uniqueChannelName = `pool_updates:${poolData.pool_id}:${Date.now()}`;

    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pool", filter: `id=eq.${poolData.pool_id}` },
        (payload) => {
          setPoolData((prev) =>
            prev
              ? { ...prev, currentAmount: payload.new.current_amount, minAmount: payload.new.min_amount }
              : prev
          );
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      subscriptionRef.current = null;
    };
  }, [poolData?.pool_id]);

  // ── Toggle ready state ───────────────────────────────────────────────────
  const handleToggleReady = async () => {
    if (!poolData || isButtonLoading) return;
    setIsButtonLoading(true);
    setError(null);

    const newIsReadyState = !isReady;
    try {
      const { data, error: supabaseError } = await supabase
        .from("basket")
        .update({ is_ready: newIsReadyState, updated_at: new Date().toISOString() })
        .eq("id", basketId)
        .select("id, status, chatroom_id")
        .single();

      if (supabaseError) throw new Error(supabaseError.message);

      if (data) {
        setIsReady(newIsReadyState);
        if (data.status === "in_chat" && data.chatroom_id) {
          router.replace(`/chatrooms/${data.chatroom_id}` as any);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to update basket status.");
    } finally {
      setIsButtonLoading(false);
    }
  };

  // ── Go to chat ───────────────────────────────────────────────────────────
  const handleGoToChat = async () => {
    if (poolData?.userBasket.chatroomId) {
      router.push(`/chatrooms/${poolData.userBasket.chatroomId}` as any);
    } else {
      setError("Chatroom not ready yet.");
    }
  };

  // ── Share ────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!poolData) return;
    const remaining = poolData.minAmount - poolData.currentAmount;
    const message =
      `Join me in the Shelivery pool for ${poolData.shopName}! ` +
      `We need CHF ${remaining.toFixed(2)} more to activate free shipping.`;
    await Share.share({ message });
  };

  // ── Edit basket ──────────────────────────────────────────────────────────
  const saveDraftAndRedirect = async () => {
    if (!poolData || !rawBasketData) return;
    const draft = {
      shopId: poolData.shop_id,
      shopName: poolData.shopName,
      shopLogo: poolData.shopLogo,
      location:
        rawBasketData.lat && rawBasketData.lng
          ? {
              latitude: rawBasketData.lat,
              longitude: rawBasketData.lng,
              address: rawBasketData.address || undefined,
            }
          : null,
      basketLink: poolData.userBasket.itemsUrl || "",
      basketNote: poolData.userBasket.itemsNote || "",
      basketAmount: poolData.userBasket.total.toString(),
      step: 3,
    };
    await AsyncStorage.setItem("pendingMobileBasketDraft", JSON.stringify(draft));
    router.replace("/(tabs)/stores/create" as any);
  };

  const handleEdit = () => {
    if (!poolData || isButtonLoading) return;
    if (poolData.pool_id) {
      setShowEditConfirm(true);
    } else {
      saveDraftAndRedirect();
    }
  };

  const confirmEdit = async () => {
    if (!poolData || !rawBasketData) return;
    setShowEditConfirm(false);
    setIsButtonLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("remove_basket_from_pool", {
        p_basket_id: basketId,
      });
      if (rpcError) throw rpcError;
      await saveDraftAndRedirect();
    } catch (err: any) {
      setError(err.message || "Failed to remove basket from pool for editing.");
      setIsButtonLoading(false);
    }
  };

  // ── Delete basket ────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!poolData || isButtonLoading) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsButtonLoading(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("delete_basket_from_pool", {
        p_basket_id: basketId,
      });
      if (rpcError) throw rpcError;
      router.replace("/(tabs)/dashboard" as any);
    } catch (err: any) {
      setError(err.message || "Failed to delete basket.");
      setIsButtonLoading(false);
    }
  };

  // ── Loading / error screens ──────────────────────────────────────────────
  const centeredBg = isDark ? colors['shelivery-card-background'] : "#EAE4E4";
  const btnCircleBg = isDark ? colors['shelivery-button-secondary-bg'] : "#F3F4F6";

  if (isPageLoading) {
    return (
      <View style={[styles.centeredScreen, { backgroundColor: centeredBg }]}>
        <ActivityIndicator size="large" color={colors['shelivery-primary-yellow']} />
        <Text style={[styles.centeredText, { color: colors['shelivery-text-secondary'] }]}>Loading basket data...</Text>
      </View>
    );
  }

  if (error && !poolData) {
    return (
      <View style={[styles.centeredScreen, { backgroundColor: centeredBg }]}>
        <Text style={[styles.errorText, { color: "#F04438" }]}>{error}</Text>
        <TouchableOpacity style={styles.centeredButton} onPress={() => router.back()}>
          <Text style={styles.centeredButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!poolData) {
    return (
      <View style={[styles.centeredScreen, { backgroundColor: centeredBg }]}>
        <Text style={[styles.centeredText, { color: colors['shelivery-text-secondary'] }]}>Basket not found or no longer active.</Text>
        <TouchableOpacity style={styles.centeredButton} onPress={() => router.replace("/(tabs)/dashboard" as any)}>
          <Text style={styles.centeredButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPoolFilled = poolData.currentAmount >= poolData.minAmount && poolData.minAmount > 0;

  // Determine main action button
  let buttonLabel = "Ready To Order & Join Pool";
  let buttonStyle = styles.actionButtonYellow;
  let buttonAction = handleToggleReady;

  if (isPoolFilled && isReady && poolData.userBasket.chatroomId) {
    buttonLabel = isButtonLoading ? "Entering Chat..." : "Go to Chat";
    buttonStyle = styles.actionButtonBlue;
    buttonAction = handleGoToChat;
  } else if (isReady) {
    buttonLabel = isButtonLoading ? "Cancelling..." : "Cancel";
    buttonStyle = styles.actionButtonRed;
    buttonAction = handleToggleReady;
  } else {
    buttonLabel = isButtonLoading ? "Setting Ready..." : "Ready To Order & Join Pool";
    buttonStyle = styles.actionButtonYellow;
    buttonAction = handleToggleReady;
  }

  // ── Header ───────────────────────────────────────────────────────────────
  const header = (
    <View style={styles.headerRow}>
      <TouchableOpacity style={[styles.headerBackButton, { backgroundColor: btnCircleBg }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors['shelivery-text-primary']} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors['shelivery-text-primary'] }]} numberOfLines={1}>
        {poolData.shopName} Basket
      </Text>
      <TouchableOpacity style={[styles.shareButton, { backgroundColor: btnCircleBg }]} onPress={handleShare}>
        <Ionicons name="share-outline" size={22} color={colors['shelivery-text-primary']} />
      </TouchableOpacity>
    </View>
  );

  return (
    <PageLayout header={header} showNavigation={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Status Card */}
        <View style={[styles.statusCard, { backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : "#FFFADF", borderColor: colors['shelivery-card-border'] }]}>
          {/* Shop logo */}
          <View style={styles.shopLogoWrapper}>
            {poolData.shopLogo ? (
              <Image
                source={{ uri: poolData.shopLogo }}
                style={styles.shopLogo}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="bag" size={32} color="#6B7280" />
            )}
          </View>

          <Text style={[styles.statusTitle, { color: colors['shelivery-text-primary'] }]}>
            {isReady ? "Joining Soon" : "Ready To Join?"}
          </Text>
          <Text style={[styles.statusSubtitle, { color: colors['shelivery-text-secondary'] }]}>
            {isReady
              ? "We\u2019re collecting enough orders to activate free shipping."
              : "You can still edit or delete this basket. Tap ready when you\u2019re done."}
          </Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            {isReady && (
              <Text style={styles.progressYouLabel}>
                You: CHF {poolData.userAmount.toFixed(2)}
              </Text>
            )}
            <Text style={styles.progressTotalLabel}>
              Pool: CHF {poolData.currentAmount.toFixed(2)} / CHF {poolData.minAmount.toFixed(2)}
            </Text>
          </View>
          <ProgressBar
            current={poolData.currentAmount}
            target={poolData.minAmount}
            users={[]}
            showPercentage={false}
            showAmount={false}
            animated={true}
            containerStyle={styles.progressBarContainer}
          />
        </View>

        {/* Basket Details */}
        <View style={styles.detailsSection}>
          {/* Total */}
          <View style={styles.detailRow}>
            <Ionicons name="wallet-outline" size={20} color="#374151" />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors['shelivery-text-primary'] }]}>Total</Text>
              <Text style={[styles.detailValue, { color: colors['shelivery-text-secondary'] }]}>CHF {poolData.userBasket.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Items */}
          <View style={styles.detailRow}>
            <Ionicons name="list-outline" size={20} color="#374151" />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors['shelivery-text-primary'] }]}>Items Detail</Text>
              {poolData.userBasket.itemsUrl ? (
                <Text style={styles.detailLink} numberOfLines={2}>
                  🔗 {poolData.userBasket.itemsUrl}
                </Text>
              ) : null}
              {poolData.userBasket.itemsNote ? (
                <View style={[styles.noteBox, { backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : "#F9FAFB", borderColor: colors['shelivery-card-border'] }]}>
                  <Text style={[styles.noteText, { color: colors['shelivery-text-secondary'] }]}>{poolData.userBasket.itemsNote}</Text>
                </View>
              ) : null}
              {!poolData.userBasket.itemsUrl && !poolData.userBasket.itemsNote && (
                <Text style={styles.noDetailText}>No order details provided</Text>
              )}
            </View>
          </View>
        </View>

        {/* Edit / Delete buttons (only when not ready) */}
        {!isReady && (
          <View style={styles.editDeleteRow}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit} disabled={isButtonLoading}>
              <Ionicons name="create-outline" size={16} color={colors['shelivery-badge-blue-text']} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={isButtonLoading}>
              <Ionicons name="trash-outline" size={16} color={colors['shelivery-badge-red-text']} />
              <Text style={styles.deleteButtonText}>
                {isButtonLoading ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Main action button */}
        <TouchableOpacity
          style={[styles.actionButton, buttonStyle, isButtonLoading && styles.buttonDisabled]}
          onPress={buttonAction}
          disabled={isButtonLoading}
          activeOpacity={0.85}
        >
          {isButtonLoading ? (
            <ActivityIndicator color={buttonStyle === styles.actionButtonYellow ? "#111827" : "#FFFFFF"} />
          ) : (
            <Text style={[styles.actionButtonText, buttonStyle === styles.actionButtonYellow && styles.actionButtonTextDark]}>{buttonLabel}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Confirmation Modal */}
      <Modal visible={showEditConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? colors['shelivery-card-background'] : "#FFFFFF" }]}>
            <View style={[styles.modalIcon, { backgroundColor: isDark ? "#0D2035" : "#EFF8FF" }]}>
              <Ionicons name="create-outline" size={24} color="#245B7B" />
            </View>
            <Text style={[styles.modalTitle, { color: colors['shelivery-text-primary'] }]}>Edit Basket?</Text>
            <Text style={[styles.modalBody, { color: colors['shelivery-text-tertiary'] }]}>
              {"Editing your basket will remove you from the current pool. If you\u2019re the only member, the pool will be dissolved. Otherwise, the pool anchor will be passed to the next member. Do you wish to continue?"}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButtonCancel, { borderColor: colors['shelivery-card-border'] }]}
                onPress={() => setShowEditConfirm(false)}
              >
                <Text style={[styles.modalButtonCancelText, { color: colors['shelivery-text-secondary'] }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirmBlue} onPress={confirmEdit}>
                <Text style={styles.modalButtonConfirmText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? colors['shelivery-card-background'] : "#FFFFFF" }]}>
            <View style={[styles.modalIcon, { backgroundColor: isDark ? "#2D0000" : "#FEF3F2" }]}>
              <Ionicons name="trash-outline" size={24} color="#B42318" />
            </View>
            <Text style={[styles.modalTitle, { color: colors['shelivery-text-primary'] }]}>Delete Basket?</Text>
            <Text style={[styles.modalBody, { color: colors['shelivery-text-tertiary'] }]}>
              {poolData.pool_id
                ? "Your basket will be removed from the pool. If you\u2019re the only member, the pool will be dissolved. Otherwise, the pool anchor will be passed to the next member."
                : "This will permanently delete your basket."}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButtonCancel, { borderColor: colors['shelivery-card-border'] }]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={[styles.modalButtonCancelText, { color: colors['shelivery-text-secondary'] }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirmRed} onPress={confirmDelete}>
                <Text style={styles.modalButtonConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </PageLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  centeredScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#EAE4E4",
    gap: 16,
  },
  centeredText: {
    fontSize: 15,
    color: "#374151",
    textAlign: "center",
  },
  errorText: {
    fontSize: 15,
    color: "#F04438",
    textAlign: "center",
  },
  centeredButton: {
    backgroundColor: "#FFDB0D",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  centeredButtonText: {
    fontWeight: "700",
    color: "#111827",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 20,
  },
  statusCard: {
    backgroundColor: "#FFFADF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E8EB",
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  shopLogoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors['shelivery-card-border'],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  shopLogo: {
    width: 64,
    height: 64,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  statusSubtitle: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    lineHeight: 20,
  },
  progressSection: {
    gap: 8,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressYouLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors['shelivery-text-primary'],
  },
  progressTotalLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors['shelivery-text-primary'],
    marginLeft: "auto" as any,
  },
  progressBarContainer: {
    marginBottom: 0,
  },
  detailsSection: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  detailContent: {
    flex: 1,
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  detailValue: {
    fontSize: 14,
    color: "#374151",
  },
  detailLink: {
    fontSize: 13,
    color: colors['shelivery-primary-blue'],
    textDecorationLine: "underline",
  },
  noteBox: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
  },
  noteText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  noDetailText: {
    fontSize: 13,
    color: colors['shelivery-text-tertiary'],
    fontStyle: "italic",
  },
  editDeleteRow: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: isDark ? colors['shelivery-badge-blue-bg'] : "#EAF7FF",
    borderWidth: 1,
    borderColor: isDark ? colors['shelivery-badge-blue-border'] : "#D8F0FE",
    borderRadius: 10,
    paddingVertical: 10,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors['shelivery-badge-blue-text'],
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: isDark ? colors['shelivery-badge-red-bg'] : "#FEF3F2",
    borderWidth: 1,
    borderColor: isDark ? colors['shelivery-badge-red-border'] : "#FEE4E2",
    borderRadius: 10,
    paddingVertical: 10,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors['shelivery-badge-red-text'],
  },
  errorBanner: {
    backgroundColor: isDark ? colors['shelivery-badge-red-bg'] : "#FEF3F2",
    borderWidth: 1,
    borderColor: isDark ? colors['shelivery-badge-red-border'] : "#FEE4E2",
    borderRadius: 8,
    padding: 12,
  },
  errorBannerText: {
    fontSize: 13,
    color: "#F04438",
  },
  actionButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonYellow: {
    backgroundColor: colors['shelivery-primary-yellow'],
  },
  actionButtonRed: {
    backgroundColor: "#F04438",
  },
  actionButtonBlue: {
    backgroundColor: colors['shelivery-primary-blue'],
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  actionButtonTextDark: {
    color: "#111827",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    gap: 12,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  modalBody: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 4,
  },
  modalButtonCancel: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E8EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  modalButtonConfirmBlue: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#245B7B",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonConfirmRed: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#B42318",
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonConfirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
