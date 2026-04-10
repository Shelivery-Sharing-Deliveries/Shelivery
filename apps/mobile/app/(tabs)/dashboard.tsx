import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import PageLayout, { NavBarSpacer } from "@/components/ui/PageLayout";
import { useCallback, useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";
import ProfileCard from "@/components/dashboard/ProfileCard";
import SignInCard from "@/components/dashboard/SignInCard";
import AddBasket from "@/components/dashboard/AddBasket";
import Baskets from "@/components/dashboard/Baskets";
import Banner from "@/components/dashboard/Banner";
import SquareBanner from "@/components/dashboard/SquareBanner";
import FeaturedShopCard from "@/components/dashboard/FeaturedShopCard";
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/solid';
import { TicketIcon } from 'react-native-heroicons/outline';
import { useAuth } from "@/hooks/useAuth";

// ─── Dynamic styles ───────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    scrollView: { flex: 1 },
    scrollViewContent: { paddingTop: 8, paddingBottom: 120 },
    loadingContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 24 },
    skeleton: { backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : colors['shelivery-card-border'], borderRadius: 4 },
    loadingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    loadingHeaderButtons: { flexDirection: 'row', gap: 8 },
    loadingButtonSkeleton: { height: 32, width: 100, borderRadius: 8 },
    loadingProfileCard: {
      backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : colors.white,
      borderRadius: 16, padding: 24,
      shadowColor: colors['shelivery-shadow-color'],
      shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
      flexDirection: 'row', alignItems: 'center', gap: 16,
    },
    loadingAvatarSkeleton: { width: 54, height: 54, borderRadius: 27 },
    loadingProfileTextContainer: { flex: 1 },
    loadingAddBasketButton: { height: 60, width: '100%', borderRadius: 12 },
    loadingBasketsSection: { gap: 12 },
    loadingBasketsList: { gap: 8 },
    loadingBasketItem: { height: 80, width: '100%', borderRadius: 8 },
    loadingBanner: { height: 120, width: '100%', borderRadius: 12 },
    loadingArchiveSection: {
      marginTop: 24, borderTopWidth: 1,
      borderTopColor: colors['shelivery-card-border'], paddingTop: 16,
    },
    loadingArchiveToggle: { height: 40, width: '100%', borderRadius: 8 },
    dashboardHeader: { paddingVertical: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dashboardTitle: { fontSize: 20, fontWeight: '700', lineHeight: 32, color: colors['shelivery-text-primary'] },
    headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    inviteFriendsButton: {
      backgroundColor: colors['shelivery-primary-blue'],
      paddingHorizontal: 8, paddingVertical: 8, borderRadius: 8,
    },
    inviteFriendsButtonText: { color: colors.white, fontSize: 12, fontWeight: '600' },
    supportTicketButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 8, paddingVertical: 8,
      backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : colors['shelivery-background-gray'],
      borderRadius: 8,
    },
    supportTicketButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    supportTicketButtonText: { fontSize: 12, fontWeight: '600', color: colors['shelivery-text-secondary'] },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors['shelivery-text-primary'], marginTop: 16, paddingVertical: 16 },
    profileCardSkeleton: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    errorContainer: { textAlign: 'center', paddingVertical: 32, alignItems: 'center' },
    errorText: { color: colors['shelivery-error-red'], textAlign: 'center' },
    retryButton: {
      marginTop: 16, backgroundColor: colors['shelivery-primary-blue'],
      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
    },
    retryButtonText: { color: colors.white, fontWeight: '600' },
    noActiveBasketsMessage: {
      textAlign: 'center', borderColor: colors['shelivery-card-border'],
      borderWidth: 1, borderRadius: 16, padding: 24,
      backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : colors.white,
      shadowColor: colors['shelivery-shadow-color'],
      shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
      marginVertical: 16, alignItems: 'center',
    },
    noActiveBasketsTitle: { fontSize: 18, fontWeight: '600', color: colors['shelivery-text-primary'] },
    noActiveBasketsText: { marginTop: 8, fontSize: 14, color: colors['shelivery-text-secondary'] },
    oldOrdersSection: { marginTop: 24, borderTopWidth: 1, borderTopColor: colors['shelivery-card-border'], paddingTop: 16 },
    oldOrdersToggle: {
      width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 8,
      backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : colors['shelivery-background-gray'],
      borderRadius: 8,
    },
    oldOrdersToggleText: { color: colors['shelivery-text-secondary'], fontWeight: '600', fontSize: 16 },
    resolvedBasketsList: { marginTop: 16 },
  });

