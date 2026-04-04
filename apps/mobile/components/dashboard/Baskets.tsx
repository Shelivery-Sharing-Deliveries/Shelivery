// components/dashboard/Baskets.tsx
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { ArchiveBoxIcon } from "react-native-heroicons/solid";
import { colors } from "@/lib/theme";

interface Basket {
    id: string;
    shopName: string;
    shopLogo: string | null;
    total: string;
    status: "in_pool" | "in_chat" | "resolved";
    chatroomId?: string; // Mobile-specific: used for chatroom navigation
}

interface BasketsProps {
    baskets: Basket[];
    onBasketClick?: (basketId: string) => void;
    id?: string;
}

// Status config matches the src/ web design exactly (bg / text / border)
const statusConfig = {
    in_pool: {
        text: "In Pool",
        bgColor: "#EFF8FF",
        textColor: "#175CD3",
        borderColor: "#D8F0FE",
    },
    in_chat: {
        text: "In Chat",
        bgColor: "#FEF3F2",
        textColor: "#B42318",
        borderColor: "#FFECEE",
    },
    resolved: {
        text: "Resolved",
        bgColor: "#ECFDF3",
        textColor: "#027A48",
        borderColor: "#D1FADF",
    },
};

export default function Baskets({ baskets, onBasketClick }: BasketsProps) {
    const isEmpty = baskets.length === 0;

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Your Baskets</Text>
            </View>

            {isEmpty ? (
                /* Empty State */
                <View style={styles.emptyStateContainer}>
                    <Image
                        source={require("../../assets/icons/empty-basket-illustration.png")}
                        style={styles.emptyStateImage}
                        resizeMode="contain"
                        accessibilityLabel="Empty basket"
                    />
                    <Text style={styles.emptyStateText}>
                        Create your first group basket to unlock free delivery
                    </Text>
                </View>
            ) : (
                /* Baskets List */
                <View style={styles.basketsList}>
                    {baskets.map((basket) => (
                        <BasketItem
                            key={basket.id}
                            basket={basket}
                            onPress={() => onBasketClick?.(basket.id)}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

// ─── Inline BasketCard sub-component ──────────────────────────────────────────

interface BasketItemProps {
    basket: Basket;
    onPress?: () => void;
}

function BasketItem({ basket, onPress }: BasketItemProps) {
    const statusStyle = statusConfig[basket.status];

    // Guard against unknown status
    if (!statusStyle) {
        console.error("Unknown basket status:", basket.status);
        return null;
    }

    const shopLogoUrl = basket.shopLogo || null;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.cardRow}>
                {/* Left – Shop info */}
                <View style={styles.shopInfo}>
                    {/* Shop Logo */}
                    <View style={styles.shopLogoContainer}>
                        {shopLogoUrl ? (
                            <Image
                                source={{ uri: shopLogoUrl }}
                                style={styles.shopLogoImage}
                                resizeMode="cover"
                                accessibilityLabel={basket.shopName}
                            />
                        ) : (
                            <ArchiveBoxIcon
                                size={24}
                                color={colors["shelivery-text-tertiary"]}
                            />
                        )}
                    </View>

                    {/* Shop details */}
                    <View style={styles.shopDetails}>
                        <Text style={styles.shopNameText} numberOfLines={1}>
                            {basket.shopName}
                        </Text>
                        <Text style={styles.totalText}>
                            Total: {basket.total}
                        </Text>
                    </View>
                </View>

                {/* Right – Status badge */}
                <View
                    style={[
                        styles.badge,
                        {
                            backgroundColor: statusStyle.bgColor,
                            borderColor: statusStyle.borderColor,
                        },
                    ]}
                >
                    <Text
                        style={[styles.badgeText, { color: statusStyle.textColor }]}
                    >
                        {statusStyle.text}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // ── Outer container ────────────────────────────────────────────────────────
    container: {
        marginBottom: 24,           // mb-6
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,           // mb-4
    },
    headerText: {
        fontSize: 16,               // text-[16px]
        fontWeight: "700",          // font-bold
        lineHeight: 32,             // leading-8
        color: colors.black,
    },

    // ── Empty state ────────────────────────────────────────────────────────────
    emptyStateContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingHorizontal: 16,      // px-4
        paddingVertical: 32,        // py-8
        gap: 12,                    // gap-3
    },
    emptyStateImage: {
        width: 160,
        height: 190,
    },
    emptyStateText: {
        fontSize: 14,               // text-[14px]
        fontWeight: "500",          // font-medium
        lineHeight: 20,             // leading-[20px]
        textAlign: "center",
        color: colors.black,
        maxWidth: 280,              // max-w-[280px]
    },

    // ── Baskets list ───────────────────────────────────────────────────────────
    basketsList: {
        flexDirection: "column",
        gap: 12,                    // gap-3
    },

    // ── Basket card ────────────────────────────────────────────────────────────
    card: {
        width: "100%",
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 16,           // rounded-[16px]
        padding: 8,                 // p-2
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    // Shop info (left side)
    shopInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,                    // gap-3
        flexShrink: 1,
    },
    shopLogoContainer: {
        width: 54,                  // w-[54px]
        height: 54,                 // h-[54px]
        borderRadius: 12,           // rounded-[12px]
        backgroundColor: colors["shelivery-background-gray"],
        overflow: "hidden",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    shopLogoImage: {
        width: "100%",
        height: "100%",
    },
    shopDetails: {
        flexDirection: "column",
        gap: 4,                     // gap-1
        flexShrink: 1,
    },
    shopNameText: {
        fontSize: 16,               // text-[16px]
        fontWeight: "700",          // font-bold
        lineHeight: 24,             // leading-[24px]
        color: "#111827",
    },
    totalText: {
        fontSize: 12,               // text-[12px]
        fontWeight: "400",          // font-normal
        lineHeight: 16,             // leading-[16px]
        color: "#374151",
    },

    // Status badge (right side)
    badge: {
        paddingHorizontal: 8,       // px-2
        paddingVertical: 2,         // py-0.5
        borderRadius: 16,           // rounded-[16px]
        borderWidth: 1,
        flexShrink: 0,
    },
    badgeText: {
        fontSize: 12,               // text-[12px]
        fontWeight: "500",          // font-medium
        lineHeight: 16,             // leading-[16px]
    },
});
