import { useState, useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import { Button } from "../ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

interface OTPVerificationFormProps {
  email: string;
  onCodeSubmit: (code: string) => void;
  onResendCode: () => void;
  loading?: boolean;
  error?: string | undefined;
  resendCountdown?: number;
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
      gap: 32,
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
    form: {
      gap: 24,
    },
    error: {
      color: colors["shelivery-error-red"],
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
    },
    resendContainer: {
      alignItems: "center",
    },
    resendText: {
      fontSize: 14,
      color: colors["shelivery-text-tertiary"],
    },
    resendLink: {
      fontSize: 14,
      fontWeight: "600",
      color: colors["shelivery-primary-blue"],
      textDecorationLine: "underline",
    },
  });

export default function OTPVerificationForm({
  email,
  onCodeSubmit,
  onResendCode,
  loading = false,
  error,
  resendCountdown = 0,
}: OTPVerificationFormProps) {
  const [code, setCode] = useState("");
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleSubmit = () => {
    if (code.trim()) {
      onCodeSubmit(code);
    }
  };

  const formatEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (!local || !domain || local.length <= 4) return email;
    const masked = local.substring(0, 4) + "*".repeat(Math.max(0, local.length - 4));
    return `${masked}@${domain}`;
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.text}>
            Enter the code we sent to {formatEmail(email)}
          </Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="Code"
            placeholder="_ _ _ _ _"
            value={code}
            onChange={setCode}
            type="text"
            required
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button onPress={handleSubmit} loading={loading} size="lg">
            Submit
          </Button>

          <View style={styles.resendContainer}>
            {resendCountdown > 0 ? (
              <Text style={styles.resendText}>Resend in {resendCountdown}s</Text>
            ) : (
              <Text style={styles.resendLink} onPress={onResendCode}>
                Resend it
              </Text>
            )}
          </View>
        </View>
      </View>
    </AuthLayout>
  );
}
