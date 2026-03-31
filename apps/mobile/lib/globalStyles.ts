import { StyleSheet } from "react-native";
import { colors, spacing, borderRadius, fontFamilies, fontSizes, fontWeights, shadows, rgba } from "./theme";

// Simple global styles without complex type helpers
export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors['shelivery-primary-blue'],
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: spacing['shelivery-4'],
    paddingTop: spacing['shelivery-8'],
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors['shelivery-primary-blue'],
  },

  // Cards
  card: {
    backgroundColor: colors['shelivery-card-background'],
    borderWidth: 1,
    borderColor: colors['shelivery-card-border'],
    borderRadius: borderRadius['shelivery-md'],
    padding: spacing['shelivery-4'],
    ...shadows['shelivery-md'],
  },
  cardTransparent: {
    backgroundColor: rgba(colors.white, 0.1),
    borderRadius: borderRadius['shelivery-lg'],
    padding: spacing['shelivery-6'],
    marginBottom: spacing['shelivery-6'],
  },
  cardYellow: {
    backgroundColor: colors['shelivery-primary-yellow'],
    borderRadius: borderRadius['shelivery-lg'],
    padding: spacing['shelivery-6'],
    marginBottom: spacing['shelivery-8'],
  },

  // Typography
  heading1: {
    fontSize: fontSizes['3xl'],
    fontWeight: 'bold' as const,
    color: colors.white,
    fontFamily: fontFamilies.poppins,
  },
  heading2: {
    fontSize: fontSizes['2xl'],
    fontWeight: '600' as const,
    color: colors.white,
    fontFamily: fontFamilies.poppins,
    marginBottom: spacing['shelivery-4'],
  },
  heading3: {
    fontSize: fontSizes.xl,
    fontWeight: '600' as const,
    color: colors.white,
    fontFamily: fontFamilies.poppins,
    marginBottom: spacing['shelivery-3'],
  },
  body: {
    fontSize: fontSizes.base,
    color: rgba(colors.white, 0.8),
    fontFamily: fontFamilies.inter,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    color: rgba(colors.white, 0.7),
    fontFamily: fontFamilies.inter,
    lineHeight: 20,
  },
  bodyXSmall: {
    fontSize: fontSizes.xs,
    color: rgba(colors.white, 0.6),
    fontFamily: fontFamilies.inter,
    lineHeight: 16,
  },
  bodyBlue: {
    fontSize: fontSizes.base,
    color: rgba(colors['shelivery-primary-blue'], 0.9),
    fontFamily: fontFamilies.inter,
    lineHeight: 24,
  },

  // Buttons
  buttonBase: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: borderRadius['shelivery-md'],
  },
  buttonPrimary: {
    backgroundColor: colors['shelivery-primary-yellow'],
    paddingHorizontal: spacing['shelivery-6'],
    paddingVertical: spacing['shelivery-3'],
  },
  buttonSecondary: {
    backgroundColor: colors['shelivery-button-secondary-bg'],
    borderWidth: 1,
    borderColor: colors['shelivery-button-secondary-border'],
    paddingHorizontal: spacing['shelivery-4'],
    paddingVertical: spacing['shelivery-2'],
  },

  // Forms
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#9CA3AF', // gray-400
    borderRadius: borderRadius['shelivery-lg'],
    paddingHorizontal: spacing['shelivery-4'],
    paddingVertical: spacing['shelivery-3'],
    fontSize: fontSizes.base,
    fontFamily: fontFamilies.inter,
  },

  // Layout helpers
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  column: {
    flexDirection: 'column' as const,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  spaceBetween: {
    justifyContent: 'space-between' as const,
  },
  spaceAround: {
    justifyContent: 'space-around' as const,
  },
  flexWrap: {
    flexWrap: 'wrap' as const,
  },

  // Spacing utilities (can be used with array syntax: [globalStyles.mb2, globalStyles.mt3])
  mb1: { marginBottom: spacing['shelivery-1'] },
  mb2: { marginBottom: spacing['shelivery-2'] },
  mb3: { marginBottom: spacing['shelivery-3'] },
  mb4: { marginBottom: spacing['shelivery-4'] },
  mb6: { marginBottom: spacing['shelivery-6'] },
  mb8: { marginBottom: spacing['shelivery-8'] },
  mt1: { marginTop: spacing['shelivery-1'] },
  mt2: { marginTop: spacing['shelivery-2'] },
  mt3: { marginTop: spacing['shelivery-3'] },
  mt4: { marginTop: spacing['shelivery-4'] },
  ml1: { marginLeft: spacing['shelivery-1'] },
  ml2: { marginLeft: spacing['shelivery-2'] },
  ml3: { marginLeft: spacing['shelivery-2'] },
  mr1: { marginRight: spacing['shelivery-1'] },
  mr2: { marginRight: spacing['shelivery-2'] },
  mr3: { marginRight: spacing['shelivery-3'] },
  p1: { padding: spacing['shelivery-1'] },
  p2: { padding: spacing['shelivery-2'] },
  p3: { padding: spacing['shelivery-3'] },
  p4: { padding: spacing['shelivery-4'] },
  px2: { paddingHorizontal: spacing['shelivery-2'] },
  px4: { paddingHorizontal: spacing['shelivery-4'] },
  py2: { paddingVertical: spacing['shelivery-2'] },
  py3: { paddingVertical: spacing['shelivery-3'] },

  // Grid
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing['shelivery-4'],
  },
  gridItem: {
    flex: 1,
    minWidth: '48%', // For 2-column grid
  },
});

// Simple helper to merge styles (for when you need to combine)
export const mergeStyles = (...styles: any[]) => {
  return styles.filter(Boolean).reduce((acc, style) => {
    if (Array.isArray(style)) {
      return { ...acc, ...mergeStyles(...style) };
    }
    if (typeof style === 'object') {
      return { ...acc, ...style };
    }
    return acc;
  }, {});
};

// Common style combinations
export const commonStyles = {
  cardWithShadow: mergeStyles(globalStyles.card, shadows['shelivery-md']),
  headingWithMargin: mergeStyles(globalStyles.heading2, { marginBottom: spacing['shelivery-4'] }),
  containerWithPadding: mergeStyles(globalStyles.container, { padding: spacing['shelivery-4'] }),
  rowCenter: mergeStyles(globalStyles.row, globalStyles.center),
  rowSpaceBetween: mergeStyles(globalStyles.row, globalStyles.spaceBetween),
};

export default globalStyles;