import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Avatar } from "./Avatar"; // Assuming Avatar is in the same folder or adjust path
import { colors } from "@/lib/theme"; // Assuming you have a theme file with colors

interface BasketCardProps {
  id: string;
  shopName: string;
  shopLogo?: string | null | undefined;
  amount: number;
  isReady: boolean;
  status: "in_pool" | "in_chat" | "resolved";
  link?: string | null;
  onToggleReady?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  variant?: "small" | "large";
  className?: string; // Not directly used in RN, but kept for compatibility if needed
  onPress?: (basketId: string) => void; // Added for handling card press
}

const statusColors = {
  in_pool: colors['shelivery-badge-waiting'],
  in_chat: colors['shelivery-badge-ordering'],
  resolved: colors['shelivery-badge-delivered'],
};

const statusLabels = {
  in_pool: "In Pool",
  in_chat: "In Chat",
  resolved: "Delivered",
};

export function BasketCard({
  id,
  shopName,
  shopLogo,
  amount,
  isReady,
  status,
  link,
  onToggleReady,
  onEdit,
  onDelete,
  variant = "large",
  onPress,
}: BasketCardProps) {
  const isInteractive = status === "in_pool";

  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        variant === "small" ? styles.cardSmall : styles.cardLarge,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Header with shop info and status */}
      <View style={styles.header}>
        <View style={styles.shopInfo}>
          <Avatar
            src={shopLogo}
            name={shopName}
            size={variant === "small" ? "sm" : "md"}
            style={styles.avatarBorder}
          />
          <View style={styles.shopTextContainer}>
            <Text numberOfLines={1} style={styles.shopNameText}>
              {shopName}
            </Text>
            <Text style={styles.amountText}>
              Total: CHF {amount.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={[styles.badge, { backgroundColor: statusColors[status] }]}>
          <Text style={styles.badgeText}>{statusLabels[status]}</Text>
        </View>
      </View>

      {/* Actions for interactive baskets */}
      {isInteractive && variant === "large" && (
        <View style={styles.interactiveActions}>
          {/* Ready toggle */}
          <TouchableOpacity
            onPress={onToggleReady}
            style={[
              styles.readyToggleButton,
              isReady ? styles.readyToggleActive : styles.readyToggleInactive,
            ]}
          >
            <Text style={styles.readyToggleButtonText}>
              {isReady ? "Ready to Order" : "Mark as Ready"}
            </Text>
          </TouchableOpacity>

          {/* Secondary actions */}
          <View style={styles.secondaryActions}>
            {link && (
              <TouchableOpacity
                onPress={() => Linking.openURL(link)}
                style={styles.viewItemsButton}
              >
                <Text style={styles.viewItemsButtonText}>
                  View Items
                </Text>
              </TouchableOpacity>
            )}

            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>
                  Delete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Compact view for small variant */}
      {variant === "small" && (
        <View style={styles.compactView}>
          <Text style={styles.compactStatusText}>
            {isReady ? "✓ Ready" : "⏳ Pending"}
          </Text>
          {link && (
            <TouchableOpacity
              onPress={() => Linking.openURL(link)}
              style={styles.compactViewButton}
            >
              <Text style={styles.compactViewButtonText}>
                View
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 12, // rounded-shelivery-md
    padding: 16, // p-4
    shadowColor: colors['shelivery-shadow-color'], // shadow-shelivery-sm
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // For Android shadow
    marginBottom: 8, // Added for spacing in lists
  },
  cardSmall: {
    // Specific styles for small variant if needed
  },
  cardLarge: {
    // Specific styles for large variant if needed
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // space-x-3
    flexShrink: 1, // Allow text to shrink
  },
  avatarBorder: {
    borderWidth: 2,
    borderColor: colors['shelivery-border-gray'], // border-gray-200
  },
  shopTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  shopNameText: {
    fontSize: 16, // font-medium
    fontWeight: "500",
    color: colors['shelivery-text-primary'],
  },
  amountText: {
    fontSize: 14, // text-sm
    color: colors['shelivery-text-secondary'],
  },
  badge: {
    paddingHorizontal: 8, // px-2
    paddingVertical: 4, // py-1
    borderRadius: 9999, // rounded-full
  },
  badgeText: {
    fontSize: 12, // text-xs
    fontWeight: "600", // font-semibold
    color: colors.white, // Assuming badge text is white
  },
  interactiveActions: {
    flexDirection: "column",
    gap: 12, // space-y-3
    marginTop: 16, // mt-4
  },
  readyToggleButton: {
    width: "100%",
    paddingVertical: 8, // py-2
    borderRadius: 8, // rounded-shelivery-sm
    alignItems: "center",
  },
  readyToggleActive: {
    backgroundColor: colors['shelivery-primary-blue'], // Example color
  },
  readyToggleInactive: {
    backgroundColor: colors['shelivery-border-gray'], // Example color
  },
  readyToggleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 8, // space-x-2
  },
  viewItemsButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8, // py-2
  },
  viewItemsButtonText: {
    fontSize: 14, // text-sm
    color: colors['shelivery-primary-blue'],
    textDecorationLine: "underline",
  },
  editButton: {
    flex: 1,
    backgroundColor: colors['shelivery-button-secondary-bg'], // shelivery-button-secondary
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors['shelivery-button-secondary-border'],
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors['shelivery-button-secondary-text'],
  },
  deleteButton: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
    borderRadius: 8, // rounded-shelivery-sm
    alignItems: "center",
    backgroundColor: colors['shelivery-error-red-bg'], // hover:bg-red-50
  },
  deleteButtonText: {
    fontSize: 14, // text-sm
    color: colors['shelivery-error-red'],
  },
  compactView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8, // mt-2
  },
  compactStatusText: {
    fontSize: 12, // text-xs
    color: colors['shelivery-text-tertiary'],
  },
  compactViewButton: {
    // No specific styles for this button, just text
  },
  compactViewButtonText: {
    fontSize: 12, // text-xs
    color: colors['shelivery-primary-blue'],
    textDecorationLine: "underline",
  },
});
