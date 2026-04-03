import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showNavigation?: boolean;
  className?: string;
  flat?: boolean;
}

export default function PageLayout({
  children,
  header,
  footer,
  showNavigation = true,
  className = "",
  flat = false
}: PageLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { height: showNavigation && !footer ? 'calc(100vh - 148px)' : '100vh' }]}>
        {header && (
          <View style={[styles.header, flat ? {} : styles.headerShadow]}>
            {header}
          </View>
        )}
        <View style={[styles.content, header ? {} : styles.contentNoHeader, footer ? styles.contentWithFooter : styles.contentNoFooter, { flex: 1 }, { paddingHorizontal: 16 }]}>
          {children}
        </View>
        {footer && (
          <View style={styles.footer}>
            {footer}
          </View>
        )}
      </View>
      {/* Navigation will be handled by the main app layout, not here */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#245B7B',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 30,
    marginHorizontal: 12.5, // Equivalent to w-[calc(100vw-25px)]
    overflow: 'hidden',
  },
  header: {
    flexShrink: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 18,
    zIndex: 10,
  },
  headerShadow: {
    borderBottomWidth: 1,
    borderColor: '#E5E8EB', // gray-100
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  contentNoHeader: {
    paddingTop: 18,
  },
  contentWithFooter: {
    paddingBottom: 80,
  },
  contentNoFooter: {
    paddingBottom: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
});
