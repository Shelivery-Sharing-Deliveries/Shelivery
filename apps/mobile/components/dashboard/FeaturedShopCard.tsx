import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { ProgressBar } from "@/components/ui/ProgressBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";
import { ChevronRightIcon, ArchiveBoxIcon } from 'react-native-heroicons/solid';
import { useAuth } from "@/hooks/useAuth";
import React from "react";

const DEFAULT_TOWNS = [
  { name: "Lausanne", lat: 46.5196535, lng: 6.6322734, preferedKm: 10 },
];

interface FeaturedPool {
  id: string;
  shop_id: string;
  shop_name: string;
  shop_logo_url: string | null;
  location_name: string;
  current_amount: number | null;
  min_amount: number;
  location_id: string;
  remaining_chf: number;
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  loadingContainer: {
    backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : colors.white,
    borderRadius: 16, padding: 12, borderWidth: 1,
    borderColor: colors['shelivery-card-border'],
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  loadingShopLogo: {
    width: 56, height: 56,
    backgroundColor: colors['shelivery-card-border'],
    borderRadius: 8, flexShrink: 0,
  },
  loadingTextContainer: { flex: 1, minWidth: 0 },
  loadingTag: {
    width: 96, height: 12,
    backgroundColor: colors['shelivery-card-border'],
    borderRadius: 9999, marginBottom: 4,
  },
  loadingTitle: {
    width: 128, height: 16,
    backgroundColor: colors['shelivery-card-border'],
    borderRadius: 4, marginBottom: 4,
  },
  loadingProgressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingProgressText: {
    width: 64, height: 12,
    backgroundColor: colors['shelivery-card-border'], borderRadius: 4,
  },
  loadingProgressBar: {
    flex: 1, height: 8,
    backgroundColor: colors['shelivery-card-border'], borderRadius: 4,
  },
  loadingArrow: {
    width: 16, height: 16,
    backgroundColor: colors['shelivery-card-border'], borderRadius: 4,
  },
  noFeaturedPoolContainer: {
    borderWidth: 1, borderColor: colors['shelivery-card-border'], borderRadius: 16,
    padding: 24,
    backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : colors.white,
    shadowColor: colors['shelivery-shadow-color'],
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    marginBottom: 16, alignItems: 'center',
  },
  noFeaturedPoolText: {
    fontSize: 18, fontWeight: '600',
    color: colors['shelivery-text-primary'], textAlign: 'center',
  },
  cardContainer: {
    marginBottom: 8,
    backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : colors.white,
    borderRadius: 16, padding: 12, borderWidth: 1,
    borderColor: colors['shelivery-card-border'],
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // Always white bg so transparent shop logos render correctly
  shopLogoContainer: {
    width: 56, height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    borderWidth: 1, borderColor: colors['shelivery-card-border'],
  },
  shopLogoImage: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 8 },
  shopInfoContainer: { flex: 1, minWidth: 0 },
  meetupTagContainer: { marginBottom: 2 },
  meetupTagText: {
    alignSelf: 'flex-start',
    backgroundColor: colors['shelivery-primary-blue'],
    color: colors.white,
    fontSize: 10, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 9999, fontWeight: '500', overflow: 'hidden',
  },
  shopNameRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  shopNameText: {
    fontWeight: '600', color: colors['shelivery-text-primary'], flexShrink: 1,
  },
  shopNameArrowIcon: { flexShrink: 0, marginLeft: 4 },
  progressBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  progressBarText: {
    fontSize: 10, color: colors['shelivery-text-secondary'], fontWeight: '500',
  },
  progressBarOverride: { flex: 1, marginBottom: 0 },
});

