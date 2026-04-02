import { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import AuthLayout from "./AuthLayout";
import TextField from "./TextField";
import { Button } from "../ui/Button";

interface SetPasswordFormProps {
    email: string;
    onPasswordSubmit: (password: string) => void;
    loading?: boolean;
    error?: string | undefined;
}

export default function SetPasswordForm({
    email,
    onPasswordSubmit,
    loading = false,
    error,
}: SetPasswordFormProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const handleSubmit = () => {
        setPasswordError(null);

        if (!password.trim()) {
            setPasswordError("Password cannot be empty.");
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters long.");
            return;
        }

        onPasswordSubmit(password);
    };

    return (
        <AuthLayout>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Set Your Password</Text>
                    <Text style={styles.email}>{email}</Text>
                </View>

                <View style={styles.form}>
                    <TextField
                        label="New Password"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={setPassword}
                        type="password"
                        required
                    />

                    <TextField
                        label="Confirm Password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        type="password"
                        required
                    />

                    {(error || passwordError) && (
                        <Text style={styles.error}>{error || passwordError}</Text>
                    )}

                    <Button onPress={handleSubmit} loading={loading} size="lg">
                        Set Password
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
    email: {
        fontSize: 14,
        color: "#A4A7AE",
        marginTop: 8,
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
