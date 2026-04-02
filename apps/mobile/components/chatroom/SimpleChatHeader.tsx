import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeLeft } from './TimeLeft';

interface SimpleChatHeaderProps {
  chatroomName: string;
  memberCount: number;
  timeLeft: string;
  onBack: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function SimpleChatHeader({
  chatroomName,
  memberCount,
  timeLeft,
  onBack,
  onMenuClick,
  showMenuButton = true,
}: SimpleChatHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{chatroomName}</Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </Text>
          <TimeLeft expireAt={timeLeft} />
        </View>
      </View>

      {showMenuButton && onMenuClick && (
        <TouchableOpacity onPress={onMenuClick} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#374151" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 2,
  },
  detailText: {
    fontSize: 12,
    color: '#4b5563',
  },
  menuButton: {
    padding: 4,
    marginLeft: 12,
  },
});
