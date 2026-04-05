// Design tokens for Shelivery mobile app
// Extracted from src/styles/globals.css and tailwind.config.js

// ─── Light Mode Palette ───────────────────────────────────────────────────────

export const lightColors = {
  // Shelivery Design System – Light
  'shelivery-primary-yellow': '#FFDB0D',
  'shelivery-primary-blue': '#245B7B',
  'shelivery-background-gray': '#EAE4E4',
  'shelivery-card-background': '#FFFADF',
  'shelivery-card-border': '#E5E8EB',
  'shelivery-button-secondary-bg': '#FFF5C0',
  'shelivery-button-secondary-border': '#FFEF95',
  'shelivery-text-primary': '#1A1A1A',
  'shelivery-text-secondary': '#374151',
  'shelivery-text-tertiary': '#6B7280',
  'shelivery-text-disabled': '#D5D7DA',
  'shelivery-warning-orange': '#FF9500',
  'shelivery-error-red': '#FF3B30',
  'shelivery-success-green': '#34C759',
  'shelivery-badge-red-bg': '#FEF3F2',
  'shelivery-badge-red-border': '#FFECEE',
  'shelivery-badge-red-text': '#B42318',
  'shelivery-badge-blue-bg': '#EFF8FF',
  'shelivery-badge-blue-border': '#D8F0FE',
  'shelivery-badge-blue-text': '#175CD3',
  'shelivery-badge-green-bg': '#ECFDF3',
  'shelivery-badge-green-border': '#D1FADF',
  'shelivery-badge-green-text': '#027A48',
  'shelivery-badge-waiting': '#FFDB0D',
  'shelivery-badge-ordering': '#245B7B',
  'shelivery-badge-delivered': '#34C759',
  'shelivery-shadow-color': '#000',
  'shelivery-border-gray': '#E5E8EB',
  'shelivery-error-red-bg': '#FEF3F2',
  'shelivery-button-secondary-text': '#175CD3',

  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// ─── Dark Mode Palette ────────────────────────────────────────────────────────
// Designed to complement the Shelivery brand:
//  • Deep navy replaces the light grays → feels premium and immersive
//  • Yellow accent stays identical (great contrast on dark surfaces)
//  • Blue primary shifts darker so it still reads as "Shelivery blue"
//  • Text hierarchy flips: near-white → light-blue-gray → muted slate

export const darkColors = {
  // Shelivery Design System – Dark
  'shelivery-primary-yellow': '#FFDB0D',       // Unchanged – stands out beautifully on dark
  'shelivery-primary-blue': '#1B4A64',         // Slightly darker blue for surfaces/shell
  'shelivery-background-gray': '#0F1923',      // Very deep navy, almost black – main background
  'shelivery-card-background': '#182534',      // Dark blue-tinted card surface
  'shelivery-card-border': '#2A3F52',          // Subtle border on dark cards
  'shelivery-button-secondary-bg': '#1E3144',  // Dark muted blue for secondary buttons
  'shelivery-button-secondary-border': '#2E4A62', // Secondary button border
  'shelivery-text-primary': '#EDF2F7',         // Near-white, easy to read
  'shelivery-text-secondary': '#A8BFCC',       // Light blue-gray for secondary text
  'shelivery-text-tertiary': '#6A8FA4',        // Muted slate for hints/placeholders
  'shelivery-text-disabled': '#344F62',        // Very muted for disabled states
  'shelivery-warning-orange': '#FF9F0A',       // Slightly warmer orange for dark bg
  'shelivery-error-red': '#FF453A',            // iOS-style vivid red on dark
  'shelivery-success-green': '#30D158',        // iOS-style vivid green on dark
  'shelivery-badge-red-bg': '#2D1A1A',
  'shelivery-badge-red-border': '#4A2222',
  'shelivery-badge-red-text': '#FF6B6B',
  'shelivery-badge-blue-bg': '#162130',
  'shelivery-badge-blue-border': '#1F3347',
  'shelivery-badge-blue-text': '#5BA8E0',
  'shelivery-badge-green-bg': '#0F2A1E',
  'shelivery-badge-green-border': '#1A4030',
  'shelivery-badge-green-text': '#4ADE80',
  'shelivery-badge-waiting': '#FFDB0D',
  'shelivery-badge-ordering': '#5BA8E0',
  'shelivery-badge-delivered': '#30D158',
  'shelivery-shadow-color': '#000',
  'shelivery-border-gray': '#2A3F52',
  'shelivery-error-red-bg': '#2D1A1A',
  'shelivery-button-secondary-text': '#5BA8E0',

  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Default export (light) – kept for backwards compat with direct imports
export const colors = lightColors;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  'shelivery-1': 4,
  'shelivery-2': 8,
  'shelivery-3': 12,
  'shelivery-4': 16,
  'shelivery-5': 20,
  'shelivery-6': 24,
  'shelivery-8': 32,
  'shelivery-10': 40,
};

export const borderRadius = {
  'shelivery-sm': 8,
  'shelivery-md': 16,
  'shelivery-lg': 20,
  'shelivery-xl': 30,
  'shelivery-full': 100,
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)',
};

export const fontFamilies = {
  poppins: 'Poppins',
  inter: 'Inter',
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const shadows = {
  'shelivery-sm': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  'shelivery-md': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  'shelivery-lg': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a hex color to rgba string */
export const rgba = (color: string, opacity: number) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// ─── Component-specific style helpers (light, for backwards compat) ───────────

export const componentStyles = {
  navbar: {
    backgroundColor: colors['shelivery-primary-blue'],
    borderRadius: borderRadius['shelivery-md'],
    padding: spacing['shelivery-4'],
  },
  avatar: {
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors['shelivery-primary-yellow'],
  },
  basketCard: {
    backgroundColor: colors['shelivery-card-background'],
    borderWidth: 1,
    borderColor: colors['shelivery-card-border'],
    borderRadius: borderRadius['shelivery-md'],
    padding: spacing['shelivery-4'],
    ...shadows['shelivery-md'],
  },
  progressBar: {
    backgroundColor: colors['shelivery-card-border'],
    borderRadius: borderRadius['shelivery-sm'],
    height: 16,
    overflow: 'hidden',
  },
  buttonPrimary: {
    backgroundColor: colors['shelivery-primary-yellow'],
    borderRadius: borderRadius['shelivery-md'],
    paddingHorizontal: spacing['shelivery-6'],
    paddingVertical: spacing['shelivery-3'],
  },
  buttonSecondary: {
    backgroundColor: colors['shelivery-button-secondary-bg'],
    borderWidth: 1,
    borderColor: colors['shelivery-button-secondary-border'],
    borderRadius: borderRadius['shelivery-sm'],
    paddingHorizontal: spacing['shelivery-4'],
    paddingVertical: spacing['shelivery-2'],
  },
  badge: {
    borderRadius: borderRadius['shelivery-full'],
    paddingHorizontal: spacing['shelivery-2'],
    paddingVertical: spacing['shelivery-1'],
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: borderRadius['shelivery-lg'],
    paddingHorizontal: spacing['shelivery-4'],
    paddingVertical: spacing['shelivery-3'],
  },
};

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof lightColors;

/** Returns the full color palette for the given scheme */
export const getColors = (scheme: ColorScheme): ThemeColors =>
  scheme === 'dark' ? darkColors : lightColors;

export default {
  colors,
  lightColors,
  darkColors,
  spacing,
  borderRadius,
  fontFamilies,
  fontSizes,
  fontWeights,
  shadows,
  rgba,
  componentStyles,
  getColors,
};
