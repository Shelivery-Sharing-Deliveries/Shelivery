/**
 * ThemeProvider – Shelivery dark/light mode system
 *
 * How it works:
 *  1. Reads the OS color scheme via React Native's `useColorScheme` hook.
 *  2. Exposes a `colorScheme` value ('light' | 'dark') and a full `colors`
 *     palette that matches the active scheme.
 *  3. Optionally allows the user to override the OS preference in-app via
 *     `setColorScheme`.  The override is persisted with AsyncStorage so it
 *     survives app restarts.
 *
 * Usage in any component:
 *
 *   import { useTheme } from '@/providers/ThemeProvider';
 *
 *   const { colors, colorScheme, isDark, toggleColorScheme } = useTheme();
 *
 *   <View style={{ backgroundColor: colors['shelivery-card-background'] }} />
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getColors,
  lightColors,
  ColorScheme,
  ThemeColors,
} from '@/lib/theme';

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = '@shelivery/color-scheme-override';

// ─── Context types ────────────────────────────────────────────────────────────

interface ThemeContextValue {
  /** Active color scheme ('light' | 'dark') */
  colorScheme: ColorScheme;
  /** Whether dark mode is currently active */
  isDark: boolean;
  /** The full color palette for the active scheme */
  colors: ThemeColors;
  /**
   * Explicitly set the color scheme.
   * Pass `null` to clear the override and follow the OS preference.
   */
  setColorScheme: (scheme: ColorScheme | null) => void;
  /** Convenience toggle between light and dark */
  toggleColorScheme: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'light',
  isDark: false,
  colors: lightColors,
  setColorScheme: () => {},
  toggleColorScheme: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme(); // 'light' | 'dark' | null/undefined
  // null means "follow the OS"
  const [override, setOverride] = useState<ColorScheme | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted override on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark') {
          setOverride(stored);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  // Resolve the active scheme: override wins, then OS, then 'light'
  const colorScheme: ColorScheme =
    override ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const setColorScheme = useCallback((scheme: ColorScheme | null) => {
    setOverride(scheme);
    if (scheme === null) {
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    } else {
      AsyncStorage.setItem(STORAGE_KEY, scheme).catch(() => {});
    }
  }, []);

  const toggleColorScheme = useCallback(() => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  }, [colorScheme, setColorScheme]);

  // Don't render children until we've read the stored preference,
  // this avoids a brief flash of the wrong theme.
  if (!isLoaded) return null;

  const value: ThemeContextValue = {
    colorScheme,
    isDark: colorScheme === 'dark',
    colors: getColors(colorScheme),
    setColorScheme,
    toggleColorScheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the active theme from any component.
 *
 * @example
 * const { colors, isDark, toggleColorScheme } = useTheme();
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}

export default ThemeProvider;
