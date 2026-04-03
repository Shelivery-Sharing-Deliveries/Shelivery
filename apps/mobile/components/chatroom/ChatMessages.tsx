import React, { useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import VoiceMessageBubble from './VoiceMessageBubble';

// Simple interface based on the structure we see in the database.types.ts
interface Message {
  id: number;
  chatroom_id: string;
  user_id: string;
  content: string;
  type: string | null;
  sent_at: string | null;
  read_at: string | null;
  user: {
    id: string;
    email: string;
    first_name: string | null;
    image: string | null;
  };
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
}

export function ChatMessages({ messages, currentUserId }: ChatMessagesProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.user_id === currentUserId;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.user_id !== item.user_id;
    const isAudio = item.type === 'audio';
    const isImage = item.type === 'image';

    return (
      <View style={[styles.messageRow, isOwnMessage && styles.ownMessageRow]}>
        {/* Avatar – only shown for first message in a group */}
        {!isOwnMessage && (
          <View style={[styles.avatarPlaceholder, showAvatar ? null : styles.avatarInvisible]}>
            {showAvatar && (
              item.user?.image ? (
                <Image source={{ uri: item.user.image }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {item.user?.first_name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )
            )}
          </View>
        )}

        {/* Bubble */}
        <View
          style={[
            styles.bubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
            isAudio && styles.audioBubble,
          ]}
        >
          {/* Sender name (only for first message in group, and not own) */}
          {!isOwnMessage && showAvatar && item.user?.first_name && (
            <Text style={styles.senderName}>{item.user.first_name}</Text>
          )}

          {isImage && item.content ? (
            <Image source={{ uri: item.content }} style={styles.imageMessage} resizeMode="cover" />
          ) : isAudio && item.content ? (
            <VoiceMessageBubble src={item.content} />
          ) : (
            <Text style={isOwnMessage ? styles.ownText : styles.otherText}>
              {item.content}
            </Text>
          )}

          {/* Timestamp */}
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
  listContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  ownMessageRow: {
    flexDirection: 'row-reverse',
  },

  // ── Avatar ──────────────────────────────────────────────────────────────
  avatarPlaceholder: {
    width: 32,
    marginRight: 8,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  avatarInvisible: {
    opacity: 0,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
  },

  // ── Bubble ───────────────────────────────────────────────────────────────
  bubble: {
    padding: 10,
    borderRadius: 18,
    maxWidth: '80%',
    marginBottom: 2,
  },
  ownBubble: {
    backgroundColor: '#245b7b',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  audioBubble: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 200,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 3,
  },
  ownText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  otherText: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 20,
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 3,
  },
  ownTimestamp: {
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: '#9ca3af',
    textAlign: 'right',
  },
});