// ─── Loading skeleton component ───────────────────────────────────────────────

function DashboardLoading() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingHeader}>
        <View style={[styles.skeleton, { width: 100, height: 32 }]} />
        <View style={styles.loadingHeaderButtons}>
          <View style={[styles.skeleton, styles.loadingButtonSkeleton]} />
          <View style={[styles.skeleton, styles.loadingButtonSkeleton, { width: 80 }]} />
        </View>
      </View>
      <View style={styles.loadingProfileCard}>
        <View style={[styles.skeleton, styles.loadingAvatarSkeleton]} />
        <View style={styles.loadingProfileTextContainer}>
          <View style={[styles.skeleton, { height: 20, width: 150 }]} />
          <View style={[styles.skeleton, { height: 16, width: 100, marginTop: 4 }]} />
        </View>
      </View>
      <View style={[styles.skeleton, styles.loadingAddBasketButton]} />
      <View style={styles.loadingBasketsSection}>
        <View style={[styles.skeleton, { height: 24, width: 200 }]} />
        <View style={styles.loadingBasketsList}>
          <View style={[styles.skeleton, styles.loadingBasketItem]} />
          <View style={[styles.skeleton, styles.loadingBasketItem]} />
          <View style={[styles.skeleton, styles.loadingBasketItem]} />
        </View>
      </View>
      <View style={[styles.skeleton, styles.loadingBanner]} />
      <View style={styles.loadingArchiveSection}>
        <View style={[styles.skeleton, styles.loadingArchiveToggle]} />
      </View>
    </View>
  );
}

interface DisplayBasket {
  id: string;
  shopName: string;
  shopLogo: string | null;
  total: string;
  status: 'in_pool' | 'in_chat' | 'resolved';
  chatroomId?: string;
}

