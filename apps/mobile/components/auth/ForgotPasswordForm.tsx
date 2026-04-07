import { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import { Button } from "../ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

interface ForgotPasswordFormProps {
  initialEmail?: string;
  onSubmit: (email: string) => void;
  onBackToLogin: () => void;
  loading?: boolean;
  error?: string | undefined;
  successMessage?: string | null;
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
      gap: 32,
    },
    header: {
      alignItems: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors["shelivery-text-primary"],
    },
    subtitle: {
      fontSize: 14,
      color: colors["shelivery-text-tertiary"],
      marginTop: 8,
      textAlign: "center",
    },
    form: {
      gap: 24,
    },
    error: {
      color: colors["shelivery-error-red"],
      fontSize: 14,
      fontWeight: "500",
    },
    success: {
      color: colors["shelivery-success-green"],
      fontSize: 14,
      fontWeight: "500",
    },
  });

export default function ForgotPasswordForm({
  initialEmail = "",
  onSubmit,
  onBackToLogin,
  loading = false,
  error,
  successMessage,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleSubmit = () => {
    if (email.trim()) {
      onSubmit(email);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive a password reset link.
          </Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChange={setEmail}
            type="email"
            required
          />

          {error && <Text style={styles.error}>{error}</Text>}
          {successMessage && <Text style={styles.success}>{successMessage}</Text>}

          <Button onPress={handleSubmit} loading={loading} size="lg">
            Send Reset Link
          </Button>

          <Button variant="secondary" onPress={onBackToLogin} size="lg">
            Back to login
          </Button>
        </View>
      </View>
    </AuthLayout>
  );
}
