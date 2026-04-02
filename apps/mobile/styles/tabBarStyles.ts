import { StyleSheet } from "react-native";
import { colors } from "../lib/theme";

export const tabBarStyles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: '#245B7B', // shelivery-primary-blue
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)', // border-white/10
  },
  navItemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: 4, // gap-1
  },
  iconWrapper: {
    position: 'relative',
    transform: [{ scale: 1 }],
  },
  iconWrapperActive: {
    transform: [{ scale: 1.1 }],
  },
  activeIndicatorGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 9999, // rounded-full
    backgroundColor: 'rgba(255, 219, 13, 0.3)', // bg-shelivery-primary-yellow/30
    // blur-sm is not directly supported, might need a library or custom implementation
  },
  navItemText: {
    fontSize: 11, // text-[11px]
    fontWeight: '600', // font-semibold
  },
  navItemTextActive: {
    color: '#FFDB0D', // text-shelivery-primary-yellow
  },
  navItemTextInactive: {
    color: 'rgba(255, 255, 255, 0.9)', // text-white/90
  },
  activeIndicatorBar: {
    position: 'absolute',
    bottom: -4, // -bottom-1
    width: 16, // w-4
    height: 2, // h-0.5
    backgroundColor: '#FFDB0D', // bg-shelivery-primary-yellow
    borderRadius: 9999, // rounded-full
  },
});