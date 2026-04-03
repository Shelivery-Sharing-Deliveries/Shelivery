
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type TabType = 'general' | 'preferences' | 'notifications';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        onPress={() => onTabChange('general')}
        style={[styles.tabButton, activeTab === 'general' ? styles.activeTabButton : {}]}
      >
        <Text style={[styles.tabText, activeTab === 'general' ? styles.activeTabText : {}]}>
          General
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onTabChange('preferences')}
        style={[styles.tabButton, activeTab === 'preferences' ? styles.activeTabButton : {}]}
      >
        <Text style={[styles.tabText, activeTab === 'preferences' ? styles.activeTabText : {}]}>
          Preferences
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onTabChange('notifications')}
        style={[styles.tabButton, activeTab === 'notifications' ? styles.activeTabButton : {}]}
      >
        <Text style={[styles.tabText, activeTab === 'notifications' ? styles.activeTabText : {}]}>
          Notifications
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E5E8EB', // gray-200
    marginBottom: 24, // mb-6
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12, // py-3
    paddingHorizontal: 16, // px-4
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#6B7280', // gray-500
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderColor: '#FFDB0D',
  },
  activeTabText: {
    color: '#FFDB0D',
  },
});
