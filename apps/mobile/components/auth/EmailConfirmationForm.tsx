import { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import AuthLayout from "./AuthLayout";
import { Button } from "../ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

interface EmailConfirmationFormProps {
  email: string;
  loading?: boolean;
  error?: string | undefined;
  message?: string | undefined;
  onResendClick: () => void;
  resendCountdown: number;
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
      gap: 24,
    },
    header: {
      alignItems: "center",
      gap: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors["shelivery-text-primary"],
    },
    text: {
      fontSize: 14,
      color: colors["shelivery-text-tertiary"],
      textAlign: "center",
    },
    bold: {
      fontWeight: "600",
      color: colors["shelivery-text-primary"],
    },
    error: {
      color: colors["shelivery-error-red"],
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
    },
    success: {
      color: colors["shelivery-success-green"],
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
    },
  });

export default function EmailConfirmationForm({
  email,
  loading = false,
  error,
  message,
  onResendClick,
  resendCountdown,
}: EmailConfirmationFormProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <AuthLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.text}>
            A confirmation link has been sent to{" "}
            <Text style={styles.bold}>{email}</Text>.
            Please click the link in your email to activate your account and log in.
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        {message && <Text style={styles.success}>{message}</Text>}

        <Button
          onPress={onResendClick}
          disabled={loading || resendCountdown > 0}
          loading={loading}
          size="lg"
        >
          {loading
            ? "Sending..."
            : resendCountdown > 0
              ? `Resend in ${resendCountdown}s`
              : "Resend Confirmation Email"}
        </Button>
      </View>
    </AuthLayout>
  );
}
