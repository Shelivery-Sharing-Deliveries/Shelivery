import { useState, useCallback, useMemo } from "react";
import { Text, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PageLayout from "@/components/ui/PageLayout";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

const DRAFT_KEY = "pendingMobileBasketDraft";
const DRAFTS_LIST_KEY = "mobileBasketDraftsList";

interface PersistedDraft {
  shopId: string | null;
  shopName: string | null;
  shopLogo: string | null;
  location: { latitude: number; longitude: number; address?: string } | null;
  basketLink: string;
  basketNote: string;
  basketAmount: string;
  step: number;
}

async function loadDraftsList(): Promise<PersistedDraft[]> {
  try {
    const raw = await AsyncStorage.getItem(DRAFTS_LIST_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as PersistedDraft[]).filter((d) => !!d.shopId);
  } catch { return []; }
}

async function removeDraftFromList(shopId: string) {
  try {
    const raw = await AsyncStorage.getItem(DRAFTS_LIST_KEY);
    if (!raw) return;
    const list: PersistedDraft[] = JSON.parse(raw);
    await AsyncStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(list.filter((d) => d.shopId !== shopId)));
    const activeDraftRaw = await AsyncStorage.getItem(DRAFT_KEY);
    if (activeDraftRaw) {
      const activeDraft: PersistedDraft = JSON.parse(activeDraftRaw);
      if (activeDraft.shopId === shopId) await AsyncStorage.removeItem(DRAFT_KEY);
    }
  } catch {}
}

// ─── Dynamic styles ───────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    scroll: { paddingBottom: 120, gap: 16 },
    headerTitle: { fontSize: 32, fontWeight: "bold", color: colors['shelivery-text-primary'] },
    description: { color: colors['shelivery-text-secondary'] },
    draftsSection: { gap: 8 },
    sectionLabel: {
      fontSize: 13, fontWeight: "700", color: colors['shelivery-text-tertiary'],
      textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2,
    },
    draftCard: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : "#FFFFFF",
      borderWidth: 1, borderColor: colors['shelivery-card-border'],
      borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 10,
    },
    draftCardLogoBox: {
      width: 44, height: 44, borderRadius: 10,
      backgroundColor: '#FFFFFF',
      borderWidth: 1, borderColor: colors['shelivery-card-border'],
      alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0,
    },
    draftCardLogoImg: { width: 40, height: 40 },
    draftCardContent: { flex: 1, gap: 3, minWidth: 0 },
    draftCardShop: { fontSize: 15, fontWeight: "700", color: colors['shelivery-text-primary'] },
    draftCardSub: { fontSize: 12, color: colors['shelivery-text-tertiary'] },
    draftCardActions: { flexShrink: 0 },
    draftDeleteBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    newOrderCard: {
      backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : "#FFFADF",
      padding: 24, borderRadius: 12, borderWidth: 1,
      borderColor: colors['shelivery-card-border'], alignItems: "center", gap: 10,
    },
    newOrderIconCircle: {
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: colors['shelivery-primary-yellow'],
      alignItems: "center", justifyContent: "center", marginBottom: 4,
    },
    newOrderTitle: { fontSize: 18, fontWeight: "700", color: colors['shelivery-text-primary'], textAlign: "center" },
    newOrderDesc: { fontSize: 14, color: colors['shelivery-text-tertiary'], textAlign: "center", lineHeight: 20 },
    newOrderBtn: {
      marginTop: 4, backgroundColor: colors['shelivery-primary-yellow'],
      paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8,
    },
    newOrderBtnText: { fontWeight: "700", fontSize: 14, color: "#111827" },
  });

// ─── Component ────────────────────────────────────────────────────────────────

export default function StoresScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [drafts, setDrafts] = useState<PersistedDraft[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDraftsList().then((list) => { if (active) setDrafts(list); });
      return () => { active = false; };
    }, [])
  );

  const handleStartNewOrder = async () => {
    await AsyncStorage.removeItem(DRAFT_KEY);
    router.push("/(tabs)/stores/create");
  };

  const handleContinueDraft = async (draft: PersistedDraft) => {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    router.push("/(tabs)/stores/create");
  };

  const handleDeleteDraft = async (shopId: string) => {
    await removeDraftFromList(shopId);
    setDrafts((prev) => prev.filter((d) => d.shopId !== shopId));
  };

  return (
    <PageLayout>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Stores</Text>
        <Text style={styles.description}>Browse available stores and join a shopping pool or create your own.</Text>

        {drafts.length > 0 && (
          <View style={styles.draftsSection}>
            <Text style={styles.sectionLabel}>Saved Drafts</Text>
            {drafts.map((draft) => {
              const amount = parseFloat(draft.basketAmount);
              const hasAmount = !isNaN(amount) && amount > 0;
              return (
                <TouchableOpacity key={draft.shopId} style={styles.draftCard} onPress={() => handleContinueDraft(draft)} activeOpacity={0.75}>
                  <View style={styles.draftCardLogoBox}>
                    {draft.shopLogo ? (
                      <Image source={{ uri: draft.shopLogo }} style={styles.draftCardLogoImg} contentFit="contain" cachePolicy="disk" />
                    ) : (
                      <Ionicons name="bag-outline" size={20} color={colors['shelivery-primary-blue']} />
                    )}
                  </View>
                  <View style={styles.draftCardContent}>
                    <Text style={styles.draftCardShop} numberOfLines={1}>{draft.shopName ?? "Unknown Shop"}</Text>
                    <Text style={styles.draftCardSub}>
                      {hasAmount ? `CHF ${amount.toFixed(2)}` : "No amount set"}
                      {draft.basketLink || draft.basketNote ? " · Has order details" : ""}
                    </Text>
                  </View>
                  <View style={styles.draftCardActions}>
                    <Ionicons name="chevron-forward" size={16} color={colors['shelivery-text-tertiary']} />
                  </View>
                  <TouchableOpacity style={styles.draftDeleteBtn} onPress={(e) => { e.stopPropagation(); handleDeleteDraft(draft.shopId!); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="trash-outline" size={16} color="#B42318" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity style={styles.newOrderCard} onPress={handleStartNewOrder} activeOpacity={0.8}>
          <View style={styles.newOrderIconCircle}>
            <Ionicons name="add" size={28} color="#111827" />
          </View>
          <Text style={styles.newOrderTitle}>Start New Order</Text>
          <Text style={styles.newOrderDesc}>Select a store and create a new shopping pool.</Text>
          <View style={styles.newOrderBtn}>
            <Text style={styles.newOrderBtnText}>Start New Order</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </PageLayout>
  );
}
