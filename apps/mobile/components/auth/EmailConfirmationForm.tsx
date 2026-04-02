import { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import AuthLayout from "./AuthLayout";
import { Button } from "../ui/Button";

interface EmailConfirmationFormProps {
    email: string;
    loading?: boolean;
    error?: string | undefined;
    message?: string | undefined;
    onResendClick: () => void;
    resendCountdown: number;
}

export default function EmailConfirmationForm({
    email,
    loading = false,
    error,
    message,
    onResendClick,
    resendCountdown,
}: EmailConfirmationFormProps) {
    return (
        <AuthLayout>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Check Your Email</Text>
                    <Text style={styles.text}>
                        A confirmation link has been sent to <Text style={styles.bold}>{email}</Text>.
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

const styles = StyleSheet.create({
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
        color: "#000000",
    },
    text: {
        fontSize: 14,
        color: "#A4A7AE",
        textAlign: "center",
    },
    bold: {
        fontWeight: "600",
        color: "#1F2937",
    },
    error: {
        color: "#DC2626",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
    },
    success: {
        color: "#059669",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
    },
});
