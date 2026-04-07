import { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import AuthButton from "./AuthButton";
import { getStoredInviteCode, clearStoredInviteCode } from "../../lib/invite-storage";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

interface InviteCodeFormProps {
  onCodeSubmit: (code: string) => void;
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
    popup: {
      position: "relative",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors["shelivery-card-border"],
      backgroundColor: isDark ? colors["shelivery-card-background"] : "#ffffff",
      padding: 16,
    },
    closeButton: {
      position: "absolute",
      right: 12,
      top: 12,
    },
    closeButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors["shelivery-text-tertiary"],
    },
    popupContent: {
      gap: 8,
      alignItems: "center",
    },
    popupTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors["shelivery-text-primary"],
    },
    popupText: {
      fontSize: 12,
      color: colors["shelivery-text-tertiary"],
    },
    form: {
      gap: 24,
    },
    error: {
      color: colors["shelivery-error-red"],
      fontSize: 14,
      fontWeight: "500",
    },
    helpTextContainer: {
      alignItems: "center",
    },
    helpText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors["shelivery-text-secondary"],
    },
  });

export default function InviteCodeForm({
  onCodeSubmit,
  loading = false,
  error,
}: InviteCodeFormProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const inviteMessageCode = "INNOSUISSE";
  const isPopupActive = true;

  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  // Auto-populate invite code from localStorage on component mount
  useEffect(() => {
    const storedCode = getStoredInviteCode();
    if (storedCode) {
      setInviteCode(storedCode);
    }
  }, []);

  const handleSubmit = () => {
    if (inviteCode.trim()) {
      clearStoredInviteCode();
      onCodeSubmit(inviteCode);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Get an invite code ?</Text>
        </View>

        {isPopupOpen && isPopupActive && (
          <View style={styles.popup}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsPopupOpen(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.popupContent}>
              <Text style={styles.popupTitle}>
                You can use this invitation code {'"' + inviteMessageCode + '"'}
              </Text>
              <Text style={styles.popupText}>
                For the first trial, you can use the code above to explore the app.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.form}>
          <TextField
            label="Code"
            placeholder="Enter your invite code"
            value={inviteCode}
            onChange={setInviteCode}
            type="text"
            required
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <AuthButton onPress={handleSubmit} loading={loading}>
            Continue
          </AuthButton>
        </View>

        <View style={styles.helpTextContainer}>
          <Text style={styles.helpText}>
            {"Don't you have a code ? ask a friend to invite you"}
          </Text>
        </View>
      </View>
    </AuthLayout>
  );
}
