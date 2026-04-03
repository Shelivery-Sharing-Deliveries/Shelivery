import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import { Button } from "../ui/Button";

interface ForgotPasswordFormProps {
  initialEmail?: string;
  onSubmit: (email: string) => void;
  onBackToLogin: () => void;
  loading?: boolean;
  error?: string | undefined;
}

export default function ForgotPasswordForm({
  initialEmail = "",
  onSubmit,
  onBackToLogin,
  loading = false,
  error,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);

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
          <Text style={styles.subtitle}>Enter your email to receive a password reset link.</Text>
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
  subtitle: {
    fontSize: 14,
    color: "#A4A7AE",
    marginTop: 8,
    textAlign: "center",
  },
  form: {
    gap: 24,
  },
  error: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
  },
});
