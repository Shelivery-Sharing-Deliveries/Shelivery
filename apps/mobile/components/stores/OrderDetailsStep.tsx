import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from "react-native";
import { useState } from "react";
import React from "react";
import { Shop, LocationData } from "../../types/stores/types";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

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

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : '#FFFFFF',
    borderRadius: 20, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: colors['shelivery-card-border'],
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  headerTitle: { color: colors['shelivery-text-primary'], fontSize: 18, fontWeight: '600', flex: 1 },
  infoButton: { padding: 4, marginLeft: 8 },
  summaryContainer: {
    backgroundColor: isDark ? colors['shelivery-card-background'] : '#F9FAFB',
    borderRadius: 8, padding: 12, marginBottom: 16, gap: 6,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  summaryLabel: { fontSize: 13, color: colors['shelivery-text-secondary'], flexShrink: 0 },
  summaryValue: { fontSize: 13, fontWeight: '600', color: colors['shelivery-text-primary'], textAlign: 'right' },
  summaryLocationDetails: {
    paddingTop: 8, borderTopWidth: 1, borderTopColor: colors['shelivery-card-border'],
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2,
  },
  summaryLocationText: { fontSize: 11, color: colors['shelivery-text-tertiary'] },
  formContainer: { maxHeight: 340 },
  formGroup: { gap: 6, marginBottom: 12 },
  formLabel: { fontSize: 13, fontWeight: '600', color: colors['shelivery-text-secondary'] },
  textInput: {
    borderWidth: 1, borderColor: colors['shelivery-card-border'], borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
    color: colors['shelivery-text-primary'],
    backgroundColor: isDark ? colors['shelivery-card-background'] : '#FFFFFF',
  },
  textArea: { minHeight: 100 },
  orSeparator: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4, marginBottom: 12 },
  separatorLine: { flex: 1, height: 1, backgroundColor: colors['shelivery-card-border'] },
  separatorText: { fontSize: 11, color: colors['shelivery-text-tertiary'], fontWeight: '600' },
  errorContainer: {
    backgroundColor: isDark ? colors['shelivery-error-red-bg'] : '#FEF3F2',
    borderColor: colors['shelivery-error-red'], borderWidth: 1,
    padding: 10, borderRadius: 8, marginTop: 12,
  },
  errorText: { fontSize: 13, color: colors['shelivery-error-red'] },
  buttonContainer: { flexDirection: 'row', marginTop: 20, gap: 12 },
  backButton: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderRadius: 8, borderWidth: 1,
    borderColor: colors['shelivery-card-border'],
  },
  backButtonText: { fontWeight: '600', color: colors['shelivery-text-secondary'], fontSize: 15 },
  continueButton: {
    flex: 1, backgroundColor: colors['shelivery-primary-yellow'],
    paddingVertical: 13, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  continueButtonText: { fontWeight: '600', color: '#111827', fontSize: 15 },
  disabledButton: { opacity: 0.5 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  infoModalCard: {
    backgroundColor: isDark ? colors['shelivery-card-background'] : '#FFFFFF',
    borderRadius: 16, padding: 20, width: '100%', maxWidth: 340, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  infoModalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoModalTitle: { fontSize: 16, fontWeight: '700', color: colors['shelivery-text-primary'], flex: 1 },
  infoModalText: { fontSize: 14, color: colors['shelivery-text-secondary'], lineHeight: 20 },
});

export function OrderDetailsStep({
  selectedShop, userLocation, basketLink, basketNote, basketAmount,
  canSubmit, submitting, error, onLinkChange, onNoteChange, onAmountChange, onSubmit, onBack,
}: Props) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Step 3: Enter Order Details</Text>
        <TouchableOpacity style={styles.infoButton} onPress={() => setShowInfoModal(true)}>
          <Ionicons name="information-circle-outline" size={24} color={colors['shelivery-text-secondary']} />
        </TouchableOpacity>
      </View>

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
          <Ionicons name="location-sharp" size={12} color={colors['shelivery-text-tertiary']} />
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
            placeholderTextColor={colors['shelivery-text-tertiary']}
            value={basketLink} onChangeText={onLinkChange}
            keyboardType="url" autoCapitalize="none"
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
            placeholderTextColor={colors['shelivery-text-tertiary']}
            value={basketNote} onChangeText={onNoteChange}
            multiline style={[styles.textInput, styles.textArea]} textAlignVertical="top"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Total Amount (CHF) *</Text>
          <TextInput
            placeholder="e.g., 25.50"
            placeholderTextColor={colors['shelivery-text-tertiary']}
            value={basketAmount} onChangeText={onAmountChange}
            keyboardType="decimal-pad" style={styles.textInput}
          />
        </View>
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, (!canSubmit || submitting) && styles.disabledButton]}
          onPress={onSubmit} disabled={!canSubmit || submitting}
        >
          <Text style={styles.continueButtonText}>{submitting ? "Finding Pools..." : "Continue"}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showInfoModal} transparent animationType="fade" onRequestClose={() => setShowInfoModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowInfoModal(false)}>
          <View style={styles.infoModalCard}>
            <View style={styles.infoModalHeader}>
              <Ionicons name="information-circle" size={22} color={colors['shelivery-text-secondary']} />
              <Text style={styles.infoModalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setShowInfoModal(false)}>
                <Ionicons name="close" size={20} color={colors['shelivery-text-tertiary']} />
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
