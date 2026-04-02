import React, { useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

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

    return (
      <View style={[styles.messageRow, isOwnMessage && styles.ownMessageRow]}>
        {showAvatar && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{item.user?.first_name?.charAt(0) || '?'}</Text>
          </View>
        )}
        <View style={[styles.bubble, isOwnMessage ? styles.ownBubble : styles.otherBubble]}>
          {item.type === 'image' && item.content ? (
            <Image source={{ uri: item.content }} style={styles.imageMessage} />
          ) : item.type === 'audio' && item.content ? (
            <Text style={isOwnMessage ? styles.ownText : styles.otherText}>[Audio Message]</Text>
          ) : (
            <Text style={isOwnMessage ? styles.ownText : styles.otherText}>
              {item.content}
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
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  ownMessageRow: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  ownBubble: {
    backgroundColor: '#245b7b',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomLeftRadius: 4,
  },
  ownText: {
    color: '#fff',
  },
  otherText: {
    color: '#111827',
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
});
