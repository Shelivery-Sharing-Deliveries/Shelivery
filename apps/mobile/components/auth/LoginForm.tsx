import { useState, useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import { Button } from "../ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

interface LoginFormProps {
  onEmailSubmit: (email: string) => void;
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
    form: {
      gap: 24,
    },
    error: {
      color: colors["shelivery-error-red"],
      fontSize: 14,
      fontWeight: "500",
    },
  });

export default function LoginForm({
  onEmailSubmit,
  loading = false,
  error,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleSubmit = () => {
    if (email.trim()) {
      onEmailSubmit(email);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Shelivery</Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="Email Address"
            placeholder="Enter your Email Address"
            value={email}
            onChange={setEmail}
            type="email"
            required
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button onPress={handleSubmit} loading={loading} size="lg">
            Continue
          </Button>
        </View>
      </View>
    </AuthLayout>
  );
}