export default function FeaturedShopCard() {
  const [featuredPool, setFeaturedPool] = useState<FeaturedPool | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!loading) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [loading, pulseAnim]);

  useEffect(() => {
    const fetchFeaturedPool = async () => {
      if (authLoading) return;
      try {
        setLoading(true);
        let userLat: number | null = null;
        let userLng: number | null = null;
        let maxRadiusKm = 5;
        let locationName = "";

        if (user) {
          const { data: userData } = await supabase
            .from("user").select("lat, lng, prefered_km").eq("id", user.id).single();
          if (userData?.lat && userData?.lng) {
            userLat = userData.lat; userLng = userData.lng;
            if (userData.prefered_km) maxRadiusKm = userData.prefered_km;
            locationName = "Your location";
          }
        } else if (DEFAULT_TOWNS.length > 0) {
          const t = DEFAULT_TOWNS[Math.floor(Math.random() * DEFAULT_TOWNS.length)];
          if (t) { userLat = t.lat; userLng = t.lng; maxRadiusKm = t.preferedKm; locationName = t.name; }
        }

        if (!userLat || !userLng) { setFeaturedPool(null); return; }

        const { data: shops, error: shopsError } = await supabase
          .from("shop").select("id").eq("is_active", true);
        if (shopsError || !shops) { setFeaturedPool(null); return; }

        const allNearbyPools: any[] = [];
        for (const shop of shops) {
          try {
            const { data: nearbyPools } = await supabase.rpc("find_nearby_pools", {
              p_shop_id: shop.id, p_lat: userLat, p_lng: userLng, p_max_radius_km: maxRadiusKm,
            });
            if (nearbyPools) nearbyPools.forEach((p: any) => allNearbyPools.push({ ...p, shop_id: shop.id }));
          } catch {}
        }

        if (allNearbyPools.length === 0) { setFeaturedPool(null); return; }

        const shopIds = Array.from(new Set(allNearbyPools.map((p: any) => p.shop_id)));
        const { data: shopDetails } = await supabase.from("shop").select("id, name, logo_url").in("id", shopIds);
        const shopMap = new Map(shopDetails?.map((s: any) => [s.id, s]) || []);

        let bestPool: any = null;
        let minRemaining = Infinity;
        for (const pool of allNearbyPools) {
          const shop = shopMap.get(pool.shop_id);
          if (!shop?.name) continue;
          const currentAmount = pool.current_amount || 0;
          const remaining = pool.min_amount - currentAmount;
          if (remaining < minRemaining && remaining > 0) {
            minRemaining = remaining;
            bestPool = {
              id: pool.pool_id, shop_id: pool.shop_id,
              shop_name: shop.name || "Unknown Shop", shop_logo_url: shop.logo_url || null,
              location_name: user ? `${pool.distance_km.toFixed(1)} km away` : locationName,
              current_amount: currentAmount, min_amount: pool.min_amount,
              location_id: "", remaining_chf: remaining,
            };
          }
        }
        setFeaturedPool(bestPool);
      } catch (err) {
        console.error("Error fetching featured pool:", err);
        setFeaturedPool(null);
      } finally { setLoading(false); }
    };
    fetchFeaturedPool();
  }, [user, authLoading]);

  const handleClick = async () => {
    const draft = { shopId: featuredPool?.shop_id || null, location: null, basketLink: "", basketNote: "", basketAmount: "", step: 1 };
    try { await AsyncStorage.setItem("pendingAlphaBasket", JSON.stringify(draft)); } catch {}
    router.push('/stores'  as any);
  };

  if (loading) {
    return (
      <Animated.View style={[styles.loadingContainer, { opacity: pulseAnim }]}>
        <View style={styles.loadingShopLogo} />
        <View style={styles.loadingTextContainer}>
          <View style={styles.loadingTag} />
          <View style={styles.loadingTitle} />
          <View style={styles.loadingProgressContainer}>
            <View style={styles.loadingProgressText} />
            <View style={styles.loadingProgressBar} />
          </View>
        </View>
        <View style={styles.loadingArrow} />
      </Animated.View>
    );
  }

  if (!featuredPool) {
    return (
      <View style={styles.noFeaturedPoolContainer}>
        <Text style={styles.noFeaturedPoolText}>There is no featured pool available right now.</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handleClick} activeOpacity={0.8}>
      <View style={styles.cardContent}>
        <View style={styles.shopLogoContainer}>
          {featuredPool.shop_logo_url ? (
            <Image source={{ uri: featuredPool.shop_logo_url }} style={styles.shopLogoImage} accessibilityLabel={featuredPool.shop_name} />
          ) : (
            <ArchiveBoxIcon size={28} color={colors['shelivery-text-tertiary']} />
          )}
        </View>
        <View style={styles.shopInfoContainer}>
          <View style={styles.meetupTagContainer}>
            <Text style={styles.meetupTagText}>Meetup @ {featuredPool.location_name}</Text>
          </View>
          <View style={styles.shopNameRow}>
            <Text style={styles.shopNameText} numberOfLines={1}>{featuredPool.shop_name}</Text>
            <ChevronRightIcon size={16} color={colors['shelivery-text-tertiary']} style={styles.shopNameArrowIcon} />
          </View>
          <View style={styles.progressBarRow}>
            <Text style={styles.progressBarText}>{featuredPool.remaining_chf} CHF to go</Text>
            <ProgressBar
              current={featuredPool.current_amount || 0}
              target={featuredPool.min_amount}
              showPercentage={false} showAmount={false} animated={false} variant="default"
              containerStyle={styles.progressBarOverride}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
