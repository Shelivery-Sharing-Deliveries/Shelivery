import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from "react-native";
import { useState } from "react";
import { Shop, LocationData } from "../../types/stores/types";
import { Ionicons } from '@expo/vector-icons';

interface Props {
  selectedShop: Shop;
  userLocation: LocationData;
  basketLink: string;
  basketNote: string;
  basketAmount: string;
  canSubmit: boolean;
  submitting: boolean;
  error: string | null;
  onLinkChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function OrderDetailsStep({
  selectedShop, userLocation, basketLink, basketNote, basketAmount,
  canSubmit, submitting, error, onLinkChange, onNoteChange, onAmountChange, onSubmit, onBack,
}: Props) {

  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Step 3: Enter Order Details
        </Text>

        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowInfoModal(true)}
        >
          <Ionicons name="information-circle-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shop:</Text>
          <Text style={styles.summaryValue}>{selectedShop.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location:</Text>
          <Text style={[styles.summaryValue, { flex: 1 }]} numberOfLines={2}>
            {userLocation.placeName || userLocation.address}
          </Text>
        </View>
        <View style={styles.summaryLocationDetails}>
          <Ionicons name="location-sharp" size={12} color="#6B7280" />
          <Text style={styles.summaryLocationText}>
            {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Basket Link (URL)</Text>
          <TextInput
            placeholder="e.g., https://shop.com/my-order"
            placeholderTextColor="#9CA3AF"
            value={basketLink}
            onChangeText={onLinkChange}
            keyboardType="url"
            autoCapitalize="none"
            style={styles.textInput}
          />
        </View>

        <View style={styles.orSeparator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>OR</Text>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Order Note</Text>
          <TextInput
            placeholder="Describe what you want to order..."
            placeholderTextColor="#9CA3AF"
            value={basketNote}
            onChangeText={onNoteChange}
            multiline
            style={[styles.textInput, styles.textArea]}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Total Amount (CHF) *</Text>
          <TextInput
            placeholder="e.g., 25.50"
            placeholderTextColor="#9CA3AF"
            value={basketAmount}
            onChangeText={onAmountChange}
            keyboardType="decimal-pad"
            style={styles.textInput}
          />
        </View>
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, (!canSubmit || submitting) && styles.disabledButton]}
          onPress={onSubmit}
          disabled={!canSubmit || submitting}
        >
          <Text style={styles.continueButtonText}>
            {submitting ? "Finding Pools..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Modal — renders above all layers */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInfoModal(false)}
        >
          <View style={styles.infoModalCard}>
            <View style={styles.infoModalHeader}>
              <Ionicons name="information-circle" size={22} color="#374151" />
              <Text style={styles.infoModalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setShowInfoModal(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.infoModalText}>
              You can use a basket link, write a note, or use both to describe your order.
              The total amount is required so the pool can track progress toward the minimum order.
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E8EB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  infoButton: {
    padding: 4,
    marginLeft: 8,
  },
  summaryContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#374151",
    flexShrink: 0,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  summaryLocationDetails: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E8EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  summaryLocationText: {
    fontSize: 11,
    color: "#6B7280",
  },
  formContainer: {
    maxHeight: 340,
  },
  formGroup: {
    gap: 6,
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E8EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 100,
  },
  orSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
    marginBottom: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E8EB",
  },
  separatorText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FEF3F2",
    borderColor: "#FF3B30",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#F04438",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E8EB",
  },
  backButtonText: {
    fontWeight: "600",
    color: "#374151",
    fontSize: 15,
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#FFDB0D",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Info Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  infoModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 340,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  infoModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  infoModalText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});
