import { createTamagui, createTokens } from 'tamagui'
import { createInterFont } from '@tamagui/font-inter'

// Import our existing design tokens from theme.ts
import { colors, spacing, borderRadius, fontSizes, fontWeights } from './lib/theme'

// Create font configuration
const headingFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 30,
    8: 36,
    9: 48,
    10: 60,
    11: 72,
  },
  weight: {
    1: '400',
    2: '500',
    3: '600',
    4: '700',
  },
})

const bodyFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
  },
  weight: {
    1: '400',
    2: '500',
    3: '600',
  },
})

// Create tokens based on our existing design system
const tokens = createTokens({
  color: {
    // Shelivery Design System Colors
    'shelivery-primary-yellow': colors['shelivery-primary-yellow'],
    'shelivery-primary-blue': colors['shelivery-primary-blue'],
    'shelivery-background-gray': colors['shelivery-background-gray'],
    'shelivery-card-background': colors['shelivery-card-background'],
    'shelivery-card-border': colors['shelivery-card-border'],
    'shelivery-button-secondary-bg': colors['shelivery-button-secondary-bg'],
    'shelivery-button-secondary-border': colors['shelivery-button-secondary-border'],
    'shelivery-text-primary': colors['shelivery-text-primary'],
    'shelivery-text-secondary': colors['shelivery-text-secondary'],
    'shelivery-text-tertiary': colors['shelivery-text-tertiary'],
    'shelivery-text-disabled': colors['shelivery-text-disabled'],
    'shelivery-warning-orange': colors['shelivery-warning-orange'],
    'shelivery-error-red': colors['shelivery-error-red'],
    'shelivery-success-green': colors['shelivery-success-green'],
    
    // Utility colors
    white: colors.white,
    black: colors.black,
    transparent: colors.transparent,
    
    // Tamagui default color tokens mapped to our colors
    background: colors['shelivery-background-gray'],
    backgroundHover: colors['shelivery-card-border'],
    backgroundPress: colors['shelivery-button-secondary-border'],
    backgroundFocus: colors['shelivery-button-secondary-border'],
    backgroundStrong: colors['shelivery-primary-blue'],
    backgroundTransparent: colors.transparent,
    
    color: colors['shelivery-text-primary'],
    colorHover: colors['shelivery-text-secondary'],
    colorPress: colors['shelivery-text-primary'],
    colorFocus: colors['shelivery-text-primary'],
    colorTransparent: colors.transparent,
    
    borderColor: colors['shelivery-card-border'],
    borderColorHover: colors['shelivery-button-secondary-border'],
    borderColorPress: colors['shelivery-primary-yellow'],
    borderColorFocus: colors['shelivery-primary-yellow'],
    
    placeholderColor: colors['shelivery-text-tertiary'],
    
    // Component-specific colors
    primary: colors['shelivery-primary-yellow'],
    primaryHover: '#FFE766',
    primaryPress: '#FFD700',
    primaryFocus: '#FFD700',
    
    secondary: colors['shelivery-button-secondary-bg'],
    secondaryHover: '#FFEF95',
    secondaryPress: '#FFE766',
    secondaryFocus: '#FFE766',
  },
  
  space: {
    // Map our spacing tokens to Tamagui space scale
    0: 0,
    1: spacing['shelivery-1'],
    2: spacing['shelivery-2'],
    3: spacing['shelivery-3'],
    4: spacing['shelivery-4'],
    5: spacing['shelivery-5'],
    6: spacing['shelivery-6'],
    8: spacing['shelivery-8'],
    10: spacing['shelivery-10'],
    true: spacing['shelivery-4'], // default
  },
  
  size: {
    // Map sizes for components
    0: 0,
    1: spacing['shelivery-1'],
    2: spacing['shelivery-2'],
    3: spacing['shelivery-3'],
    4: spacing['shelivery-4'],
    5: spacing['shelivery-5'],
    6: spacing['shelivery-6'],
    8: spacing['shelivery-8'],
    10: spacing['shelivery-10'],
    true: spacing['shelivery-4'], // default
  },
  
  radius: {
    // Map our borderRadius tokens
    0: 0,
    1: borderRadius['shelivery-sm'],
    2: borderRadius['shelivery-md'],
    3: borderRadius['shelivery-lg'],
    4: borderRadius['shelivery-xl'],
    5: borderRadius['shelivery-full'],
    true: borderRadius['shelivery-md'], // default
  },
  
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
})

