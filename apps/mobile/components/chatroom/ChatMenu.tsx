import React from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemeColors } from '@/lib/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  image: string | null;
  basket: {
    id: string; amount: number; status: string;
    link: string | null; note: string | null;
    is_ready: boolean | null; is_delivered_by_user: boolean | null;
  } | null;
}

interface Chatroom {
  id: string;
  state: 'waiting' | 'active' | 'ordered' | 'delivered' | 'resolved' | 'canceled';
  admin_id: string; expire_at: string;
  pool: { current_amount: number; shop: { id: number; name: string }; dormitory: { id: number; name: string } };
}

interface ChatMenuProps {
  visible: boolean; onClose: () => void;
  chatroom: Chatroom; members: ChatMember[];
  isAdmin: boolean; totalAmount: number; timeLeft: string;
  actionLoading: boolean; currentUserId: string;
  onMarkOrdered: () => void; onMarkDelivered: () => void;
  onConfirmDelivery: () => void; onExtendTime: () => void;
  onLeaveOrder: () => void; onMakeAdmin: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onViewOrderDetails: (member: ChatMember) => void;
}

// ─── Status config (dark-aware) ───────────────────────────────────────────────

function getStatusConfig(state: Chatroom['state'], isDark: boolean) {
  const configs = {
    'waiting': {
      iconName: 'time-outline' as const, iconColor: '#d97706',
      cardBg: isDark ? '#1A1200' : '#fffbeb', cardBorder: isDark ? '#2E2200' : '#fde68a',
      title: 'Waiting to Order', description: 'Coordinate with members and place the group order',
    },
    'active': {
      iconName: 'time-outline' as const, iconColor: '#d97706',
      cardBg: isDark ? '#1A1200' : '#fffbeb', cardBorder: isDark ? '#2E2200' : '#fde68a',
      title: 'Waiting to Order', description: 'Coordinate with members and place the group order',
    },
    'ordered': {
      iconName: 'bag-check-outline' as const, iconColor: '#2563eb',
      cardBg: isDark ? '#0D1A2A' : '#eff6ff', cardBorder: isDark ? '#1E3347' : '#bfdbfe',
      title: 'Order Placed', description: 'Waiting for delivery confirmation',
    },
    'delivered': {
      iconName: 'checkmark-circle-outline' as const, iconColor: '#16a34a',
      cardBg: isDark ? '#0A1A10' : '#f0fdf4', cardBorder: isDark ? '#153520' : '#bbf7d0',
      title: 'Order Delivered', description: 'Confirm receipt of your order below',
    },
    'resolved': {
      iconName: 'checkmark-done-circle-outline' as const, iconColor: '#16a34a',
      cardBg: isDark ? '#0A1A10' : '#f0fdf4', cardBorder: isDark ? '#153520' : '#bbf7d0',
      title: 'Order Resolved', description: 'All members have confirmed delivery',
    },
    'canceled': {
      iconName: 'close-circle-outline' as const, iconColor: '#dc2626',
      cardBg: isDark ? '#1F0A0A' : '#fef2f2', cardBorder: isDark ? '#3A1010' : '#fecaca',
      title: 'Order Canceled', description: 'This order has been canceled',
    },
  };
  return configs[state] ?? {
    iconName: 'information-circle-outline' as const, iconColor: '#6b7280',
    cardBg: isDark ? '#1A2535' : '#f9fafb', cardBorder: isDark ? '#2A3F52' : '#e5e7eb',
    title: 'Unknown Status', description: '',
  };
}

function getMemberStatus(member: ChatMember, isOrderDelivered: boolean): string {
  if (isOrderDelivered && member.basket?.is_delivered_by_user) return 'Delivery Confirmed ✓';
  if (member.basket?.is_ready) return 'Ready to order';
  return `${member.basket?.amount ?? 0} CHF order`;
}

