import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';

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

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderDetailsModal({ visible, onClose, member }: OrderDetailsModalProps) {
  if (!member || !member.basket) return null;

  const fullName =
    [member.first_name, member.last_name].filter(Boolean).join(' ') || 'Unknown';

  const handleOpenLink = async (link: string) => {
    const url =
      link.startsWith('http://') || link.startsWith('https://')
        ? link
        : `https://${link}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot open link', 'This link cannot be opened on your device.');
      }
    } catch {
      Alert.alert('Error', 'Failed to open the link.');
    }
  };

  const hasDetails = !!(member.basket.link || member.basket.note);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          {/* ── Drag handle ── */}
          <View style={styles.dragHandle} />

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Avatar src={member.image} name={fullName} size="md" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{fullName + "'s Order"}</Text>
                <Text style={styles.headerSubtitle}>{member.basket.amount} CHF</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* ── Content ── */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Basket Link */}
            {member.basket.link ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="link-outline" size={18} color="#2563eb" />
                  <Text style={styles.sectionTitle}>Basket Link</Text>
                </View>
                <View style={[styles.card, styles.linkCard]}>
                  <Text style={styles.linkText} numberOfLines={3}>
                    {member.basket.link}
                  </Text>
                  <TouchableOpacity
                    style={styles.openLinkBtn}
                    onPress={() => handleOpenLink(member.basket!.link!)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="open-outline" size={15} color="#2563eb" />
                    <Text style={styles.openLinkBtnText}>Open Link</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* Order Note */}
            {member.basket.note ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text-outline" size={18} color="#374151" />
                  <Text style={styles.sectionTitle}>Order Note</Text>
                </View>
                <View style={[styles.card, styles.noteCard]}>
                  <Text style={styles.noteText}>{member.basket.note}</Text>
                </View>
              </View>
            ) : null}

            {/* Empty state */}
            {!hasDetails && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>No order details provided</Text>
              </View>
            )}
          </ScrollView>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    marginLeft: 8,
  },

  // ── Scroll ──
  scrollContent: {
    paddingBottom: 12,
  },

  // ── Section ──
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  // ── Cards ──
  card: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  linkCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    gap: 10,
  },
  linkText: {
    fontSize: 13,
    color: '#2563eb',
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
  openLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
  },
  openLinkBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  noteCard: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  noteText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },

  // ── Footer ──
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  closeBtn: {
    backgroundColor: '#245b7b',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
