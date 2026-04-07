import { useState, useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import { Button } from "../ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

interface PasswordFormProps {
  email: string;
  onPasswordSubmit: (password: string) => void;
  onBackToEmail: () => void;
  onForgotPasswordClick: () => void;
  loading?: boolean;
  error?: string | undefined;
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
    email: {
      fontSize: 14,
      color: colors["shelivery-text-tertiary"],
      marginTop: 8,
    },
    form: {
      gap: 24,
    },
    error: {
      color: colors["shelivery-error-red"],
      fontSize: 14,
      fontWeight: "500",
    },
    forgot: {
      textAlign: "center",
      fontSize: 14,
      color: colors["shelivery-text-tertiary"],
    },
  });

export default function PasswordForm({
  email,
  onPasswordSubmit,
  onBackToEmail,
  onForgotPasswordClick,
  loading = false,
  error,
}: PasswordFormProps) {
  const [password, setPassword] = useState("");
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleSubmit = () => {
    if (password.trim()) {
      onPasswordSubmit(password);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter Your Password</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            type="password"
            required
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button onPress={handleSubmit} loading={loading} size="lg">
            Sign In
          </Button>

          <Button variant="secondary" onPress={onBackToEmail} size="lg">
            Use different email
          </Button>

          <Text style={styles.forgot} onPress={onForgotPasswordClick}>
            Forgot your password?
          </Text>
        </View>
      </View>
    </AuthLayout>
  );
}
