import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { ProgressBar } from "@/components/ui/ProgressBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/lib/theme";
import { ChevronRightIcon, ArchiveBoxIcon } from 'react-native-heroicons/solid';
import { useAuth } from "@/hooks/useAuth";

// Default towns with their coordinates and preferred km (used for unauthenticated users)
const DEFAULT_TOWNS = [
    {
        name: "Lausanne",
        lat: 46.5196535,
        lng: 6.6322734,
        preferedKm: 10,
    },
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

interface FeaturedShopCardProps {
    className?: string; // Not directly used in RN, kept for API compatibility
}

export default function FeaturedShopCard({ }: FeaturedShopCardProps) {
    const [featuredPool, setFeaturedPool] = useState<FeaturedPool | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Animated value for skeleton pulse effect
    const pulseAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        if (!loading) return;
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 750,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.4,
                    duration: 750,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [loading, pulseAnim]);

    useEffect(() => {
        const fetchFeaturedPool = async () => {
            if (authLoading) return; // Wait for auth state

            try {
                setLoading(true);

                // Get user's location data
                let userLat: number | null = null;
                let userLng: number | null = null;
                let maxRadiusKm = 5; // Default radius
                let locationName = "";

                if (user) {
                    // Authenticated user – get their location from database
                    const { data: userData } = await supabase
                        .from("user")
                        .select("lat, lng, prefered_km")
                        .eq("id", user.id)
                        .single();

                    if (userData?.lat && userData?.lng) {
                        userLat = userData.lat;
                        userLng = userData.lng;
                        if (userData.prefered_km) {
                            maxRadiusKm = userData.prefered_km;
                        }
                        locationName = "Your location";
                    }
                } else {
                    // Unauthenticated user – use random default town
                    if (DEFAULT_TOWNS.length > 0) {
                        const randomIndex = Math.floor(Math.random() * DEFAULT_TOWNS.length);
                        const randomTown = DEFAULT_TOWNS[randomIndex];
                        if (randomTown) {
                            userLat = randomTown.lat;
                            userLng = randomTown.lng;
                            maxRadiusKm = randomTown.preferedKm;
                            locationName = randomTown.name;
                        }
                    }
                }

                // If no location available, don't show any featured pool
                if (!userLat || !userLng) {
                    setFeaturedPool(null);
                    return;
                }

                // Get all active shops
                const { data: shops, error: shopsError } = await supabase
                    .from("shop")
                    .select("id")
                    .eq("is_active", true);

                if (shopsError || !shops) {
                    console.error("Error fetching shops:", shopsError);
                    setFeaturedPool(null);
                    return;
                }

                // Collect all nearby pools from all shops
                const allNearbyPools: any[] = [];

                for (const shop of shops) {
                    try {
                        const { data: nearbyPools, error: nearbyError } = await supabase.rpc("find_nearby_pools", {
                            p_shop_id: shop.id,
                            p_lat: userLat,
                            p_lng: userLng,
                            p_max_radius_km: maxRadiusKm,
                        });

                        if (nearbyError) {
                            console.error(`Error finding nearby pools for shop ${shop.id}:`, nearbyError);
                            continue;
                        }

                        if (nearbyPools) {
                            // Add shop info to each pool
                            for (const pool of nearbyPools) {
                                allNearbyPools.push({
                                    ...pool,
                                    shop_id: shop.id,
                                });
                            }
                        }
                    } catch (err) {
                        console.error(`Error calling find_nearby_pools for shop ${shop.id}:`, err);
                        continue;
                    }
                }

                if (allNearbyPools.length === 0) {
                    setFeaturedPool(null);
                    return;
                }

                // Get shop details for the pools we found
                const shopIds = Array.from(new Set(allNearbyPools.map(p => p.shop_id)));
                const { data: shopDetails, error: shopDetailsError } = await supabase
                    .from("shop")
                    .select("id, name, logo_url")
                    .in("id", shopIds);

                if (shopDetailsError) {
                    console.error("Error fetching shop details:", shopDetailsError);
                    setFeaturedPool(null);
                    return;
                }

                const shopMap = new Map(shopDetails?.map(s => [s.id, s]) || []);

                // Find the pool with minimum remaining CHF (closest to goal)
                let bestPool: any = null;
                let minRemaining = Infinity;

                for (const pool of allNearbyPools) {
                    const shop = shopMap.get(pool.shop_id);
                    if (!shop?.name) continue;

                    const currentAmount = pool.current_amount || 0;
                    const remaining = pool.min_amount - currentAmount;

                    if (remaining < minRemaining && remaining > 0) {
                        minRemaining = remaining;

                        // Set location name based on authentication status
                        const poolLocationName = user
                            ? `${pool.distance_km.toFixed(1)} km away`
                            : locationName;

                        bestPool = {
                            id: pool.pool_id,
                            shop_id: pool.shop_id,
                            shop_name: shop.name || "Unknown Shop",
                            shop_logo_url: shop.logo_url || null,
                            location_name: poolLocationName,
                            current_amount: currentAmount,
                            min_amount: pool.min_amount,
                            location_id: "", // Not needed for nearby pools
                            remaining_chf: remaining,
                        };
                    }
                }

                setFeaturedPool(bestPool);
            } catch (err) {
                console.error("Error fetching featured pool:", err);
                setFeaturedPool(null);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedPool();
    }, [user, authLoading]);

    const handleClick = async () => {
        // Save draft with the featured shop pre-selected
        const draft = {
            shopId: featuredPool?.shop_id || null,
            location: null,
            basketLink: "",
            basketNote: "",
            basketAmount: "",
            step: 1,
        };

        try {
            await AsyncStorage.setItem("pendingAlphaBasket", JSON.stringify(draft));
        } catch (err) {
            console.error("Failed to save draft:", err);
        }

        router.push('/alpha?restored=true' as any);
    };

    if (loading) {
        return (
            <Animated.View style={[styles.loadingContainer, { opacity: pulseAnim }]}>
                {/* Skeleton logo */}
                <View style={styles.loadingShopLogo} />

                <View style={styles.loadingTextContainer}>
                    {/* Skeleton tag */}
                    <View style={styles.loadingTag} />

                    {/* Skeleton title */}
                    <View style={styles.loadingTitle} />

                    {/* Skeleton progress and amount */}
                    <View style={styles.loadingProgressContainer}>
                        <View style={styles.loadingProgressText} />
                        <View style={styles.loadingProgressBar} />
                    </View>
                </View>

                {/* Skeleton arrow */}
                <View style={styles.loadingArrow} />
            </Animated.View>
        );
    }

    if (!featuredPool) {
        return (
            <View style={styles.noFeaturedPoolContainer}>
                <Text style={styles.noFeaturedPoolText}>
                    There is no featured pool available right now.
                </Text>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={handleClick}
            activeOpacity={0.8}
        >
            <View style={styles.cardContent}>
                {/* Shop Logo */}
                <View style={styles.shopLogoContainer}>
                    {featuredPool.shop_logo_url ? (
                        <Image
                            source={{ uri: featuredPool.shop_logo_url }}
                            style={styles.shopLogoImage}
                            accessibilityLabel={featuredPool.shop_name}
                        />
                    ) : (
                        <ArchiveBoxIcon
                            size={28}
                            color={colors['shelivery-text-tertiary']}
                        />
                    )}
                </View>

                {/* Shop Info */}
                <View style={styles.shopInfoContainer}>
                    {/* Meetup point tag */}
                    <View style={styles.meetupTagContainer}>
                        <Text style={styles.meetupTagText}>
                            Meetup @ {featuredPool.location_name}
                        </Text>
                    </View>

                    {/* Shop Name */}
                    <View style={styles.shopNameRow}>
                        <Text style={styles.shopNameText} numberOfLines={1}>
                            {featuredPool.shop_name}
                        </Text>
                        <ChevronRightIcon
                            size={16}
                            color={colors['shelivery-text-tertiary']}
                            style={styles.shopNameArrowIcon}
                        />
                    </View>

                    {/* Progress – compact horizontal layout */}
                    <View style={styles.progressBarRow}>
                        <Text style={styles.progressBarText}>
                            {featuredPool.remaining_chf} CHF to go
                        </Text>
                        <ProgressBar
                            current={featuredPool.current_amount || 0}
                            target={featuredPool.min_amount}
                            showPercentage={false}
                            showAmount={false}
                            animated={false}
                            variant="default"
                            containerStyle={styles.progressBarOverride}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // ── Skeleton / Loading ──────────────────────────────────────────────────────
    loadingContainer: {
        backgroundColor: colors.white,
        borderRadius: 16,       // rounded-shelivery-lg
        padding: 12,            // p-3
        borderWidth: 1,
        borderColor: colors['shelivery-card-border'],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,                // gap-3
    },
    loadingShopLogo: {
        width: 56,              // w-14
        height: 56,             // h-14
        backgroundColor: colors['shelivery-background-gray'],
        borderRadius: 8,        // rounded-shelivery-md
        flexShrink: 0,
    },
    loadingTextContainer: {
        flex: 1,
        minWidth: 0,
    },
    loadingTag: {
        width: 96,              // w-24
        height: 12,             // h-3
        backgroundColor: colors['shelivery-card-border'],
        borderRadius: 9999,     // rounded-full
        marginBottom: 4,        // mb-1
    },
    loadingTitle: {
        width: 128,             // w-32
        height: 16,             // h-4
        backgroundColor: colors['shelivery-card-border'],
        borderRadius: 4,
        marginBottom: 4,        // mb-1
    },
    loadingProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,                 // gap-2
    },
    loadingProgressText: {
        width: 64,              // w-16
        height: 12,             // h-3
        backgroundColor: colors['shelivery-card-border'],
        borderRadius: 4,
    },
    loadingProgressBar: {
        flex: 1,
        height: 8,              // ~h-2
        backgroundColor: colors['shelivery-card-border'],
        borderRadius: 4,
    },
    loadingArrow: {
        width: 16,              // w-4
        height: 16,             // h-4
        backgroundColor: colors['shelivery-card-border'],
        borderRadius: 4,
    },

    // ── Empty state ─────────────────────────────────────────────────────────────
    noFeaturedPoolContainer: {
        borderWidth: 1,
        borderColor: colors['shelivery-card-border'],
        borderRadius: 16,       // rounded-2xl
        padding: 24,            // p-6
        backgroundColor: colors.white,
        shadowColor: colors['shelivery-shadow-color'],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 16,       // mb-4
        alignItems: 'center',   // centre children (replaces invalid textAlign on View)
    },
    noFeaturedPoolText: {
        fontSize: 18,           // text-lg
        fontWeight: '600',      // font-semibold
        color: colors['shelivery-text-primary'],
        textAlign: 'center',
    },

    // ── Card ────────────────────────────────────────────────────────────────────
    cardContainer: {
        marginBottom: 8,        // mb-2
        backgroundColor: colors.white,
        borderRadius: 16,       // rounded-shelivery-lg
        padding: 12,            // p-3
        borderWidth: 1,
        borderColor: colors['shelivery-card-border'],
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,                // gap-3
    },

    // Shop logo
    shopLogoContainer: {
        width: 56,              // w-14
        height: 56,             // h-14
        backgroundColor: colors['shelivery-background-gray'],
        borderRadius: 8,        // rounded-shelivery-md
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    shopLogoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 8,        // rounded-shelivery-md
    },

    // Shop info column
    shopInfoContainer: {
        flex: 1,
        minWidth: 0,
    },
    meetupTagContainer: {
        marginBottom: 2,        // mb-0.5
    },
    meetupTagText: {
        alignSelf: 'flex-start',// inline-block
        backgroundColor: colors['shelivery-primary-blue'],
        color: colors.white,
        fontSize: 10,           // text-[10px]
        paddingHorizontal: 6,   // px-1.5
        paddingVertical: 2,     // py-0.5
        borderRadius: 9999,     // rounded-full
        fontWeight: '500',      // font-medium
        overflow: 'hidden',
    },
    shopNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    shopNameText: {
        fontWeight: '600',      // font-semibold
        color: colors['shelivery-text-primary'],
        flexShrink: 1,
    },
    shopNameArrowIcon: {
        flexShrink: 0,
        marginLeft: 4,          // ml-1
    },

    // Progress row
    progressBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,                 // gap-2
        marginTop: 4,           // mt-1
    },
    progressBarText: {
        fontSize: 10,           // text-[10px]
        color: colors['shelivery-text-secondary'],
        fontWeight: '500',      // font-medium
    },
    // Passed as containerStyle to <ProgressBar> to override its default marginBottom
    progressBarOverride: {
        flex: 1,
        marginBottom: 0,
    },
});