// Create the Tamagui configuration
export const tamaguiConfig = createTamagui({
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens,
  themes: {
    light: {
      // Map token colors to theme
      background: tokens.color.background,
      backgroundHover: tokens.color.backgroundHover,
      backgroundPress: tokens.color.backgroundPress,
      backgroundFocus: tokens.color.backgroundFocus,
      backgroundStrong: tokens.color.backgroundStrong,
      backgroundTransparent: tokens.color.backgroundTransparent,
      
      color: tokens.color.color,
      colorHover: tokens.color.colorHover,
      colorPress: tokens.color.colorPress,
      colorFocus: tokens.color.colorFocus,
      colorTransparent: tokens.color.colorTransparent,
      
      borderColor: tokens.color.borderColor,
      borderColorHover: tokens.color.borderColorHover,
      borderColorPress: tokens.color.borderColorPress,
      borderColorFocus: tokens.color.borderColorFocus,
      
      placeholderColor: tokens.color.placeholderColor,
      
      // Custom theme colors
      primary: tokens.color.primary,
      primaryHover: tokens.color.primaryHover,
      primaryPress: tokens.color.primaryPress,
      primaryFocus: tokens.color.primaryFocus,
      
      secondary: tokens.color.secondary,
      secondaryHover: tokens.color.secondaryHover,
      secondaryPress: tokens.color.secondaryPress,
      secondaryFocus: tokens.color.secondaryFocus,
    },
    dark: {
      // Minimal dark theme so Tamagui can always resolve the "dark" theme state.
      // (We reuse the existing brand palette; adjust later if needed.)
      background: colors.black,
      backgroundHover: colors['shelivery-card-border'],
      backgroundPress: colors['shelivery-button-secondary-border'],
      backgroundFocus: colors['shelivery-button-secondary-border'],
      backgroundStrong: colors['shelivery-primary-blue'],
      backgroundTransparent: colors.transparent,
      
      color: colors.white,
      colorHover: colors.white,
      colorPress: colors.white,
      colorFocus: colors.white,
      colorTransparent: colors.transparent,
      
      borderColor: colors['shelivery-card-border'],
      borderColorHover: colors['shelivery-button-secondary-border'],
      borderColorPress: colors['shelivery-primary-yellow'],
      borderColorFocus: colors['shelivery-primary-yellow'],
      
      placeholderColor: colors['shelivery-text-tertiary'],
      
      // Custom theme colors
      primary: tokens.color.primary,
      primaryHover: tokens.color.primaryHover,
      primaryPress: tokens.color.primaryPress,
      primaryFocus: tokens.color.primaryFocus,
      
      secondary: tokens.color.secondary,
      secondaryHover: tokens.color.secondaryHover,
      secondaryPress: tokens.color.secondaryPress,
      secondaryFocus: tokens.color.secondaryFocus,
    },
  },
  media: {
    // Responsive breakpoints
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
  shorthands: {
    // Define common shorthands
    p: 'padding',
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    pt: 'paddingTop',
    pb: 'paddingBottom',
    pl: 'paddingLeft',
    pr: 'paddingRight',
    
    m: 'margin',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    mt: 'marginTop',
    mb: 'marginBottom',
    ml: 'marginLeft',
    mr: 'marginRight',
    
    bg: 'backgroundColor',
    bc: 'borderColor',
    br: 'borderRadius',
    bw: 'borderWidth',
  },
})

export default tamaguiConfig

// TypeScript type helpers
export type AppConfig = typeof tamaguiConfig
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}