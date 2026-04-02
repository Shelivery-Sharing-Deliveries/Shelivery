import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
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

  const [showInfoPopover, setShowInfoPopover] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Step 3: Enter Order Details
        </Text>
        
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowInfoPopover(!showInfoPopover)}
        >
          <Ionicons name="information-circle-outline" size={24} color="black" />
        </TouchableOpacity>

        {showInfoPopover && (
          <View style={styles.infoPopover}>
            <Text style={styles.infoPopoverTitle}>Provide order details:</Text>
            <Text style={styles.infoPopoverText}>
              You can use a basket link, write a note, or use both to describe your order.
            </Text>
          </View>
        )}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shop:</Text>
          <Text style={styles.summaryValue}>{selectedShop.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location:</Text>
          <Text style={styles.summaryValue}>
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

      <ScrollView style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Basket Link (URL)</Text>
          <TextInput
            placeholder="e.g., https://shop.com/my-order"
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
            value={basketNote}
            onChangeText={onNoteChange}
            multiline
            style={[styles.textInput, styles.textArea, { minHeight: 100 }]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Total Amount (CHF) *</Text>
          <TextInput
            placeholder="e.g., 25.50"
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
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, (!canSubmit || submitting) && styles.disabledButton]}
          onPress={onSubmit}
          disabled={!canSubmit || submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Finding Pools..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFADF",
    borderRadius: 12,
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
    color: "#1A1A1A",
    fontSize: 24,
    fontWeight: "600",
  },
  infoButton: {
    padding: 4,
  },
  infoPopover: {
    position: "absolute",
    top: 40, // Adjust as needed
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    width: 280,
    borderWidth: 1,
    borderColor: "#E5E8EB",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoPopoverTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoPopoverText: {
    fontSize: 14,
    color: "#374151",
  },
  summaryContainer: {
    backgroundColor: "#EAE4E4",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#374151",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "right",
    flex: 1,
  },
  summaryLocationDetails: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E8EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryLocationText: {
    fontSize: 10,
    color: "#6B7280",
  },
  formContainer: {
    gap: 16,
  },
  formGroup: {
    gap: 4,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E8EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1A1A1A",
    backgroundColor: "white",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  orSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E8EB",
  },
  separatorText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FEF3F2",
    borderColor: "#FF3B30",
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  backButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E8EB",
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#FFDB0D",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: "600",
    color: "black",
    fontSize: 16,
  },
});
