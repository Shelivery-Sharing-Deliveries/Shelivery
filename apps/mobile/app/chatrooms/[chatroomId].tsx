import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SimpleChatHeader } from '@/components/chatroom/SimpleChatHeader';
import { ChatMessages } from '@/components/chatroom/ChatMessages';
import { ChatInput } from '@/components/chatroom/ChatInput';

export default function ChatroomPage() {
  const { chatroomId } = useLocalSearchParams<{ chatroomId: string }>();
  const router = useRouter();

  const [chatroom, setChatroom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      loadData();
    };
    init();
  }, [chatroomId]);

  const loadData = async () => {
    if (!chatroomId) return;
    
    // Fetch chatroom
    const { data: chatroomData } = await supabase
      .from('chatroom')
      .select('*, pool:pool(*, shop:shop(*))')
      .eq('id', chatroomId)
      .single();
    
    setChatroom(chatroomData);

    // Fetch messages
    const { data: messagesData } = await supabase
      .from('message')
      .select('*, user:user_id(*)')
      .eq('chatroom_id', chatroomId)
      .order('sent_at', { ascending: true });
      
    setMessages(messagesData || []);
    setLoading(false);
  };

  const handleSendMessage = async (content: string | { type: 'audio' | 'image', url: string }) => {
    if (!userId) return;

    if (typeof content === 'string') {
        await supabase.from('message').insert({
            chatroom_id: chatroomId,
            user_id: userId,
            content,
            type: 'text'
        });
    } else {
        await supabase.from('message').insert({
            chatroom_id: chatroomId,
            user_id: userId,
            content: content.url,
            type: content.type
        });
    }
    loadData(); // Refresh
  };

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (!chatroom) return <View style={styles.center}><Text>Chatroom not found</Text></View>;

  return (
    <View style={styles.container}>
      <SimpleChatHeader 
        chatroomName={`${chatroom.pool.shop.name} Chat`}
        memberCount={0}
        timeLeft={chatroom.expire_at}
        onBack={() => router.back()}
      />
      <ChatMessages messages={messages} currentUserId={userId || ''} />
      <ChatInput onSendMessage={handleSendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
