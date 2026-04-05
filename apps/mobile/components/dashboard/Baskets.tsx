import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { ArchiveBoxIcon } from "react-native-heroicons/solid";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

interface Basket {
  id: string;
  shopName: string;
  shopLogo: string | null;
  total: string;
  status: "in_pool" | "in_chat" | "resolved";
  chatroomId?: string;
}

interface BasketsProps {
  baskets: Basket[];
  onBasketClick?: (basketId: string) => void;
  id?: string;
}

// Light-mode badge config (dark-mode overrides applied inline via theme tokens)
const statusConfigLight = {
  in_pool:  { text: "In Pool",   bgKey: 'shelivery-badge-blue-bg',  textKey: 'shelivery-badge-blue-text',  borderKey: 'shelivery-badge-blue-border'  },
  in_chat:  { text: "In Chat",   bgKey: 'shelivery-badge-red-bg',   textKey: 'shelivery-badge-red-text',   borderKey: 'shelivery-badge-red-border'   },
  resolved: { text: "Resolved",  bgKey: 'shelivery-badge-green-bg', textKey: 'shelivery-badge-green-text', borderKey: 'shelivery-badge-green-border' },
} as const;

export default function Baskets({ baskets, onBasketClick }: BasketsProps) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const isEmpty = baskets.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Baskets</Text>
      </View>
      {isEmpty ? (
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
        <View style={styles.basketsList}>
          {baskets.map((basket) => (
            <BasketItem
              key={basket.id}
              basket={basket}
              onPress={() => onBasketClick?.(basket.id)}
              colors={colors}
              isDark={isDark}
              styles={styles}
            />
          ))}
        </View>
      )}
    </View>
  );
}

interface BasketItemProps {
  basket: Basket;
  onPress?: () => void;
  colors: ThemeColors;
  isDark: boolean;
  styles: ReturnType<typeof createStyles>;
}

function BasketItem({ basket, onPress, colors, styles }: BasketItemProps) {
  const config = statusConfigLight[basket.status];
  if (!config) return null;

  const shopLogoUrl = basket.shopLogo || null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardRow}>
        <View style={styles.shopInfo}>
          {/* Shop logo: always white bg so transparent PNGs render correctly */}
          <View style={styles.shopLogoContainer}>
            {shopLogoUrl ? (
              <Image
                source={{ uri: shopLogoUrl }}
                style={styles.shopLogoImage}
                resizeMode="contain"
                accessibilityLabel={basket.shopName}
              />
            ) : (
              <ArchiveBoxIcon size={24} color={colors["shelivery-text-tertiary"]} />
            )}
          </View>
          <View style={styles.shopDetails}>
            <Text style={styles.shopNameText} numberOfLines={1}>{basket.shopName}</Text>
            <Text style={styles.totalText}>Total: {basket.total}</Text>
          </View>
        </View>
        <View style={[styles.badge, {
          backgroundColor: colors[config.bgKey],
          borderColor: colors[config.borderKey],
        }]}>
          <Text style={[styles.badgeText, { color: colors[config.textKey] }]}>{config.text}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: { marginBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  headerText: {
    fontSize: 16, fontWeight: "700", lineHeight: 32,
    color: colors['shelivery-text-primary'],
  },
  emptyStateContainer: {
    alignItems: "center", justifyContent: "center",
    width: "100%", paddingHorizontal: 16, paddingVertical: 32, gap: 12,
  },
  emptyStateImage: { width: 160, height: 190 },
  emptyStateText: {
    fontSize: 14, fontWeight: "500", lineHeight: 20, textAlign: "center",
    color: colors['shelivery-text-secondary'], maxWidth: 280,
  },
  basketsList: { flexDirection: "column", gap: 12 },
  card: {
    width: "100%",
    backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : colors.white,
    borderWidth: 1,
    borderColor: colors['shelivery-card-border'],
    borderRadius: 16,
    padding: 8,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shopInfo: { flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 1 },
  // Always white bg so transparent shop logos render correctly
  shopLogoContainer: {
    width: 54, height: 54, borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: "hidden", flexShrink: 0,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors['shelivery-card-border'],
  },
  shopLogoImage: { width: "100%", height: "100%" },
  shopDetails: { flexDirection: "column", gap: 4, flexShrink: 1 },
  shopNameText: {
    fontSize: 16, fontWeight: "700", lineHeight: 24,
    color: colors['shelivery-text-primary'],
  },
  totalText: {
    fontSize: 12, fontWeight: "400", lineHeight: 16,
    color: colors['shelivery-text-secondary'],
  },
  badge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 16, borderWidth: 1, flexShrink: 0,
  },
  badgeText: { fontSize: 12, fontWeight: "500", lineHeight: 16 },
});
