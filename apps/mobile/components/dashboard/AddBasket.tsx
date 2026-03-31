import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "@/lib/theme";

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
          <Image
            source={require("../../public/icons/plus-circle-icon.svg")}
            alt="Add"
            style={styles.icon}
          />
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
    height: 67, // h-[67px]
    marginBottom: 18, // mb-[18px]
    backgroundColor: colors['shelivery-primary-yellow'], // bg-[#FFDB0D]
    borderRadius: 18, // rounded-[18px]
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16, // px-4
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // gap-3 (adjusted for better visual balance in RN)
  },
  iconWrapper: {
    width: 48, // w-12 (adjusted from 36 for better touch target)
    height: 48, // h-12 (adjusted from 36 for better touch target)
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 36, // Original icon size
    height: 36, // Original icon size
    tintColor: colors['shelivery-text-primary'], // text-[#181D27] - apply tintColor for SVG-like behavior
  },
  text: {
    fontSize: 16, // text-[16px]
    fontWeight: "700", // font-bold
    lineHeight: 24, // leading-[24px]
    color: colors['shelivery-text-primary'], // text-[#111827]
  },
});
