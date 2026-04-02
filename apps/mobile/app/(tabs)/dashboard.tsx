import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/lib/theme";
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



// Loading component that matches the app's design
function DashboardLoading() {
    return (
        <View style={styles.loadingContainer}>
            {/* Header skeleton */}
            <View style={styles.loadingHeader}>
                <View style={[styles.skeleton, { width: 100, height: 32 }]} />
                <View style={styles.loadingHeaderButtons}>
                    <View style={[styles.skeleton, styles.loadingButtonSkeleton]} />
                    <View style={[styles.skeleton, styles.loadingButtonSkeleton, { width: 80 }]} />
                </View>
            </View>

            {/* Profile card skeleton */}
            <View style={styles.loadingProfileCard}>
                <View style={[styles.skeleton, styles.loadingAvatarSkeleton]} />
                <View style={styles.loadingProfileTextContainer}>
                    <View style={[styles.skeleton, { height: 20, width: 150 }]} />
                    <View style={[styles.skeleton, { height: 16, width: 100, marginTop: 4 }]} />
                </View>
            </View>

            {/* Add basket button skeleton */}
            <View style={[styles.skeleton, styles.loadingAddBasketButton]} />

            {/* Baskets section skeleton */}
            <View style={styles.loadingBasketsSection}>
                <View style={[styles.skeleton, { height: 24, width: 200 }]} />
                <View style={styles.loadingBasketsList}>
                    <View style={[styles.skeleton, styles.loadingBasketItem]} />
                    <View style={[styles.skeleton, styles.loadingBasketItem]} />
                    <View style={[styles.skeleton, styles.loadingBasketItem]} />
                </View>
            </View>

            {/* Banner skeleton */}
            <View style={[styles.skeleton, styles.loadingBanner]} />

            {/* Archive section skeleton */}
            <View style={styles.loadingArchiveSection}>
                <View style={[styles.skeleton, styles.loadingArchiveToggle]} />
            </View>
        </View>
    );
}

interface ShopData {
    id: string;
    name: string;
    logo_url: string | null;
}

