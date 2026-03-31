import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { mergeStyles } from "@/lib/utils";
import { colors, spacing, borderRadius, fontSizes, fontWeights } from "@/lib/theme";

interface ButtonProps {
  variant?: "primary" | "secondary" | "error" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  children,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors["shelivery-primary-yellow"],
          borderWidth: 0,
        };
      case "secondary":
        return {
          backgroundColor: colors["shelivery-button-secondary-bg"],
          borderWidth: 1,
          borderColor: colors["shelivery-button-secondary-border"],
        };
      case "error":
        return {
          backgroundColor: colors["shelivery-error-red"],
          borderWidth: 0,
        };
      case "success":
        return {
          backgroundColor: colors["shelivery-success-green"],
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: colors["shelivery-primary-yellow"],
          borderWidth: 0,
        };
    }
  };

  const getSizeStyles = (): { padding: ViewStyle["padding"]; fontSize: number } => {
    switch (size) {
      case "sm":
        return {
          padding: spacing["shelivery-4"],
          fontSize: fontSizes.sm,
        };
      case "md":
        return {
          padding: spacing["shelivery-6"],
          fontSize: fontSizes.base,
        };
      case "lg":
        return {
          padding: spacing["shelivery-8"],
          fontSize: fontSizes.lg,
        };
      default:
        return {
          padding: spacing["shelivery-6"],
          fontSize: fontSizes.base,
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case "primary":
        return colors["shelivery-text-primary"];
      case "secondary":
        return colors["shelivery-text-primary"];
      case "error":
        return colors.white;
      case "success":
        return colors.white;
      default:
        return colors["shelivery-text-primary"];
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textColor = getTextColor();

  const buttonStyles: ViewStyle = mergeStyles(
    styles.buttonBase,
    {
      borderRadius: borderRadius["shelivery-md"],
      paddingHorizontal: typeof sizeStyles.padding === "number" ? sizeStyles.padding : 0,
      paddingVertical: typeof sizeStyles.padding === "number" ? sizeStyles.padding / 2 : 0,
    },
    variantStyles,
    disabled && styles.disabled,
    style
  );

  const textStyles: TextStyle = mergeStyles(
    styles.textBase,
    {
      fontSize: sizeStyles.fontSize,
      color: textColor,
    },
    textStyle
  );

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={styles.loadingIndicator}
        />
      )}
      <Text style={textStyles}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: fontWeights.semibold,
  },
  textBase: {
    fontWeight: fontWeights.semibold,
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  loadingIndicator: {
    marginRight: spacing["shelivery-2"],
  },
});

export { Button };