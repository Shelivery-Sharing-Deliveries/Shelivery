import { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import AuthButton from "./AuthButton";
import { getStoredInviteCode, clearStoredInviteCode } from "../../lib/invite-storage";
import { colors } from "@/lib/theme";

interface InviteCodeFormProps {
  onCodeSubmit: (code: string) => void;
  loading?: boolean;
  error?: string | undefined;
}

export default function InviteCodeForm({
  onCodeSubmit,
  loading = false,
  error,
}: InviteCodeFormProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const inviteMessageCode = "INNOSUISSE";
  const isPopupActive = true;

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
            Don't you have a code ? ask a friend to invite you
          </Text>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
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
    color: "#000000",
  },
  popup: {
    position: "relative",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#ffffff",
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
    color: "#6B7280",
  },
  popupContent: {
    gap: 8,
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  popupText: {
    fontSize: 12,
    color: "#6B7280",
  },
  form: {
    gap: 24,
  },
  error: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
  },
  helpTextContainer: {
    alignItems: "center",
  },
  helpText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000000",
  },
});
