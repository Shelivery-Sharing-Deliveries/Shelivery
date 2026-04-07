import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';

// Base height of the floating Navigation bar (Navigation.tsx: container height = 74 + insets.bottom)
export const NAV_BAR_BASE_HEIGHT = 10;

/**
 * Drop this as the LAST item inside any ScrollView / FlatList that lives inside
 * a PageLayout screen. It adds exactly enough empty space so the last real item
 * can be scrolled above the floating nav bar. It is invisible when the list is
 * not scrolled to the very end.
 */
export function NavBarSpacer() {
  const insets = useSafeAreaInsets();
  return <View style={{ height: NAV_BAR_BASE_HEIGHT + insets.bottom }} />;
}

interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  showNavigation?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, header }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.outer, { paddingTop: insets.top + 8, backgroundColor: colors['shelivery-primary-blue'] }]}>
      <View style={[styles.card, { backgroundColor: isDark ? colors['shelivery-card-background'] : '#FFFFFF' }]}>
        {header && (
          <View style={[styles.headerWrapper, { borderBottomColor: colors['shelivery-card-border'] }]}>
            {header}
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { flex: 1, paddingHorizontal: 12, paddingBottom: 12 },
  card: { flex: 1, borderRadius: 24, overflow: 'hidden' },
  headerWrapper: { borderBottomWidth: StyleSheet.hairlineWidth },
  content: { flex: 1, padding: 16 },
});

export default PageLayout;
