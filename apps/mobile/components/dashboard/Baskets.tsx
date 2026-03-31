import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "@/lib/theme";
import { BasketCard } from "@/components/ui/BasketCard"; // Assuming BasketCard is in ui folder

interface Basket {
    id: string;
    shopName: string;
    shopLogo: string | null;
    total: string;
    status: "in_pool" | "in_chat" | "resolved";
    chatroomId?: string; // Added for navigation
}

interface BasketsProps {
    baskets: Basket[];
    onBasketClick?: (basketId: string) => void;
    id?: string;
}

const statusConfig = {
    in_pool: {
        text: "In Pool",
        bgColor: colors['shelivery-badge-blue-bg'],
        textColor: colors['shelivery-badge-blue-text'],
        borderColor: colors['shelivery-badge-blue-border'],
    },
    in_chat: {
        text: "In Chat",
        bgColor: colors['shelivery-badge-red-bg'],
        textColor: colors['shelivery-badge-red-text'],
        borderColor: colors['shelivery-badge-red-border'],
    },
    resolved: {
        text: "Resolved",
        bgColor: colors['shelivery-badge-green-bg'],
        textColor: colors['shelivery-badge-green-text'],
        borderColor: colors['shelivery-badge-green-border'],
    },
};

export default function Baskets({ baskets, onBasketClick, id }: BasketsProps) {
    const isEmpty = baskets.length === 0;

    return (
        <View style={styles.container} accessibilityLabelledBy={id}>
            {/* Section Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Your Baskets
                </Text>
            </View>

            {isEmpty ? (
                /* Empty State */
                <View style={styles.emptyStateContainer}>
                    <View style={styles.emptyStateImageWrapper}>
                        <Image
                            source={require("../../public/icons/empty-basket-illustration.png")}
                            alt="Empty basket"
                            style={styles.emptyStateImage}
                        />
                    </View>
                    <Text style={styles.emptyStateText}>
                        Create your first group basket to unlock free delivery
                    </Text>
                </View>
            ) : (
                /* Baskets List */
                <View style={styles.basketsList}>
                    {baskets.map((basket) => (
                        <BasketCard
                            key={basket.id}
                            id={basket.id}
                            shopName={basket.shopName}
                            shopLogo={basket.shopLogo}
                            amount={parseFloat(basket.total.replace('CHF ', ''))} // Convert total string to number
                            isReady={basket.status === 'in_pool'} // Assuming 'in_pool' means ready
                            status={basket.status}
                            onPress={onBasketClick}
                            // Pass other props if needed for actions within BasketCard
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24, // mb-6
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16, // mb-4
    },
    headerText: {
        fontSize: 16, // text-[16px]
        fontWeight: "700", // font-bold
        lineHeight: 32, // leading-8
        color: colors.black, // text-black
    },
    emptyStateContainer: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingHorizontal: 16, // px-4
        paddingVertical: 32, // py-8
    },
    emptyStateImageWrapper: {
        flexDirection: "row",
        justifyContent: "center",
    },
    emptyStateImage: {
        width: 160,
        height: 190,
        resizeMode: "contain",
    },
    emptyStateText: {
        fontSize: 14, // text-[14px]
        fontWeight: "500", // font-medium
        lineHeight: 20, // leading-[20px]
        textAlign: "center",
        color: colors.black, // text-black
        maxWidth: 280, // max-w-[280px]
        marginTop: 12, // gap-3
    },
    basketsList: {
        flexDirection: "column",
        gap: 12, // gap-3
    },
});
