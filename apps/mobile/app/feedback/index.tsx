import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout, Button, IconSymbol } from "@/components/ui";
import { ChevronDown, Check, AlertCircle } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

// Easily editable dropdown options
const feedbackOptions = ["General", "Add a Store", "Dormitory Change", "Report a bug"];

const feedbackPlaceholders = [
  "Write your general feedback here...",
  "Suggest a store you'd like us to add. Please include the store name, link, and any other relevant details.",
  "Explain the dormitory change request here...",
  "Describe the bug you encountered, including steps to reproduce it and any relevant information.",
];

// ─── Styles factory ───────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  headerContent: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: colors['shelivery-text-primary'] },
  scrollContainer: { flexGrow: 1, paddingVertical: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "bold", color: colors['shelivery-text-primary'], textAlign: "center", marginBottom: 12 },
  subtitle: { fontSize: 14, color: colors['shelivery-text-tertiary'], textAlign: "center", marginBottom: 32, lineHeight: 22 },
  form: { gap: 20 },
  label: { fontSize: 13, fontWeight: "500", color: colors['shelivery-text-secondary'], marginBottom: 8 },

  // Dropdown
  dropdownTrigger: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: isDark ? colors['shelivery-card-background'] : "#fff",
    borderWidth: 1, borderColor: colors['shelivery-card-border'],
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 2, elevation: isDark ? 0 : 1,
  },
  dropdownTriggerOpen: {
    borderColor: colors['shelivery-primary-blue'],
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
  },
  dropdownTriggerText: { flex: 1, fontSize: 16, color: colors['shelivery-text-primary'] },
  dropdownMenu: {
    backgroundColor: isDark ? colors['shelivery-card-background'] : "#fff",
    borderWidth: 1, borderTopWidth: 0,
    borderColor: colors['shelivery-primary-blue'],
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0 : 0.1, shadowRadius: 6, elevation: isDark ? 0 : 4,
  },
  dropdownItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: colors['shelivery-card-border'],
  },
  dropdownItemText: { fontSize: 15, color: colors['shelivery-text-secondary'] },
  dropdownItemTextSelected: { color: colors['shelivery-primary-blue'], fontWeight: "600" },

  // Textarea
  textarea: {
    borderWidth: 1, borderColor: colors['shelivery-card-border'],
    borderRadius: 12, padding: 16, fontSize: 15,
    color: colors['shelivery-text-primary'], minHeight: 140,
    backgroundColor: isDark ? colors['shelivery-card-background'] : "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 2, elevation: isDark ? 0 : 1,
  },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: colors['shelivery-text-tertiary'], fontSize: 14 },
  errorContainer: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: isDark ? colors['shelivery-badge-red-bg'] : "#FEF2F2",
    padding: 16, borderRadius: 12, marginTop: 24, gap: 8,
  },
  errorText: { color: "#EF4444", fontSize: 14 },
  messageContainer: { padding: 16, borderRadius: 12 },
  successMessage: { backgroundColor: isDark ? colors['shelivery-badge-green-bg'] : "#F0FDF4" },
  errorMessage: { backgroundColor: isDark ? colors['shelivery-badge-red-bg'] : "#FEF2F2" },
  messageText: { fontSize: 14, textAlign: "center", fontWeight: "500" },
  successText: { color: isDark ? colors['shelivery-badge-green-text'] : "#15803D" },
  errorMessageText: { color: "#EF4444" },
});

// ─── FeedbackPage ─────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const headerContent = (
    <View style={styles.headerContent}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <IconSymbol name="arrow.left" size={20} color={colors['shelivery-text-primary']} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Feedback form</Text>
    </View>
  );

  if (authLoading) {
    return (
      <PageLayout header={headerContent}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors['shelivery-primary-blue']} />
          <Text style={styles.loadingText}>Loading user session...</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout header={headerContent} showNavigation={false}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Submit Your Feedback</Text>
        <Text style={styles.subtitle}>
          {"We'd love to hear from you. Please select a feedback type and share your request, suggestion, or comments with us."}
        </Text>
        <FeedbackForm />
      </ScrollView>
    </PageLayout>
  );
}

// ─── FeedbackForm ─────────────────────────────────────────────────────────────

function FeedbackForm() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [feedbackType, setFeedbackType] = useState<string>(feedbackOptions[feedbackOptions.length - 1]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) { setSubmitMessage("You must be logged in to submit feedback."); return; }
    if (!message.trim()) { setSubmitMessage("Please enter your message."); return; }

    setIsLoading(true);
    setSubmitMessage("");
    try {
      const { error } = await supabase
        .from("user_feedback")
        .insert([{ user_id: user.id, event_type: feedbackType, description: message }]);

      if (error) {
        console.error("Supabase Error:", error);
        setSubmitMessage("There was an error submitting your feedback. Please try again.");
        return;
      }
      setSubmitMessage("Thank you for your message! We have received your ticket and will get back to you shortly.");
      setFeedbackType(feedbackOptions[feedbackOptions.length - 1]);
      setMessage("");
    } catch (error) {
      console.error("Submission Error:", error);
      setSubmitMessage("There was a problem processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={20} color="#EF4444" />
        <Text style={styles.errorText}>You must be logged in to submit feedback.</Text>
      </View>
    );
  }

  return (
    <View style={styles.form}>
      {/* Feedback Type Dropdown */}
      <View>
        <Text style={styles.label}>Feedback Type</Text>
        <TouchableOpacity
          style={[styles.dropdownTrigger, dropdownOpen && styles.dropdownTriggerOpen]}
          onPress={() => setDropdownOpen(!dropdownOpen)}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownTriggerText}>{feedbackType}</Text>
          <ChevronDown
            size={20}
            color={colors['shelivery-text-tertiary']}
            style={{ transform: [{ rotate: dropdownOpen ? "180deg" : "0deg" }] }}
          />
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {feedbackOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownItem}
                onPress={() => { setFeedbackType(option); setDropdownOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownItemText, feedbackType === option && styles.dropdownItemTextSelected]}>
                  {option}
                </Text>
                {feedbackType === option && <Check size={16} color={colors['shelivery-primary-blue']} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Message Input */}
      <View>
        <Text style={styles.label}>Your Message</Text>
        <TextInput
          style={styles.textarea}
          multiline
          numberOfLines={6}
          value={message}
          onChangeText={setMessage}
          placeholder={feedbackPlaceholders[feedbackOptions.indexOf(feedbackType)] || feedbackPlaceholders[0]}
          placeholderTextColor={colors['shelivery-text-tertiary']}
          editable={!isLoading}
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <Button variant="primary" size="lg" loading={isLoading} disabled={isLoading || !user} onPress={handleSubmit}>
        Submit Feedback
      </Button>

      {/* Status Message */}
      {submitMessage ? (
        <View style={[styles.messageContainer, submitMessage.includes("Thank you") ? styles.successMessage : styles.errorMessage]}>
          <Text style={[styles.messageText, submitMessage.includes("Thank you") ? styles.successText : styles.errorMessageText]}>
            {submitMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
