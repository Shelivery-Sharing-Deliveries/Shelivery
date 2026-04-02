import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ChatroomsPage() {
  const router = useRouter();
  const [activeChatrooms, setActiveChatrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatrooms();
  }, []);

  const loadChatrooms = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Simplified query for mobile migration
    const { data } = await supabase
      .from('chatroom')
      .select('*, pool:pool(*, shop:shop(*))')
      .order('created_at', { ascending: false });
      
    setActiveChatrooms(data || []);
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={styles.center} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Chatrooms</Text>
      <FlatList
        data={activeChatrooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/chatrooms/${item.id}`)}
          >
            <Text style={styles.title}>{item.pool?.shop?.name || 'Shop'} Group</Text>
            <Text style={styles.subtitle}>Tap to open chat</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