// ─── Dynamic styles ───────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: isDark ? colors['shelivery-card-background'] : '#ffffff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', paddingHorizontal: 20, paddingBottom: 16,
  },
  dragHandle: {
    width: 40, height: 4,
    backgroundColor: colors['shelivery-card-border'],
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  sheetHeader: {
    paddingVertical: 16, paddingRight: 40,
    borderBottomWidth: 1, borderBottomColor: colors['shelivery-card-border'], marginBottom: 4,
  },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: colors['shelivery-text-primary'] },
  sheetSubtitle: { fontSize: 13, color: colors['shelivery-text-tertiary'], marginTop: 2 },
  closeButton: { position: 'absolute', top: 16, right: 0, padding: 4 },
  scrollContent: { paddingBottom: 20 },
  statusCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 16 },
  statusCardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  statusIconBg: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  statusCardText: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: '700', color: colors['shelivery-text-primary'] },
  statusDescription: { fontSize: 13, color: colors['shelivery-text-tertiary'], marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: colors['shelivery-text-primary'] },
  statLabel: { fontSize: 11, color: colors['shelivery-text-tertiary'] },
  statDivider: { width: 1, height: 40, backgroundColor: colors['shelivery-card-border'] },
  section: {
    backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : '#ffffff',
    borderWidth: 1, borderColor: colors['shelivery-card-border'],
    borderRadius: 16, padding: 16, marginTop: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors['shelivery-text-primary'], marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: colors['shelivery-text-secondary'], marginBottom: 12 },
  memberRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 10, borderTopWidth: 1,
    borderTopColor: colors['shelivery-card-border'], gap: 12,
  },
  avatarWrapper: { position: 'relative' },
  adminCrown: {
    position: 'absolute', top: -6, left: '50%',
    transform: [{ translateX: -7 }], zIndex: 1,
    backgroundColor: isDark ? '#2D1E00' : '#fef3c7', borderRadius: 8, padding: 2,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : '#d1d5db',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors['shelivery-text-secondary'] },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  memberName: { fontSize: 15, fontWeight: '600', color: colors['shelivery-text-primary'] },
  youBadge: { fontSize: 13, color: colors['shelivery-text-tertiary'] },
  adminBadge: { fontSize: 11, color: '#f59e0b', fontWeight: '600' },
  deliveredIcon: { marginLeft: 4 },
  memberBasket: { fontSize: 12, color: colors['shelivery-text-secondary'], marginTop: 2 },
  memberNoBasket: { fontSize: 12, color: colors['shelivery-text-tertiary'], marginTop: 2 },
  viewOrderLink: { fontSize: 12, color: colors['shelivery-primary-blue'], marginTop: 4, textDecorationLine: 'underline' },
  noMembers: { fontSize: 13, color: colors['shelivery-text-tertiary'], textAlign: 'center', paddingVertical: 8 },
  memberActions: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  memberActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8,
    backgroundColor: isDark ? colors['shelivery-badge-blue-bg'] : '#eff6ff',
    borderWidth: 1, borderColor: isDark ? colors['shelivery-badge-blue-border'] : '#bfdbfe',
  },
  memberActionBtnDanger: {
    backgroundColor: isDark ? colors['shelivery-badge-red-bg'] : '#fef2f2',
    borderColor: isDark ? colors['shelivery-badge-red-border'] : '#fecaca',
  },
  memberActionBtnText: { fontSize: 12, fontWeight: '600', color: colors['shelivery-badge-blue-text'] },
  memberActionBtnTextDanger: { color: isDark ? colors['shelivery-badge-red-text'] : '#dc2626' },
  actionBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  actionBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  darkBlueBtn: { backgroundColor: colors['shelivery-primary-blue'] },
  greenBtn: { backgroundColor: '#16a34a' },
  yellowBtn: { backgroundColor: '#f59e0b' },
  redBtn: { backgroundColor: '#e05c5c' },
  leaveBtn: { marginTop: 8 },
  actionBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  confirmedSection: {
    backgroundColor: isDark ? '#0A1A10' : '#f0fdf4',
    borderColor: isDark ? '#153520' : '#bbf7d0',
  },
  confirmedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmedText: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
});

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatMenu({
  visible, onClose, chatroom, members, isAdmin, totalAmount, timeLeft,
  actionLoading, currentUserId, onMarkOrdered, onMarkDelivered,
  onConfirmDelivery, onExtendTime, onLeaveOrder, onMakeAdmin, onRemoveMember,
  onViewOrderDetails,
}: ChatMenuProps) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const status = getStatusConfig(chatroom.state, isDark);
  const isWaiting = chatroom.state === 'waiting' || chatroom.state === 'active';
  const isOrdered = chatroom.state === 'ordered';
  const isDelivered = chatroom.state === 'delivered';
  const isOrderDelivered = chatroom.state === 'delivered' || chatroom.state === 'resolved';
  const isResolved = chatroom.state === 'resolved' || chatroom.state === 'canceled';
  const currentUserMember = members.find((m) => m.id === currentUserId);
  const hasConfirmedDelivery = currentUserMember?.basket?.is_delivered_by_user === true;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.overlay}>
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.dragHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{chatroom.pool.shop.name} Basket Chatroom</Text>
              <Text style={styles.sheetSubtitle}>
                {members.length} Member{members.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors['shelivery-text-secondary']} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

              {/* Order Status Card */}
              <View style={[styles.statusCard, { backgroundColor: status.cardBg, borderColor: status.cardBorder }]}>
                <View style={styles.statusCardHeader}>
                  <View style={styles.statusIconBg}>
                    <Ionicons name={status.iconName} size={22} color={status.iconColor} />
                  </View>
                  <View style={styles.statusCardText}>
                    <Text style={styles.statusTitle}>{status.title}</Text>
                    <Text style={styles.statusDescription}>{status.description}</Text>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="cash-outline" size={18} color={colors['shelivery-text-tertiary']} />
                    <Text style={styles.statValue}>{totalAmount} CHF</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Ionicons name="people-outline" size={18} color={colors['shelivery-text-tertiary']} />
                    <Text style={styles.statValue}>{members.length}</Text>
                    <Text style={styles.statLabel}>Members</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Ionicons name="time-outline" size={18} color={colors['shelivery-text-tertiary']} />
                    <Text style={styles.statValue}>{timeLeft}</Text>
                    <Text style={styles.statLabel}>Left</Text>
                  </View>
                </View>
              </View>

              {/* Group Members */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Group Members</Text>
                <Text style={styles.sectionSubtitle}>Members ({members.length})</Text>

                {members.map((member) => {
                  const isYou = member.id === currentUserId;
                  const isThisAdmin = member.id === chatroom.admin_id;
                  const fullName = [member.first_name, member.last_name].filter(Boolean).join(' ') || 'Unknown';
                  const hasOrderDetails = isAdmin && !!(member.basket?.link || member.basket?.note);

                  return (
                    <View key={member.id} style={styles.memberRow}>
                      <View style={styles.avatarWrapper}>
                        {isThisAdmin && (
                          <View style={styles.adminCrown}>
                            <Ionicons name="trophy" size={10} color="#f59e0b" />
                          </View>
                        )}
                        {member.image ? (
                          <Image source={{ uri: member.image }} style={styles.avatar} />
                        ) : (
                          <View style={[styles.avatar, styles.avatarFallback]}>
                            <Text style={styles.avatarText}>
                              {(member.first_name || '?').charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.memberInfo}>
                        <View style={styles.memberNameRow}>
                          <Text style={styles.memberName}>{fullName}</Text>
                          {isYou && <Text style={styles.youBadge}> (You)</Text>}
                          {isThisAdmin && !isYou && <Text style={styles.adminBadge}> Admin</Text>}
                          {isOrderDelivered && member.basket?.is_delivered_by_user && (
                            <Ionicons name="checkmark-done" size={14} color="#16a34a" style={styles.deliveredIcon} />
                          )}
                        </View>
                        {member.basket ? (
                          <>
                            <Text style={styles.memberBasket}>{getMemberStatus(member, isOrderDelivered)}</Text>
                            {hasOrderDetails && (
                              <TouchableOpacity onPress={() => onViewOrderDetails(member)} activeOpacity={0.7}>
                                <Text style={styles.viewOrderLink}>View Order Details</Text>
                              </TouchableOpacity>
                            )}
                          </>
                        ) : (
                          <Text style={styles.memberNoBasket}>No order yet</Text>
                        )}
                        {isAdmin && !isYou && !isResolved && (
                          <View style={styles.memberActions}>
                            {!isThisAdmin && (
                              <TouchableOpacity style={styles.memberActionBtn} onPress={() => onMakeAdmin(member.id)} disabled={actionLoading}>
                                <Ionicons name="shield-checkmark-outline" size={13} color={colors['shelivery-badge-blue-text']} />
                                <Text style={styles.memberActionBtnText}>Make Admin</Text>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.memberActionBtn, styles.memberActionBtnDanger]} onPress={() => onRemoveMember(member.id)} disabled={actionLoading}>
                              <Ionicons name="person-remove-outline" size={13} color={isDark ? colors['shelivery-badge-red-text'] : '#dc2626'} />
                              <Text style={[styles.memberActionBtnText, styles.memberActionBtnTextDanger]}>Remove</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}

                {members.length === 0 && <Text style={styles.noMembers}>No members yet.</Text>}
              </View>

              {/* Admin Actions */}
              {isAdmin && !isResolved && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Admin Actions</Text>
                  {isWaiting && (
                    <TouchableOpacity style={[styles.actionBtn, styles.darkBlueBtn]} onPress={onMarkOrdered} disabled={actionLoading}>
                      {actionLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                        <View style={styles.actionBtnContent}>
                          <Ionicons name="bag-check-outline" size={18} color="#fff" />
                          <Text style={styles.actionBtnText}>Mark as Ordered</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                  {isOrdered && (
                    <TouchableOpacity style={[styles.actionBtn, styles.greenBtn]} onPress={onMarkDelivered} disabled={actionLoading}>
                      {actionLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                        <View style={styles.actionBtnContent}>
                          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                          <Text style={styles.actionBtnText}>Mark as Delivered</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                  {(isWaiting || isOrdered || isDelivered) && (
                    <TouchableOpacity style={[styles.actionBtn, styles.yellowBtn]} onPress={onExtendTime} disabled={actionLoading}>
                      {actionLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                        <View style={styles.actionBtnContent}>
                          <Ionicons name="time-outline" size={18} color="#fff" />
                          <Text style={styles.actionBtnText}>Extend Time</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Confirm Delivery */}
              {isDelivered && !hasConfirmedDelivery && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Delivery</Text>
                  <Text style={styles.sectionSubtitle}>
                    The admin has marked this order as delivered. Please confirm you received your items.
                  </Text>
                  <TouchableOpacity style={[styles.actionBtn, styles.greenBtn]} onPress={onConfirmDelivery} disabled={actionLoading}>
                    {actionLoading ? <ActivityIndicator color="#fff" size="small" /> : (
                      <View style={styles.actionBtnContent}>
                        <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
                        <Text style={styles.actionBtnText}>Confirm I Received My Order</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {isDelivered && hasConfirmedDelivery && (
                <View style={[styles.section, styles.confirmedSection]}>
                  <View style={styles.confirmedRow}>
                    <Ionicons name="checkmark-done-circle" size={20} color="#16a34a" />
                    <Text style={styles.confirmedText}>You have confirmed delivery receipt</Text>
                  </View>
                </View>
              )}

              {!isResolved && (
                <TouchableOpacity style={[styles.actionBtn, styles.redBtn, styles.leaveBtn]} onPress={onLeaveOrder} disabled={actionLoading}>
                  <View style={styles.actionBtnContent}>
                    <Ionicons name="exit-outline" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Leave Order</Text>
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
    </Modal>
  );
}
