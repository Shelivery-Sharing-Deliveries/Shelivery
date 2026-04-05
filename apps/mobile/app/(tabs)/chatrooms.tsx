import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import PageLayout, { NavBarSpacer } from '@/components/ui/PageLayout';
import { getCachedChatroomList, setCachedChatroomList } from '@/lib/chatCache';
import { useTheme } from '@/providers/ThemeProvider';
import { ThemeColors } from '@/lib/theme';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

function resolveUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && API_BASE_URL) return `${API_BASE_URL}${url}`;
  return url;
}

interface ChatroomListItem {
  id: string;
  state: string;
  expire_at: string;
  pool: { shop: { id: number; name: string; logo_url: string | null } } | null;
}

// ─── Dynamic styles factory ───────────────────────────────────────────────────

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    center: { flex: 1, marginTop: 80 },
    offlineBanner: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, backgroundColor: '#374151', paddingVertical: 6,
      paddingHorizontal: 12, marginHorizontal: -16, marginTop: -8, marginBottom: 12,
    },
    bannerText: { color: '#fff', fontSize: 12, fontWeight: '500' },
    syncingBanner: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : '#f0f9ff',
      borderWidth: 1, borderColor: isDark ? colors['shelivery-card-border'] : '#bae6fd',
      borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 12,
    },
    syncingBannerText: { color: colors['shelivery-primary-blue'], fontSize: 11, fontWeight: '500' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: colors['shelivery-text-primary'] },
    listContent: { paddingBottom: 24 },
    card: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 12, paddingHorizontal: 4,
      borderBottomWidth: 1, borderBottomColor: colors['shelivery-card-border'], gap: 12,
    },
    logoContainer: {
      width: 48, height: 48, borderRadius: 12, overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      borderWidth: 1, borderColor: colors['shelivery-card-border'],
      justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    },
    shopLogo: { width: 44, height: 44, borderRadius: 10 },
    logoPlaceholder: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    cardContent: { flex: 1, minWidth: 0 },
    title: { fontSize: 15, fontWeight: '600', color: colors['shelivery-text-primary'], marginBottom: 2 },
    subtitle: { fontSize: 12, color: colors['shelivery-text-tertiary'] },
    stateBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, flexShrink: 0 },
    stateText: { fontSize: 11, fontWeight: '600' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: colors['shelivery-text-secondary'], marginTop: 8 },
    emptySubtitle: { fontSize: 14, color: colors['shelivery-text-tertiary'], textAlign: 'center', paddingHorizontal: 32 },
    authPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
    authIconCircle: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: isDark ? colors['shelivery-button-secondary-bg'] : '#f0f9ff',
      alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    authTitle: { fontSize: 20, fontWeight: '700', color: colors['shelivery-text-primary'], textAlign: 'center' },
    authSubtitle: { fontSize: 14, color: colors['shelivery-text-tertiary'], textAlign: 'center', lineHeight: 20 },
    authButton: {
      marginTop: 8, backgroundColor: colors['shelivery-primary-blue'],
      paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center',
    },
    authButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  });

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatroomsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [activeChatrooms, setActiveChatrooms] = useState<ChatroomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable));
    });
    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    const init = async () => {
      const cached = await getCachedChatroomList<ChatroomListItem>();
      if (cached) { setActiveChatrooms(cached.chatrooms); setLoading(false); }
      setIsSyncing(true);
      try { await fetchChatrooms(); } catch { if (!cached) setLoading(false); }
      finally { setIsSyncing(false); }
    };
    init();
  }, [user?.id]);

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

  if (!authLoading && !user) {
    return (
      <PageLayout>
        <View style={styles.authPrompt}>
          <View style={styles.authIconCircle}>
            <Ionicons name="lock-closed-outline" size={32} color={colors['shelivery-primary-blue']} />
          </View>
          <Text style={styles.authTitle}>Sign in to view chatrooms</Text>
          <Text style={styles.authSubtitle}>
            You need to be logged in to access your group order chatrooms.
          </Text>
          <TouchableOpacity style={styles.authButton} onPress={() => router.push('/auth' as any)} activeOpacity={0.85}>
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  if (loading && activeChatrooms.length === 0) {
    return (
      <PageLayout>
        <ActivityIndicator size="large" color={colors['shelivery-primary-blue']} style={styles.center} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {isOffline ? (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
          <Text style={styles.bannerText}>{"You're not connected to the network"}</Text>
        </View>
      ) : isSyncing ? (
        <View style={styles.syncingBanner}>
          <ActivityIndicator size="small" color={colors['shelivery-primary-blue']} style={{ transform: [{ scale: 0.7 }] }} />
          <Text style={styles.syncingBannerText}>Updating…</Text>
        </View>
      ) : null}

      <Text style={styles.header}>Your Chatrooms</Text>

      {activeChatrooms.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors['shelivery-text-disabled']} />
          <Text style={styles.emptyTitle}>No chatrooms yet</Text>
          <Text style={styles.emptySubtitle}>Join a group order to see your chatrooms here.</Text>
        </View>
      ) : (
        <FlatList
          data={activeChatrooms}
          keyExtractor={(item) => item.id}
          ListFooterComponent={<NavBarSpacer />}
          renderItem={({ item }) => {
            const { label, color } = getStateLabel(item.state);
            const logoUrl = resolveUrl(item.pool?.shop?.logo_url);
            return (
              <TouchableOpacity style={styles.card} onPress={() => router.push(`/chatrooms/${item.id}`)}>
                <View style={styles.logoContainer}>
                  {logoUrl ? (
                    <Image source={{ uri: logoUrl }} style={styles.shopLogo} contentFit="contain" cachePolicy="disk" />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <Ionicons name="storefront-outline" size={22} color={colors['shelivery-text-tertiary']} />
                    </View>
                  )}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.title} numberOfLines={1}>{item.pool?.shop?.name || 'Shop'} Group</Text>
                  <Text style={styles.subtitle}>Tap to open chat</Text>
                </View>
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
