import React from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemeColors } from '@/lib/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderDetailsBasket {
  id: string;
  amount: number;
  link: string | null;
  note: string | null;
}

interface OrderDetailsMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  image: string | null;
  basket: OrderDetailsBasket | null;
}

interface OrderDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  member: OrderDetailsMember | null;
}

// ─── Styles factory ───────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: isDark ? colors['shelivery-card-background'] : '#ffffff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '80%', paddingHorizontal: 20, paddingBottom: 16,
  },
  dragHandle: {
    width: 40, height: 4,
    backgroundColor: isDark ? colors['shelivery-card-border'] : '#d1d5db',
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, borderBottomWidth: 1,
    borderBottomColor: colors['shelivery-card-border'], marginBottom: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors['shelivery-text-primary'] },
  headerSubtitle: { fontSize: 13, color: colors['shelivery-text-tertiary'], marginTop: 2 },
  closeButton: { padding: 6, marginLeft: 8 },
  scrollContent: { paddingBottom: 12 },
  section: { marginTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors['shelivery-text-primary'] },
  card: { borderRadius: 12, padding: 14, borderWidth: 1 },
  linkCard: {
    backgroundColor: isDark ? colors['shelivery-badge-blue-bg'] : '#eff6ff',
    borderColor: isDark ? colors['shelivery-badge-blue-border'] : '#bfdbfe',
    gap: 10,
  },
  linkText: {
    fontSize: 13, color: colors['shelivery-primary-blue'],
    textDecorationLine: 'underline', lineHeight: 18,
  },
  openLinkBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12,
    backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : '#dbeafe',
    borderRadius: 8,
  },
  openLinkBtnText: { fontSize: 13, fontWeight: '600', color: colors['shelivery-primary-blue'] },
  noteCard: {
    backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : '#f9fafb',
    borderColor: colors['shelivery-card-border'],
  },
  noteText: { fontSize: 13, color: colors['shelivery-text-secondary'], lineHeight: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 32, marginBottom: 10 },
  emptyText: { fontSize: 14, color: colors['shelivery-text-tertiary'] },
  footer: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors['shelivery-card-border'] },
  closeBtn: {
    backgroundColor: colors['shelivery-primary-blue'],
    paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  closeBtnText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
});

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderDetailsModal({ visible, onClose, member }: OrderDetailsModalProps) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  // NOTE: hooks must come before any conditional returns
  if (!member || !member.basket) return null;

  const fullName = [member.first_name, member.last_name].filter(Boolean).join(' ') || 'Unknown';

  const handleOpenLink = async (link: string) => {
    const url = link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Cannot open link', 'This link cannot be opened on your device.');
    } catch {
      Alert.alert('Error', 'Failed to open the link.');
    }
  };

  const hasDetails = !!(member.basket.link || member.basket.note);

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Avatar src={member.image} name={fullName} size="md" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{fullName + "'s Order"}</Text>
                <Text style={styles.headerSubtitle}>{member.basket.amount} CHF</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors['shelivery-text-secondary']} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {member.basket.link ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="link-outline" size={18} color={colors['shelivery-primary-blue']} />
                  <Text style={styles.sectionTitle}>Basket Link</Text>
                </View>
                <View style={[styles.card, styles.linkCard]}>
                  <Text style={styles.linkText} numberOfLines={3}>{member.basket.link}</Text>
                  <TouchableOpacity style={styles.openLinkBtn} onPress={() => handleOpenLink(member.basket!.link!)} activeOpacity={0.7}>
                    <Ionicons name="open-outline" size={15} color={colors['shelivery-primary-blue']} />
                    <Text style={styles.openLinkBtnText}>Open Link</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {member.basket.note ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text-outline" size={18} color={colors['shelivery-text-secondary']} />
                  <Text style={styles.sectionTitle}>Order Note</Text>
                </View>
                <View style={[styles.card, styles.noteCard]}>
                  <Text style={styles.noteText}>{member.basket.note}</Text>
                </View>
              </View>
            ) : null}

            {!hasDetails && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>No order details provided</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