interface Basket {
    id: string;
    user_id: string;
    shop_id: string;
    pool_id: string;
    amount: number;
    link: string;
    status: 'in_pool' | 'in_chat' | 'resolved';
    is_ready: boolean;
    chatroom_id: string;
    created_at: string;
    shop: {
        name: string;
        logo_url: string | null;
    } | null;
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
    const [loadingBaskets, setLoadingBaskets] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOldOrders, setShowOldOrders] = useState(false);
    // const [showTutorial, setShowTutorial] = useState(false); // Tutorial skipped

    const router = useRouter();
    const { user, loading: authLoading } = useAuth(); // Authentication postponed

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            
            setLoadingBaskets(true);
            setError(null);

            const { data: userData, error: userError } = await supabase
                .from("user")
                .select("first_name, image")
                .eq("id", user.id)
                .single();

                if (userError) {
                    console.error("Error fetching user profile:", userError);
                    setError("Failed to load user profile.");
                    setUserProfile({ userName: "User", userAvatar: "/avatars/default-avatar.png" });
                } else if (userData) {
                    setUserProfile({
                        userName: userData.first_name || "User",
                        userAvatar: userData.image || "/avatars/default-avatar.png",
                    });
                }

            try {
                const { data: basketsData, error: basketsError } = await supabase
                    .from("basket")
                    .select(`
                        id,
                        amount,
                        status,
                        chatroom_id,
                        shop (
                            name,
                            logo_url
                        )
                    `)
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                    if (basketsError) {
                        throw basketsError;
                    }

                    if (basketsData) {
                        const mappedBaskets: DisplayBasket[] = basketsData.map((basket: any) => ({
                            id: basket.id,
                            shopName: basket.shop?.name || "Unknown Shop",
                            shopLogo: basket.shop?.logo_url || null,
                            total: basket.amount ? `CHF ${basket.amount.toFixed(2)}` : "CHF 0.00",
                            status: basket.status,
                            chatroomId: basket.chatroom_id || undefined,
                        }));

                        const active = mappedBaskets.filter(b => b.status === 'in_pool' || b.status === 'in_chat');
                        const resolved = mappedBaskets.filter(b => b.status === 'resolved');

                        setActiveBaskets(active);
                        setResolvedBaskets(resolved);
                    }
                } catch (err: any) {
                    console.error("Error fetching baskets:", err);
                    setError(err.message || "Failed to load baskets.");
            } finally {
                setLoadingBaskets(false);
            }
        };

        if (!authLoading && user) {
            fetchData();
            // Tutorial skipped, no need to check AsyncStorage
        }
    }, [user, authLoading]);

    const handleAddBasket = () => {
        router.push("/stores" as any);
    };

    const handleInviteFriend = () => {
        router.push("/invite-friend" as any); 
    };

    const handleBasketClick = (basketId: string) => {
        const basket = [...activeBaskets, ...resolvedBaskets].find(b => b.id === basketId);
        if (!basket) {
            console.warn(`Basket with ID ${basketId} not found.`);
            return;
        }

        console.log(`Basket clicked: ${basket.id}, Status: ${basket.status}, Chatroom ID: ${basket.chatroomId}`);

        router.push('/stores' as any);
    };

    // Tutorial skipped, no handleTutorialComplete function needed
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                {authLoading ? (
                    <DashboardLoading />
                ) : !user ? (
                    <>
                        <View style={styles.dashboardHeader} accessibilityLabelledBy="dashboard-header" />

                        <SignInCard id="sign-in-card" />

                        <SquareBanner id="square-banner" />
                        <Text style={styles.sectionTitle}>
                            Just About to Complete 🔥
                        </Text>
                        <FeaturedShopCard />
                        <AddBasket onClick={handleAddBasket} id="add-basket-button" />
                    </>
                ) : (
                    <>
                        <View style={styles.dashboardHeader} accessibilityLabelledBy="dashboard-header">
                            <Text style={styles.dashboardTitle}>
                                Dashboard
                            </Text>
                            <View style={styles.headerButtons}>
                                <TouchableOpacity
                                    onPress={handleInviteFriend}
                                    style={styles.inviteFriendsButton}
                                    accessibilityLabel="Invite Friends"
                                >
                                    <Text style={styles.inviteFriendsButtonText}>
                                        Invite Friends
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => router.push("/alpha" as any)} // Temporary: use alpha since feedback doesn't exist yet
                                    style={styles.supportTicketButton}
                                    accessibilityLabel="Support Ticket"
                                >
                                    <View style={styles.supportTicketButtonContent}>
                                        <TicketIcon size={20} color={colors['shelivery-text-secondary']} />
                                        <Text style={styles.supportTicketButtonText}>Support</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {userProfile ? (
                            <ProfileCard
                                userName={userProfile.userName}
                                userAvatar={userProfile.userAvatar}
                                id="profile-card"
                            />
                        ) : (
                            <View style={styles.profileCardSkeleton}>
                                <View style={[styles.skeleton, styles.loadingAvatarSkeleton]} />
                                <View style={styles.loadingProfileTextContainer}>
                                    <View style={[styles.skeleton, { height: 15, width: 200 }]} />
                                    <View style={[styles.skeleton, { height: 12, width: 150, marginTop: 5 }]} />
                                </View>
                            </View>
                        )}
                        <AddBasket onClick={handleAddBasket} id="add-basket-button" />

                        <Text style={styles.sectionTitle}>
                            Just About to Complete 🔥
                        </Text>
                        <FeaturedShopCard />
                        {loadingBaskets ? (
                            <DashboardLoading />
                        ) : error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>
                                    {error}
                                </Text>
                                <TouchableOpacity onPress={() => window.location.reload()} style={styles.retryButton}>
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {activeBaskets.length === 0 ? (
                                    <View style={styles.noActiveBasketsMessage} accessibilityLabelledBy="no-active-baskets-message">
                                        <Text style={styles.noActiveBasketsTitle}>No active baskets</Text>
                                        <Text style={styles.noActiveBasketsText}>Create a basket and have a shared shopping experience!</Text>
                                    </View>
                                ) : (
                                    <Baskets baskets={activeBaskets} onBasketClick={handleBasketClick} id="active-baskets-list" />
                                )}
                                <Banner id="dashboard-banner" />

                                {resolvedBaskets.length > 0 && (
                                    <View style={styles.oldOrdersSection} accessibilityLabelledBy="old-orders-section">
                                        <TouchableOpacity
                                            style={styles.oldOrdersToggle}
                                            onPress={() => setShowOldOrders(!showOldOrders)}
                                            accessibilityLabel="Toggle old orders archive"
                                        >
                                            <Text style={styles.oldOrdersToggleText}>Archive ({resolvedBaskets.length})</Text>
                                            {showOldOrders ? (
                                                <ChevronUpIcon size={20} color={colors['shelivery-text-secondary']} />
                                            ) : (
                                                <ChevronDownIcon size={20} color={colors['shelivery-text-secondary']} />
                                            )}
                                        </TouchableOpacity>
                                        {showOldOrders && (
                                            <View style={styles.resolvedBasketsList} accessibilityLabelledBy="resolved-baskets-list">
                                                <Baskets baskets={resolvedBaskets} onBasketClick={handleBasketClick} />
                                            </View>
                                        )}
                                    </View>
                                )}
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors['shelivery-background-gray'],
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32, // Add some bottom padding for scrollability
    },
    loadingContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
        gap: 24, // space-y-6
    },
    skeleton: {
        backgroundColor: colors['shelivery-card-border'], // bg-gray-200
        borderRadius: 4,
    },
    loadingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4, // py-1
    },
    loadingHeaderButtons: {
        flexDirection: 'row',
        gap: 8, // gap-2
    },
    loadingButtonSkeleton: {
        height: 32,
        width: 100,
        borderRadius: 8,
    },
    loadingProfileCard: {
        backgroundColor: colors.white,
        borderRadius: 16, // rounded-2xl
        padding: 24, // p-6
        shadowColor: colors['shelivery-shadow-color'],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16, // gap-4
    },
    loadingAvatarSkeleton: {
        width: 54,
        height: 54,
        borderRadius: 27, // circle
    },
    loadingProfileTextContainer: {
        flex: 1,
    },
    loadingAddBasketButton: {
        height: 60,
        width: '100%',
        borderRadius: 12, // rounded-xl
    },
    loadingBasketsSection: {
        gap: 12, // space-y-3
    },
    loadingBasketsList: {
        gap: 8, // space-y-2
    },
    loadingBasketItem: {
        height: 80,
        width: '100%',
        borderRadius: 8,
    },
    loadingBanner: {
        height: 120,
        width: '100%',
        borderRadius: 12,
    },
    loadingArchiveSection: {
        marginTop: 24, // mt-6
        borderTopWidth: 1,
        borderTopColor: colors['shelivery-card-border'], // border-gray-200
        paddingTop: 16, // pt-4
    },
    loadingArchiveToggle: {
        height: 40,
        width: '100%',
        borderRadius: 8,
    },
    dashboardHeader: {
        paddingVertical: 4, // py-1
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dashboardTitle: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 32,
        color: colors.black,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // gap-2
    },
    inviteFriendsButton: {
        backgroundColor: colors['shelivery-primary-blue'],
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 8,
    },
    inviteFriendsButtonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    supportTicketButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: colors['shelivery-background-gray'], // bg-gray-200
        color: colors['shelivery-text-secondary'], // text-gray-700
        borderRadius: 8,
    },
    supportTicketButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4, // gap-1
    },
    supportTicketButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors['shelivery-text-secondary'],
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors['shelivery-text-primary'],
        marginTop: 16, // mt-4
        paddingVertical: 16, // py-4
    },
    profileCardSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    errorContainer: {
        textAlign: 'center',
        paddingVertical: 32, // py-8
        alignItems: 'center',
    },
    errorText: {
        color: colors['shelivery-error-red'],
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: colors['shelivery-primary-blue'],
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    noActiveBasketsMessage: {
        textAlign: 'center',
        color: colors['shelivery-text-secondary'],
        borderColor: colors['shelivery-card-border'],
        borderWidth: 1,
        borderRadius: 16, // rounded-2xl
        padding: 24, // p-6
        backgroundColor: colors.white,
        shadowColor: colors['shelivery-shadow-color'],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginVertical: 16, // my-4
        alignItems: 'center',
    },
    noActiveBasketsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors['shelivery-text-primary'],
    },
    noActiveBasketsText: {
        marginTop: 8,
        fontSize: 14,
        color: colors['shelivery-text-secondary'],
    },
    oldOrdersSection: {
        marginTop: 24, // mt-6
        borderTopWidth: 1,
        borderTopColor: colors['shelivery-card-border'],
        paddingTop: 16, // pt-4
    },
    oldOrdersToggle: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors['shelivery-background-gray'], // bg-gray-100
        borderRadius: 8,
    },
    oldOrdersToggleText: {
        color: colors['shelivery-text-secondary'],
        fontWeight: '600',
        fontSize: 16,
    },
    resolvedBasketsList: {
        marginTop: 16, // mt-4
    },
});
