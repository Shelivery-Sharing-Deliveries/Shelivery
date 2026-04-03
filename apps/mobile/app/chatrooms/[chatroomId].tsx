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
import { supabase } from '@/lib/supabase';
import { SimpleChatHeader } from '@/components/chatroom/SimpleChatHeader';
import { ChatMessages } from '@/components/chatroom/ChatMessages';
import { ChatInput } from '@/components/chatroom/ChatInput';
import { ChatMenu } from '@/components/chatroom/ChatMenu';

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
  pool: {
    id: string;
    current_amount: number;
    shop: { id: number; name: string };
    dormitory: { id: number; name: string };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeLeft(expireAt: string): { hours: number; minutes: number } {
  const now = new Date();
  const expire = new Date(expireAt);
  const diffMs = expire.getTime() - now.getTime();
  if (diffMs <= 0) return { hours: 0, minutes: 0 };
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
}

function formatTimeLeft(expireAt: string): string {
  const { hours, minutes } = getTimeLeft(expireAt);
  if (hours === 0 && minutes === 0) return 'Expired';
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatroomPage() {
  const { chatroomId } = useLocalSearchParams<{ chatroomId: string }>();
  const router = useRouter();

  const [chatroom, setChatroom] = useState<Chatroom | null>(null);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const subscriptionRef = useRef<any>(null);

  // ─── Data Loading ────────────────────────────────────────────────────────

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
    setMessages(messagesRes.data || []);
    setLoading(false);
  }, [chatroomId]);

  const loadMembers = useCallback(async () => {
    if (!chatroomId) return;

    // Get members via chat_membership join
    const { data } = await supabase
      .from('chat_membership')
      .select('user:user_id(id, first_name, last_name, image), basket:basket_id(id, amount, status)')
      .eq('chatroom_id', chatroomId)
      .is('left_at', null);

    if (data) {
      const mapped = data.map((row: any) => ({
        ...row.user,
        basket: row.basket || null,
      }));
      setMembers(mapped);
    }
  }, [chatroomId]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      await Promise.all([loadData(), loadMembers()]);
    };
    init();
  }, [chatroomId]);

  // ─── Real-time subscription ──────────────────────────────────────────────

  useEffect(() => {
    if (!chatroomId) return;

    subscriptionRef.current = supabase
      .channel(`chatroom-messages-${chatroomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message', filter: `chatroom_id=eq.${chatroomId}` },
        async (payload) => {
          // Fetch the user info for the new message
          const { data: msgWithUser } = await supabase
            .from('message')
            .select('*, user:user_id(*)')
            .eq('id', payload.new.id)
            .single();
          if (msgWithUser) {
            setMessages((prev) => [...prev, msgWithUser]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chatroom', filter: `id=eq.${chatroomId}` },
        (payload) => {
          setChatroom((prev) => prev ? { ...prev, ...payload.new } as any : null);
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [chatroomId]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const handleSendMessage = async (content: string | { type: 'audio' | 'image'; url: string }) => {
    if (!userId) return;

    const messageData = typeof content === 'string'
      ? { chatroom_id: chatroomId, user_id: userId, content, type: 'text' }
      : { chatroom_id: chatroomId, user_id: userId, content: content.url, type: content.type };

    await supabase.from('message').insert(messageData);
    // Real-time subscription handles the UI update
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

  // ─── Derived values ──────────────────────────────────────────────────────

  const isAdmin = chatroom?.admin_id === userId;
  const timeLeft = chatroom ? formatTimeLeft(chatroom.expire_at) : '...';
  const memberCount = members.length;
  const totalAmount = members.reduce((sum, m) => sum + (m.basket?.amount || 0), 0);
  const chatroomName = chatroom
    ? `${chatroom.pool.shop.name} Basket Chatroom`
    : 'Chatroom';

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#245b7b" />
      </SafeAreaView>
    );
  }

  if (!chatroom) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Chatroom not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SimpleChatHeader
        chatroomName={chatroomName}
        memberCount={memberCount}
        timeLeft={chatroom.expire_at}
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
          // ── Empty state ──────────────────────────────────────────────────
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

        <ChatInput chatroomId={chatroomId!} onSendMessage={handleSendMessage} />
      </KeyboardAvoidingView>

      <ChatMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        chatroom={chatroom}
        members={members}
        isAdmin={isAdmin}
        totalAmount={totalAmount}
        timeLeft={timeLeft}
        actionLoading={actionLoading}
        onMarkOrdered={handleMarkAsOrdered}
        onExtendTime={handleExtendTime}
        onLeaveOrder={handleLeaveOrder}
        onViewOrderDetails={(memberId, basketId) => {
          setMenuVisible(false);
          // Navigate to basket details – adjust the route path as needed
          router.push(`/basket/${basketId}` as any);
        }}
        currentUserId={userId || ''}
      />
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
