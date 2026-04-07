import { ReactNode, useMemo } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

interface AuthButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "google";
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    base: {
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      paddingHorizontal: 16,
    },
    primary: {
      backgroundColor: colors["shelivery-primary-yellow"],
    },
    google: {
      backgroundColor: isDark ? colors["shelivery-button-secondary-bg"] : colors.white,
      borderWidth: 1,
      borderColor: colors["shelivery-card-border"],
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.black,
    },
    googleText: {
      color: colors.black,
    },
  });

export default function AuthButton({
  children,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: AuthButtonProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

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
        <ActivityIndicator color={colors.black} />
      ) : (
        <Text style={[styles.text, variant === "google" && styles.googleText]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
