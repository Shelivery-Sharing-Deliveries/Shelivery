import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';
import { SimpleChatHeader } from '@/components/chatroom/SimpleChatHeader';
import { ChatMessages } from '@/components/chatroom/ChatMessages';
import { ChatInput } from '@/components/chatroom/ChatInput';
import { ChatMenu } from '@/components/chatroom/ChatMenu';
import {
  getCachedMessages,
  setCachedMessages,
  appendCachedMessages,
  clearChatCache,
} from '@/lib/chatCache';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

function getProxiedImageUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && API_BASE_URL) return `${API_BASE_URL}${url}`;
  return url;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  image: string | null;
  basket: {
    id: string;
    amount: number;
    status: string;
    link: string | null;
    note: string | null;
    is_ready: boolean | null;
    is_delivered_by_user: boolean | null;
  } | null;
}

interface Chatroom {
  id: string;
  pool_id: string;
  state: 'waiting' | 'active' | 'ordered' | 'delivered' | 'resolved' | 'canceled';
  admin_id: string;
  expire_at: string;
  extended_once_before_ordered: boolean;
  total_extension_days_ordered_state: number;
  total_extension_days_delivered_state: number;
  pool: {
    id: string;
    current_amount: number;
    shop: { id: number; name: string };
    dormitory: { id: number; name: string };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeLeft(expireAt: string): string {
  const now = new Date();
  const expire = new Date(expireAt);
  const diffMs = expire.getTime() - now.getTime();
  if (diffMs <= 0) return 'Expired';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatroomPage() {
  const { chatroomId } = useLocalSearchParams<{ chatroomId: string }>();
  const router = useRouter();
  const { user } = useAuthContext();
  const userId = user?.id ?? null;

  const [chatroom, setChatroom] = useState<Chatroom | null>(null);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const subscriptionRef = useRef<any>(null);

  // ─── Network state ────────────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable));
    });
    return () => unsubscribe();
  }, []);

  // ─── Data Loading ─────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!chatroomId) return;

    const [chatroomRes, messagesRes] = await Promise.all([
      supabase
        .from('chatroom')
        .select('*, pool:pool(*, shop:shop(*), dormitory:dormitory(*))')
        .eq('id', chatroomId)
        .single(),
      supabase
        .from('message')
        .select('*, user:user_id(*)')
        .eq('chatroom_id', chatroomId)
        .order('sent_at', { ascending: true }),
    ]);

    if (chatroomRes.data) setChatroom(chatroomRes.data as any);

    if (messagesRes.data) {
      setMessages(messagesRes.data);
      // Persist to cache for offline access
      await setCachedMessages(chatroomId, messagesRes.data);
    }

    setLoading(false);
  }, [chatroomId]);

  const loadMembers = useCallback(async () => {
    if (!chatroomId) return;

    const { data: membershipsData } = await supabase
      .from('chat_membership')
      .select('user_id')
      .eq('chatroom_id', chatroomId)
      .is('left_at', null);

    if (membershipsData) {
      const userIds = membershipsData.map((m: any) => m.user_id);

      const { data: usersData } = await supabase
        .from('user')
        .select('id, first_name, last_name, image')
        .in('id', userIds);

      const { data: basketsData } = await supabase
        .from('basket')
        .select('id, amount, status, link, note, is_ready, is_delivered_by_user, user_id')
        .in('user_id', userIds)
        .eq('chatroom_id', chatroomId);

      const mapped = usersData?.map((user: any) => ({
        ...user,
        image: user.image ? getProxiedImageUrl(user.image) : null,
        basket: basketsData?.find((basket: any) => basket.user_id === user.id) || null,
      })) || [];

      setMembers(mapped);
    }
  }, [chatroomId]);

  // ─── Bootstrap ────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      if (!chatroomId) return;

      // 1. Show cached messages immediately (offline-first)
      const cached = await getCachedMessages(chatroomId);
      if (cached) {
        setMessages(cached.messages);
        setLoading(false); // unblock UI right away
      }

      // 2. Fetch fresh data in background (even if cache hit)
      setIsSyncing(true);
      try {
        await Promise.all([loadData(), loadMembers()]);
      } catch {
        // Network error — stay on cached data
        if (!cached) setLoading(false);
      } finally {
        setIsSyncing(false);
      }
    };

    init();
  }, [chatroomId]);

  // ─── Real-time subscription ───────────────────────────────────────────────

  useEffect(() => {
    if (!chatroomId) return;

    subscriptionRef.current = supabase
      .channel(`chatroom-messages-${chatroomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message', filter: `chatroom_id=eq.${chatroomId}` },
        async (payload) => {
          const { data: msgWithUser } = await supabase
            .from('message')
            .select('*, user:user_id(*)')
            .eq('id', payload.new.id)
            .single();
          if (msgWithUser) {
            setMessages((prev) => [...prev, msgWithUser]);
            // Append to cache so offline users see it next time
            await appendCachedMessages(chatroomId, [msgWithUser]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chatroom', filter: `id=eq.${chatroomId}` },
        (payload) => {
          setChatroom((prev) => prev ? { ...prev, ...payload.new } as any : null);

          // Clear cache when chatroom is resolved or canceled
          const newState = payload.new.state;
          if (newState === 'resolved' || newState === 'canceled') {
            clearChatCache(chatroomId);
          }
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [chatroomId]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleSendMessage = async (content: string | { type: 'audio' | 'image'; url: string }) => {
    if (!userId) return;

    const messageData = typeof content === 'string'
      ? { chatroom_id: chatroomId, user_id: userId, content, type: 'text' }
      : { chatroom_id: chatroomId, user_id: userId, content: content.url, type: content.type };

    await supabase.from('message').insert(messageData);
  };

  const handleMarkAsOrdered = async () => {
    if (!chatroomId || !userId) return;
    if (chatroom?.admin_id !== userId) {
      Alert.alert('Permission denied', 'Only the admin can mark the order as placed.');
      return;
    }
    setActionLoading(true);
    const { error } = await supabase
      .from('chatroom')
      .update({ state: 'ordered' })
      .eq('id', chatroomId);

    if (error) {
      Alert.alert('Error', 'Failed to mark as ordered. Please try again.');
    } else {
      await loadData();
    }
    setActionLoading(false);
    setMenuVisible(false);
  };

  const handleMarkAsDelivered = async () => {
    if (!chatroomId || !userId) return;
    if (chatroom?.admin_id !== userId) {
      Alert.alert('Permission denied', 'Only the admin can mark the order as delivered.');
      return;
    }
    Alert.alert(
      'Mark as Delivered',
      'Are you sure the order has been delivered to all members?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Delivered',
          onPress: async () => {
            setActionLoading(true);
            // Step 1: Update chatroom state to 'delivered'
            const { error: chatroomError } = await supabase
              .from('chatroom')
              .update({ state: 'delivered' })
              .eq('id', chatroomId);

            if (chatroomError) {
              Alert.alert('Error', 'Failed to mark as delivered. Please try again.');
              setActionLoading(false);
              return;
            }

            // Step 2: Confirm admin's own delivery via RPC
            const { data, error: rpcError } = await supabase.rpc('confirm_user_delivery', {
              p_chatroom_id: chatroomId,
              p_user_id: userId,
            });

            if (rpcError) {
              Alert.alert('Error', rpcError.message || 'Failed to confirm admin delivery.');
            } else if (data && typeof data === 'object') {
              Alert.alert('Success', data.message || 'Order marked as delivered!');
            } else {
              Alert.alert('Success', 'Order marked as delivered! Waiting for members to confirm receipt.');
            }

            await loadData();
            await loadMembers();
            setActionLoading(false);
            setMenuVisible(false);
          },
        },
      ]
    );
  };

  const handleConfirmDelivery = async () => {
    if (!chatroomId || !userId) return;
    Alert.alert(
      'Confirm Delivery',
      'Have you received your order?',
      [
        { text: 'Not yet', style: 'cancel' },
        {
          text: 'Yes, I received it',
          onPress: async () => {
            setActionLoading(true);
            const { data, error } = await supabase.rpc('confirm_user_delivery', {
              p_chatroom_id: chatroomId,
              p_user_id: userId,
            });

            if (error) {
              Alert.alert('Error', error.message || 'Failed to confirm delivery.');
            } else if (data && typeof data === 'object') {
              Alert.alert('Success', data.message || 'Delivery confirmed!');
            } else {
              Alert.alert('Success', 'Delivery confirmation processed.');
            }

            await loadData();
            await loadMembers();
            setActionLoading(false);
            setMenuVisible(false);
          },
        },
      ]
    );
  };

  const handleMakeAdmin = async (targetUserId: string) => {
    if (!chatroomId || !userId) return;
    if (chatroom?.admin_id !== userId) {
      Alert.alert('Permission denied', 'Only the current admin can transfer the admin role.');
      return;
    }
    const targetMember = members.find((m) => m.id === targetUserId);
    const targetName =
      [targetMember?.first_name, targetMember?.last_name].filter(Boolean).join(' ') || 'this member';

    Alert.alert(
      'Make Admin',
      `Are you sure you want to make ${targetName} the new admin? You will lose your admin privileges.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setActionLoading(true);
            const { error } = await supabase
              .from('chatroom')
              .update({ admin_id: targetUserId })
              .eq('id', chatroomId);

            if (error) {
              Alert.alert('Error', 'Failed to transfer admin role. Please try again.');
            } else {
              Alert.alert('Success', 'Admin role transferred successfully!');
              await loadData();
              await loadMembers();
            }
            setActionLoading(false);
          },
        },
      ]
    );
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!chatroomId || !userId) return;
    if (chatroom?.admin_id !== userId) {
      Alert.alert('Permission denied', 'Only the admin can remove members.');
      return;
    }
    if (targetUserId === userId) {
      Alert.alert('Error', 'You cannot remove yourself. Use "Leave Order" instead.');
      return;
    }
    const targetMember = members.find((m) => m.id === targetUserId);
    const targetName =
      [targetMember?.first_name, targetMember?.last_name].filter(Boolean).join(' ') || 'this member';

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${targetName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const { error } = await supabase
              .from('chat_membership')
              .update({ left_at: new Date().toISOString() })
              .eq('chatroom_id', chatroomId)
              .eq('user_id', targetUserId);

            if (error) {
              Alert.alert('Error', 'Failed to remove member. Please try again.');
            } else {
              setMembers((prev) => prev.filter((m) => m.id !== targetUserId));
              Alert.alert('Success', 'Member removed from group.');
            }
            setActionLoading(false);
          },
        },
      ]
    );
  };

  const handleExtendTime = async () => {
    if (!chatroomId || !userId) return;
    if (chatroom?.admin_id !== userId) {
      Alert.alert('Permission denied', 'Only the admin can extend the time.');
      return;
    }
    setActionLoading(true);
    const { error } = await supabase.rpc('extend_chatroom_expire_at', {
      p_chatroom_id: chatroomId,
      p_days_to_extend: 1,
    });

    if (error) {
      Alert.alert('Error', error.message || 'Failed to extend time. Please try again.');
    } else {
      Alert.alert('Success', 'Time has been extended by 1 day.');
      await loadData();
    }
    setActionLoading(false);
    setMenuVisible(false);
  };

  const handleLeaveOrder = async () => {
    if (!chatroomId || !userId) return;

    Alert.alert(
      'Leave Order',
      'Are you sure you want to leave this group order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const { error } = await supabase.rpc('leave_chatroom', {
              chatroom_id_param: chatroomId,
            });
            if (error) {
              Alert.alert('Error', 'Failed to leave the group. Please try again.');
            } else {
              router.replace('/chatrooms' as any);
            }
            setActionLoading(false);
            setMenuVisible(false);
          },
        },
      ]
    );
  };

  // ─── Derived values ───────────────────────────────────────────────────────

  const isAdmin = chatroom?.admin_id === userId;
  const timeLeft = chatroom ? formatTimeLeft(chatroom.expire_at) : '...';
  const memberCount = members.length;
  const totalAmount = members.reduce((sum, m) => sum + (m.basket?.amount || 0), 0);
  const chatroomName = chatroom
    ? `${chatroom.pool.shop.name} Basket Chatroom`
    : 'Chatroom';

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading && messages.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#245b7b" />
      </SafeAreaView>
    );
  }

  if (!chatroom && messages.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Chatroom not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Status banners — offline takes priority over syncing */}
      {isOffline ? (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
          <Text style={styles.bannerText}>{"You're not connected to the network"}</Text>
        </View>
      ) : isSyncing ? (
        <View style={styles.syncingBanner}>
          <ActivityIndicator size="small" color="#245b7b" style={{ transform: [{ scale: 0.7 }] }} />
          <Text style={styles.syncingBannerText}>Updating…</Text>
        </View>
      ) : null}

      <SimpleChatHeader
        chatroomName={chatroomName}
        memberCount={memberCount}
        timeLeft={chatroom?.expire_at ?? ''}
        onBack={() => router.back()}
        onMenuClick={() => setMenuVisible(true)}
        showMenuButton={true}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="chatbubble-ellipses" size={28} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>Welcome to the chatroom!</Text>
            <Text style={styles.emptySubtitle}>
              Start the conversation by sending a message to your group members.
            </Text>
          </View>
        ) : (
          <ChatMessages messages={messages} currentUserId={userId || ''} />
        )}

        <ChatInput
          chatroomId={chatroomId!}
          onSendMessage={handleSendMessage}
          disabled={isOffline}
        />
      </KeyboardAvoidingView>

      {chatroom && (
        <ChatMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          chatroom={chatroom}
          members={members}
          isAdmin={isAdmin}
          totalAmount={totalAmount}
          timeLeft={timeLeft}
          actionLoading={actionLoading}
          currentUserId={userId || ''}
          onMarkOrdered={handleMarkAsOrdered}
          onMarkDelivered={handleMarkAsDelivered}
          onConfirmDelivery={handleConfirmDelivery}
          onExtendTime={handleExtendTime}
          onLeaveOrder={handleLeaveOrder}
          onMakeAdmin={handleMakeAdmin}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  bannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  syncingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#bae6fd',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  syncingBannerText: {
    color: '#245b7b',
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
