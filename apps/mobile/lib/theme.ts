// Design tokens for Shelivery mobile app
// Extracted from src/styles/globals.css and tailwind.config.js

export const colors = {
  // Shelivery Design System
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
  'shelivery-badge-waiting': '#FFDB0D', // Example color, adjust as needed
  'shelivery-badge-ordering': '#245B7B', // Example color, adjust as needed
  'shelivery-badge-delivered': '#34C759', // Example color, adjust as needed
  'shelivery-shadow-color': '#000', // Example color, adjust as needed
  'shelivery-border-gray': '#E5E8EB', // Example color, adjust as needed
  'shelivery-error-red-bg': '#FEF3F2', // Example color, adjust as needed
  'shelivery-button-secondary-text': '#175CD3', // Example color, adjust as needed

  // Shadcn/ui colors (from globals.css)
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  'card-foreground': 'hsl(var(--card-foreground))',
  popover: 'hsl(var(--popover))',
  'popover-foreground': 'hsl(var(--popover-foreground))',
  primary: 'hsl(var(--primary))',
  'primary-foreground': 'hsl(var(--primary-foreground))',
  secondary: 'hsl(var(--secondary))',
  'secondary-foreground': 'hsl(var(--secondary-foreground))',
  muted: 'hsl(var(--muted))',
  'muted-foreground': 'hsl(var(--muted-foreground))',
  accent: 'hsl(var(--accent))',
  'accent-foreground': 'hsl(var(--accent-foreground))',
  destructive: 'hsl(var(--destructive))',
  'destructive-foreground': 'hsl(var(--destructive-foreground))',
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',

  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

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

// Helper function to create rgba colors
export const rgba = (color: string, opacity: number) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Component-specific style helpers
export const componentStyles = {
  // Navigation Bar
  navbar: {
    backgroundColor: colors['shelivery-primary-blue'],
    borderRadius: borderRadius['shelivery-md'],
    padding: spacing['shelivery-4'],
  },
  
  // Avatar Component
  avatar: {
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors['shelivery-primary-yellow'],
  },
  
  // Basket Cards
  basketCard: {
    backgroundColor: colors['shelivery-card-background'],
    borderWidth: 1,
    borderColor: colors['shelivery-card-border'],
    borderRadius: borderRadius['shelivery-md'],
    padding: spacing['shelivery-4'],
    ...shadows['shelivery-md'],
  },
  
  // Progress Bar
  progressBar: {
    backgroundColor: colors['shelivery-card-border'],
    borderRadius: borderRadius['shelivery-sm'],
    height: 16,
    overflow: 'hidden',
  },
  
  // Buttons
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
  
  // Status Badges
  badge: {
    borderRadius: borderRadius['shelivery-full'],
    paddingHorizontal: spacing['shelivery-2'],
    paddingVertical: spacing['shelivery-1'],
  },
  
  // Text Fields
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#9CA3AF', // gray-400
    borderRadius: borderRadius['shelivery-lg'],
    paddingHorizontal: spacing['shelivery-4'],
    paddingVertical: spacing['shelivery-3'],
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  fontFamilies,
  fontSizes,
  fontWeights,
  shadows,
  rgba,
  componentStyles,
};