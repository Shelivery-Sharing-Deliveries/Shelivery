import { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import { Button } from "../ui/Button";

interface LoginFormProps {
  onEmailSubmit: (email: string) => void;
  loading?: boolean;
  error?: string | undefined;
}

export default function LoginForm({
  onEmailSubmit,
  loading = false,
  error,
}: LoginFormProps) {
  const [email, setEmail] = useState("");

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
  form: {
    gap: 24,
  },
  error: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
  },
});
