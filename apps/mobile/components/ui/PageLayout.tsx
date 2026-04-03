import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';

interface PageLayoutProps {
  children: React.ReactNode;
  /** Optional header rendered at the top of the white card (e.g. back button + title) */
  header?: React.ReactNode;
  /** Kept for API compatibility – navigation lives in the root layout */
  showNavigation?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, header }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.outer,
        {
          // Push content below the status bar + a small gap
          paddingTop: insets.top + 8,
        },
      ]}
    >
      {/* White rounded card */}
      <View style={styles.card}>
        {/* Optional header row (back arrow + title, etc.) */}
        {header && (
          <View style={styles.headerWrapper}>
            {header}
          </View>
        )}

        {/* Page content – padded so nothing hugs the card edges */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors['shelivery-primary-blue'], // #245B7B
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  headerWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E8EB',
  },
  content: {
    flex: 1,
    // Provides breathing room so content never hugs the card edges
    padding: 16,
  },
});

export default PageLayout;
