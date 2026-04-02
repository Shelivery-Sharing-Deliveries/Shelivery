import { ReactNode } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "@/lib/theme";

interface AuthButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "google";
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export default function AuthButton({
  children,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: AuthButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        variant === "google" ? styles.google : styles.primary,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "google" ? "#000000" : "#000000"} />
      ) : (
        <Text style={[styles.text, variant === "google" && styles.googleText]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: colors['shelivery-primary-yellow'] || "#FFDB0D",
  },
  google: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E9EAEB",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  googleText: {
    color: "#000000",
  },
});
