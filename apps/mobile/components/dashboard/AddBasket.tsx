import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "@/lib/theme";
import PlusCircleIcon from "../../public/icons/plus-circle-icon.svg";

interface AddBasketProps {
  onClick?: () => void;
  id?: string;
}

export default function AddBasket({ onClick, id }: AddBasketProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onClick}
      activeOpacity={0.9}
      accessibilityLabel="Start your shared delivery"
    >
      <View style={styles.content}>
        {/* Plus Icon */}
        <View style={styles.iconWrapper}>
          <PlusCircleIcon width={36} height={36} color={colors['shelivery-text-primary']} />
        </View>

        {/* Add Basket Text */}
        <Text style={styles.text}>
          Start your shared delivery
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 67,
    marginBottom: 18,
    backgroundColor: colors['shelivery-primary-yellow'],
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    color: colors['shelivery-text-primary'],
  },
});
