import React, { useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import VoiceMessageBubble from './VoiceMessageBubble';
import { useTheme } from '@/providers/ThemeProvider';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

function resolveMediaUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && API_BASE_URL) return `${API_BASE_URL}${url}`;
  return url;
}

interface Message {
  id: number;
  chatroom_id: string;
  user_id: string;
  content: string;
  type: string | null;
  sent_at: string | null;
  read_at: string | null;
  user: { id: string; email: string; first_name: string | null; image: string | null };
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
}

export function ChatMessages({ messages, currentUserId }: ChatMessagesProps) {
  const flatListRef = useRef<FlatList>(null);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.user_id === currentUserId;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.user_id !== item.user_id;
    const isAudio = item.type === 'audio';
    const isImage = item.type === 'image';

    // Other bubble adapts to dark mode
    const otherBubbleBg = isDark ? '#1E3A50' : '#f3f4f6';
    const otherBubbleText = colors['shelivery-text-primary'];

    return (
      <View style={[styles.messageRow, isOwnMessage && styles.ownMessageRow]}>
        {!isOwnMessage && (
          <View style={[styles.avatarPlaceholder, showAvatar ? null : styles.avatarInvisible]}>
            {showAvatar && (
              item.user?.image ? (
                <Image source={{ uri: resolveMediaUrl(item.user.image) }} style={styles.avatarImage} cachePolicy="disk" />
              ) : (
                <View style={[styles.avatarContainer, { backgroundColor: isDark ? '#2A3F52' : '#d1d5db' }]}>
                  <Text style={[styles.avatarText, { color: colors['shelivery-text-secondary'] }]}>
                    {item.user?.first_name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )
            )}
          </View>
        )}

        <View style={[
          styles.bubble,
          isOwnMessage
            ? [styles.ownBubble, { backgroundColor: colors['shelivery-primary-blue'] }]
            : [styles.otherBubble, { backgroundColor: otherBubbleBg }],
          isAudio && styles.audioBubble,
        ]}>
          {!isOwnMessage && showAvatar && item.user?.first_name && (
            <Text style={[styles.senderName, { color: colors['shelivery-text-tertiary'] }]}>{item.user.first_name}</Text>
          )}

          {isImage && item.content ? (
            <Image source={{ uri: resolveMediaUrl(item.content) }} style={styles.imageMessage} contentFit="cover" cachePolicy="disk" />
          ) : isAudio && item.content ? (
            <VoiceMessageBubble messageId={item.id} src={resolveMediaUrl(item.content)} />
          ) : (
            <Text style={isOwnMessage ? styles.ownText : [styles.otherText, { color: otherBubbleText }]}>
              {item.content}
            </Text>
          )}

          {item.sent_at && (
            <Text style={[styles.timestamp, isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp]}>
              {new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 8 },
  messageRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-end' },
  ownMessageRow: { flexDirection: 'row-reverse' },
  avatarPlaceholder: { width: 32, marginRight: 8, marginBottom: 2, alignItems: 'center', justifyContent: 'flex-end' },
  avatarInvisible: { opacity: 0 },
  avatarContainer: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 32, height: 32, borderRadius: 16 },
  avatarText: { fontSize: 13, fontWeight: 'bold' },
  bubble: { padding: 10, borderRadius: 18, maxWidth: '80%', marginBottom: 2 },
  ownBubble: { borderBottomRightRadius: 4 },
  otherBubble: { borderBottomLeftRadius: 4 },
  audioBubble: { paddingVertical: 8, paddingHorizontal: 10, minWidth: 200 },
  senderName: { fontSize: 11, fontWeight: '600', marginBottom: 3 },
  ownText: { color: '#fff', fontSize: 15, lineHeight: 20 },
  otherText: { fontSize: 15, lineHeight: 20 },
  imageMessage: { width: 200, height: 200, borderRadius: 10 },
  timestamp: { fontSize: 10, marginTop: 3 },
  ownTimestamp: { color: 'rgba(255,255,255,0.65)', textAlign: 'right' },
  otherTimestamp: { color: '#9ca3af', textAlign: 'right' },
});
