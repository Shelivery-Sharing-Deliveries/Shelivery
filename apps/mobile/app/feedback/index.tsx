import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout, Button, IconSymbol } from "@/components/ui";
import { ChevronDown, Send, AlertCircle, Check } from "lucide-react-native";

// Easily editable dropdown options
const feedbackOptions = ["General", "Add a Store", "Dormitory Change", "Report a bug"];

// Easily editable placeholders matching the dropdown options above
const feedbackPlaceholders = [
  "Write your general feedback here...",
  "Suggest a store you'd like us to add. Please include the store name, link, and any other relevant details.",
  "Explain the dormitory change request here...",
  "Describe the bug you encountered, including steps to reproduce it and any relevant information.",
];

export default function FeedbackPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  const headerContent = (
    <View style={styles.headerContent}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <IconSymbol name="arrow.left" size={20} color="#111827" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Feedback form</Text>
    </View>
  );

  if (authLoading) {
    return (
      <PageLayout header={headerContent}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#245B7B" />
          <Text style={styles.loadingText}>Loading user session...</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout header={headerContent} showNavigation={false}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Submit Your Feedback</Text>
        <Text style={styles.subtitle}>
          {"We'd love to hear from you. Please select a feedback type and share your request, suggestion, or comments with us."}
        </Text>
        <FeedbackForm />
      </ScrollView>
    </PageLayout>
  );
}

function FeedbackForm() {
  const { user } = useAuth();

  const [feedbackType, setFeedbackType] = useState<string>(feedbackOptions[feedbackOptions.length - 1]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      setSubmitMessage("You must be logged in to submit feedback.");
      return;
    }

    if (!message.trim()) {
      setSubmitMessage("Please enter your message.");
      return;
    }

    setIsLoading(true);
    setSubmitMessage("");

    try {
      const { error } = await supabase
        .from("user_feedback")
        .insert([
          {
            user_id: user.id,
            event_type: feedbackType,
            description: message,
          },
        ]);

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
            color="#6B7280"
            style={{ transform: [{ rotate: dropdownOpen ? "180deg" : "0deg" }] }}
          />
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {feedbackOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownItem}
                onPress={() => {
                  setFeedbackType(option);
                  setDropdownOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dropdownItemText,
                  feedbackType === option && styles.dropdownItemTextSelected
                ]}>
                  {option}
                </Text>
                {feedbackType === option && (
                  <Check size={16} color="#245B7B" />
                )}
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
          placeholderTextColor="#9CA3AF"
          editable={!isLoading}
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <Button
        variant="primary"
        size="lg"
        loading={isLoading}
        disabled={isLoading || !user}
        onPress={handleSubmit}
      >
        Submit Feedback
      </Button>

      {/* Status Message */}
      {submitMessage ? (
        <View style={[
          styles.messageContainer,
          submitMessage.includes("Thank you") ? styles.successMessage : styles.errorMessage
        ]}>
          <Text style={[
            styles.messageText,
            submitMessage.includes("Thank you") ? styles.successText : styles.errorMessageText
          ]}>
            {submitMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },

  // Dropdown
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownTriggerOpen: {
    borderColor: "#245B7B",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownTriggerText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#245B7B",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#374151",
  },
  dropdownItemTextSelected: {
    color: "#245B7B",
    fontWeight: "600",
  },

  // Textarea
  textarea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#111827",
    minHeight: 140,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
  },
  messageContainer: {
    padding: 16,
    borderRadius: 12,
  },
  successMessage: {
    backgroundColor: "#F0FDF4",
  },
  errorMessage: {
    backgroundColor: "#FEF2F2",
  },
  messageText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  successText: {
    color: "#15803D",
  },
  errorMessageText: {
    color: "#EF4444",
  },
});
