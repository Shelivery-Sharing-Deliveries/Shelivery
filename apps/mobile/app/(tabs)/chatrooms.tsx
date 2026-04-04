import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';
import PageLayout from '@/components/ui/PageLayout';
import { getCachedChatroomList, setCachedChatroomList } from '@/lib/chatCache';

// ─── URL resolver ─────────────────────────────────────────────────────────────

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

function resolveUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && API_BASE_URL) return `${API_BASE_URL}${url}`;
  return url;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatroomListItem {
  id: string;
  state: string;
  expire_at: string;
  pool: {
    shop: { id: number; name: string; logo_url: string | null };
  } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatroomsPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [activeChatrooms, setActiveChatrooms] = useState<ChatroomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // ─── Network state ──────────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable));
    });
    return () => unsubscribe();
  }, []);

  // ─── Load from Supabase ─────────────────────────────────────────────────

  const fetchChatrooms = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('chatroom')
      .select('id, state, expire_at, pool:pool(shop:shop(id, name, logo_url))')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActiveChatrooms(data as any);
      await setCachedChatroomList(data);
    }

    setLoading(false);
  }, [user?.id]);

  // ─── Bootstrap (offline-first) ──────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      // 1. Show cached list instantly (works offline)
      const cached = await getCachedChatroomList<ChatroomListItem>();
      if (cached) {
        setActiveChatrooms(cached.chatrooms);
        setLoading(false);
      }

      // 2. Fetch fresh in background
      setIsSyncing(true);
      try {
        await fetchChatrooms();
      } catch {
        if (!cached) setLoading(false);
      } finally {
        setIsSyncing(false);
      }
    };

    init();
  }, [user?.id]);

  // ─── Helpers ────────────────────────────────────────────────────────────

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'waiting':   return { label: 'Waiting',   color: '#f59e0b' };
      case 'active':    return { label: 'Active',    color: '#10b981' };
      case 'ordered':   return { label: 'Ordered',   color: '#3b82f6' };
      case 'delivered': return { label: 'Delivered', color: '#8b5cf6' };
      case 'resolved':  return { label: 'Resolved',  color: '#6b7280' };
      case 'canceled':  return { label: 'Canceled',  color: '#ef4444' };
      default:          return { label: state,        color: '#6b7280' };
    }
  };

  // ─── Full-screen loading (no cache yet) ─────────────────────────────────

  if (loading && activeChatrooms.length === 0) {
    return (
      <PageLayout>
        <ActivityIndicator size="large" color="#245b7b" style={styles.center} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Status banners */}
      {isOffline ? (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
          <Text style={styles.bannerText}>{"You're not connected to the network"}</Text>
        </View>
      ) : isSyncing ? (
        <View style={styles.syncingBanner}>
          <ActivityIndicator
            size="small"
            color="#245b7b"
            style={{ transform: [{ scale: 0.7 }] }}
          />
          <Text style={styles.syncingBannerText}>Updating…</Text>
        </View>
      ) : null}

      <Text style={styles.header}>Your Chatrooms</Text>

      {activeChatrooms.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No chatrooms yet</Text>
          <Text style={styles.emptySubtitle}>
            Join a group order to see your chatrooms here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeChatrooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const { label, color } = getStateLabel(item.state);
            const logoUrl = resolveUrl(item.pool?.shop?.logo_url);

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/chatrooms/${item.id}`)}
              >
                {/* Shop logo */}
                <View style={styles.logoContainer}>
                  {logoUrl ? (
                    <Image
                      source={{ uri: logoUrl }}
                      style={styles.shopLogo}
                      contentFit="contain"
                      cachePolicy="disk"
                    />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <Ionicons name="storefront-outline" size={22} color="#9ca3af" />
                    </View>
                  )}
                </View>

                {/* Text */}
                <View style={styles.cardContent}>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.pool?.shop?.name || 'Shop'} Group
                  </Text>
                  <Text style={styles.subtitle}>Tap to open chat</Text>
                </View>

                {/* State badge */}
                <View style={[styles.stateBadge, { backgroundColor: `${color}20` }]}>
                  <Text style={[styles.stateText, { color }]}>{label}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    marginTop: 80,
  },

  // ── Banners ──────────────────────────────────────────────────────────────
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: -16,
    marginTop: -8,
    marginBottom: 12,
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
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  syncingBannerText: {
    color: '#245b7b',
    fontSize: 11,
    fontWeight: '500',
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  listContent: {
    paddingBottom: 24,
  },

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  shopLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
  },
  stateText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
