import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeLeft } from './TimeLeft';
import { useTheme } from '@/providers/ThemeProvider';

interface SimpleChatHeaderProps {
  chatroomName: string;
  memberCount: number;
  timeLeft: string;
  onBack: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function SimpleChatHeader({ chatroomName, memberCount, timeLeft, onBack, onMenuClick, showMenuButton = true }: SimpleChatHeaderProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDark ? colors['shelivery-card-background'] : '#fff',
        borderBottomColor: colors['shelivery-card-border'],
      },
    ]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors['shelivery-text-secondary']} />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors['shelivery-text-primary'] }]} numberOfLines={1}>
          {chatroomName}
        </Text>
        <View style={styles.details}>
          <Text style={[styles.detailText, { color: colors['shelivery-text-tertiary'] }]}>
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </Text>
          <TimeLeft expireAt={timeLeft} />
        </View>
      </View>

      {showMenuButton && onMenuClick && (
        <TouchableOpacity onPress={onMenuClick} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors['shelivery-text-secondary']} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4, marginRight: 12 },
  infoContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  details: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 2 },
  detailText: { fontSize: 12 },
  menuButton: { padding: 4, marginLeft: 12 },
});