export default function DashboardScreen() {
  const [userProfile, setUserProfile] = useState<{ userName: string; userAvatar: string } | null>(null);
  const [activeBaskets, setActiveBaskets] = useState<DisplayBasket[]>([]);
  const [resolvedBaskets, setResolvedBaskets] = useState<DisplayBasket[]>([]);
  const [loadingBaskets, setLoadingBaskets] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOldOrders, setShowOldOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredPoolRefreshKey, setFeaturedPoolRefreshKey] = useState(0);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    setError(null);
    try {
      const { data: userData } = await supabase.from("user").select("first_name, image").eq("id", user.id).single();
      if (userData) {
        setUserProfile({ userName: userData.first_name || "User", userAvatar: userData.image || "/avatars/default-avatar.png" });
      } else {
        setUserProfile({ userName: "User", userAvatar: "/avatars/default-avatar.png" });
      }
      const { data: basketsData, error: basketsError } = await supabase
        .from("basket")
        .select("id, amount, status, chatroom_id, shop (name, logo_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (basketsError) throw basketsError;
      if (basketsData) {
        const mapped: DisplayBasket[] = basketsData.map((basket: any) => ({
          id: basket.id,
          shopName: basket.shop?.name || "Unknown Shop",
          shopLogo: basket.shop?.logo_url || null,
          total: basket.amount ? `CHF ${basket.amount.toFixed(2)}` : "CHF 0.00",
          status: basket.status,
          chatroomId: basket.chatroom_id || undefined,
        }));
        setActiveBaskets(mapped.filter(b => b.status === 'in_pool' || b.status === 'in_chat'));
        setResolvedBaskets(mapped.filter(b => b.status === 'resolved'));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data.");
    } finally {
      setFeaturedPoolRefreshKey(k => k + 1);
      setRefreshing(false);
    }
  }, [user?.id]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoadingBaskets(true);
    setError(null);
    try {
      const { data: userData } = await supabase.from("user").select("first_name, image").eq("id", user.id).single();
      if (userData) {
        setUserProfile({ userName: userData.first_name || "User", userAvatar: userData.image || "/avatars/default-avatar.png" });
      } else {
        setUserProfile({ userName: "User", userAvatar: "/avatars/default-avatar.png" });
      }
      const { data: basketsData, error: basketsError } = await supabase
        .from("basket")
        .select("id, amount, status, chatroom_id, shop (name, logo_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (basketsError) throw basketsError;
      if (basketsData) {
        const mapped: DisplayBasket[] = basketsData.map((basket: any) => ({
          id: basket.id,
          shopName: basket.shop?.name || "Unknown Shop",
          shopLogo: basket.shop?.logo_url || null,
          total: basket.amount ? `CHF ${basket.amount.toFixed(2)}` : "CHF 0.00",
          status: basket.status,
          chatroomId: basket.chatroom_id || undefined,
        }));
        setActiveBaskets(mapped.filter(b => b.status === 'in_pool' || b.status === 'in_chat'));
        setResolvedBaskets(mapped.filter(b => b.status === 'resolved'));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoadingBaskets(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user) fetchData();
  }, [user?.id, authLoading]);

  const handleBasketClick = (basketId: string) => {
    const basket = [...activeBaskets, ...resolvedBaskets].find(b => b.id === basketId);
    if (!basket) return;
    if (basket.status === "in_chat" && basket.chatroomId) {
      router.push(`/chatrooms/${basket.chatroomId}` as any);
    } else if (basket.status === "in_pool") {
      router.push(`/pool/${basket.id}` as any);
    } else if (basket.status === "resolved" && basket.chatroomId) {
      router.push(`/chatrooms/${basket.chatroomId}` as any);
    }
  };

  return (
    <PageLayout>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {authLoading ? (
          <DashboardLoading />
        ) : !user ? (
          <>
            <View style={styles.dashboardHeader} />
            <SignInCard id="sign-in-card" />
            <SquareBanner id="square-banner" />
            <Text style={styles.sectionTitle}>Just About to Complete 🔥</Text>
            <FeaturedShopCard refreshKey={featuredPoolRefreshKey} />
            <AddBasket onClick={() => router.push("/stores" as any)} id="add-basket-button" />
          </>
        ) : (
          <>
            <View style={styles.dashboardHeader}>
              <Text style={styles.dashboardTitle}>Dashboard</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity onPress={() => router.push("/invite-friend" as any)} style={styles.inviteFriendsButton}>
                  <Text style={styles.inviteFriendsButtonText}>Invite Friends</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/feedback" as any)} style={styles.supportTicketButton}>
                  <View style={styles.supportTicketButtonContent}>
                    <TicketIcon size={20} color={colors['shelivery-text-secondary']} />
                    <Text style={styles.supportTicketButtonText}>Support</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {userProfile ? (
              <ProfileCard userName={userProfile.userName} userAvatar={userProfile.userAvatar} id="profile-card" />
            ) : (
              <View style={styles.profileCardSkeleton}>
                <View style={[styles.skeleton, styles.loadingAvatarSkeleton]} />
                <View style={styles.loadingProfileTextContainer}>
                  <View style={[styles.skeleton, { height: 15, width: 200 }]} />
                  <View style={[styles.skeleton, { height: 12, width: 150, marginTop: 5 }]} />
                </View>
              </View>
            )}

            <AddBasket onClick={() => router.push("/stores" as any)} id="add-basket-button" />
            <Text style={styles.sectionTitle}>Just About to Complete 🔥</Text>
            <FeaturedShopCard refreshKey={featuredPoolRefreshKey} />

            {loadingBaskets ? (
              <DashboardLoading />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {activeBaskets.length === 0 ? (
                  <View style={styles.noActiveBasketsMessage}>
                    <Text style={styles.noActiveBasketsTitle}>No active baskets</Text>
                    <Text style={styles.noActiveBasketsText}>Create a basket and have a shared shopping experience!</Text>
                  </View>
                ) : (
                  <Baskets baskets={activeBaskets} onBasketClick={handleBasketClick} id="active-baskets-list" />
                )}
                <Banner id="dashboard-banner" />
                {resolvedBaskets.length > 0 && (
                  <View style={styles.oldOrdersSection}>
                    <TouchableOpacity style={styles.oldOrdersToggle} onPress={() => setShowOldOrders(!showOldOrders)}>
                      <Text style={styles.oldOrdersToggleText}>Archive ({resolvedBaskets.length})</Text>
                      {showOldOrders
                        ? <ChevronUpIcon size={20} color={colors['shelivery-text-secondary']} />
                        : <ChevronDownIcon size={20} color={colors['shelivery-text-secondary']} />
                      }
                    </TouchableOpacity>
                    {showOldOrders && (
                      <View style={styles.resolvedBasketsList}>
                        <Baskets baskets={resolvedBaskets} onBasketClick={handleBasketClick} />
                      </View>
                    )}
                  </View>
                )}
              </>
              )}
          </>
        )}
        <NavBarSpacer />
      </ScrollView>
    </PageLayout>
  );
}
