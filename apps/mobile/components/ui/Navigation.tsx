import { Link, usePathname } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import CategoryBoldIcon from "../../public/icons/navbar/category-bold-icon.svg";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/providers/ThemeProvider';

interface NavigationProps {}

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "category",
  },
  {
    name: "Stores",
    href: "/stores",
    icon: "shop",
  },
  {
    name: "Chatrooms",
    href: "/chatrooms",
    icon: "messages",
  },
];

export function Navigation({}: NavigationProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { isDark } = useTheme();

  // Primary blue RGBA for the nav pill gradient
  // Light: #245B7B = rgb(36, 91, 123)
  // Dark:  #1B4A64 = rgb(27, 74, 100)
  const gradientColors = isDark
    ? (["rgba(27,74,100,0.92)", "rgba(27,74,100,0.97)", "rgba(27,74,100,0.97)", "rgba(27,74,100,0.97)", "rgba(27,74,100,0.92)"] as const)
    : (["rgba(36,91,123,0.9)", "rgba(36,91,123,0.95)", "rgba(36,91,123,0.95)", "rgba(36,91,123,0.95)", "rgba(36,91,123,0.9)"] as const);

  // Hide navigation bar on chatroom detail pages
  if (pathname.startsWith('/chatrooms/')) {
    return null;
  }

  const renderIcon = (iconType: string, isActive: boolean) => {
    const color = isActive ? "#FFDB0D" : "white";

    if (iconType === "category") {
      return <CategoryBoldIcon width={24} height={24} color={color} />;
    } else if (iconType === "shop") {
      return (
        <Svg
          width="21"
          height="22"
          viewBox="0 0 21 22"
          fill="none"
        >
          <Path
            d="M1.45156 10.0628V14.5946C1.45156 19.1264 3.26831 20.9431 7.8001 20.9431H13.2403C17.7721 20.9431 19.5888 19.1264 19.5888 14.5946V10.0628"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M10.5252 10.8501C12.3722 10.8501 13.7348 9.34619 13.5531 7.49916L12.887 0.756981H8.17353L7.49729 7.49916C7.31562 9.34619 8.67818 10.8501 10.5252 10.8501Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M16.8939 10.8501C18.9327 10.8501 20.4265 9.1948 20.2247 7.16609L19.9421 4.39049C19.5787 1.76629 18.5694 0.756981 15.925 0.756981H12.8466L13.5531 7.83223C13.7247 9.49759 15.2286 10.8501 16.8939 10.8501Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M4.10603 10.8501C5.77139 10.8501 7.27526 9.49759 7.43675 7.83223L7.6588 5.60166L8.14326 0.756981H5.06488C2.42049 0.756981 1.41118 1.76629 1.04783 4.39049L0.775316 7.16609C0.573455 9.1948 2.06723 10.8501 4.10603 10.8501Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M10.5252 15.8966C8.83968 15.8966 8.00196 16.7343 8.00196 18.4199V20.9431H13.0485V18.4199C13.0485 16.7343 12.2108 15.8966 10.5252 15.8966Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    } else if (iconType === "messages") {
      return (
        <Svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
        >
          <Path
            d="M17.0933 9.74715V13.834C17.0933 14.0996 17.083 14.3551 17.0524 14.6003C16.8174 17.3589 15.1929 18.728 12.1993 18.728H11.7906C11.5351 18.728 11.2899 18.8506 11.1367 19.0549L9.91063 20.6897C9.36912 21.4151 8.49043 21.4151 7.94892 20.6897L6.72286 19.0549C6.59003 18.8812 6.29375 18.728 6.06898 18.728H5.6603C2.40103 18.728 0.766285 17.9209 0.766285 13.834V9.74715C0.766285 6.75353 2.14561 5.12901 4.89401 4.89401C5.13922 4.86336 5.39465 4.85314 5.6603 4.85314H12.1993C15.4585 4.85314 17.0933 6.48788 17.0933 9.74715Z"
            stroke={color}
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M21.1801 5.6603V9.74715C21.1801 12.751 19.8008 14.3653 17.0524 14.6003C17.0831 14.3551 17.0933 14.0996 17.0933 13.834V9.74715C17.0933 6.48788 15.4585 4.85314 12.1993 4.85314H5.66033C5.39468 4.85314 5.13926 4.86336 4.89404 4.89401C5.12904 2.14561 6.75356 0.766285 9.74718 0.766285H16.2861C19.5454 0.766285 21.1801 2.40103 21.1801 5.6603Z"
            stroke={color}
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12.5114 12.2606H12.5206"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M8.93539 12.2606H8.94458"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M5.35939 12.2606H5.36859"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    }

    return null;
  };

  return (
    <View
      style={[styles.container, { height: 74 + insets.bottom }]}
      pointerEvents="box-none"
    >
      <View style={[styles.navigationWrapper, { paddingBottom: insets.bottom }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.navItemsContainer}>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/") ||
                (item.href === "/alpha" && pathname === "/choose-shop");

              return (
                <Link
                  key={item.name}
                  href={item.href as any}
                  onPressIn={() => setActiveTab(item.name)}
                  onPressOut={() => setActiveTab(null)}
                  style={styles.navItem}
                  asChild
                >
                  <TouchableOpacity>
                    <View
                      style={[
                        styles.iconContainer,
                        (isActive || activeTab === item.name) && styles.iconContainerActive,
                      ]}
                    >
                      {renderIcon(item.icon, isActive)}
                      {isActive && <View style={styles.activeGlow} />}
                    </View>

                    <Text
                      style={[
                        styles.navItemText,
                        (isActive || activeTab === item.name) && styles.navItemTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>

                    {isActive && <View style={styles.activeIndicatorBar} />}
                  </TouchableOpacity>
                </Link>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  navigationWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    paddingTop: 24,
    paddingBottom: 8,
  },
  gradientBackground: {
    backgroundColor: "transparent",
    borderRadius: 50,
    alignSelf: "center",
    width: "90%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 12, // For Android shadow
    minHeight: 74,
    paddingHorizontal: 32,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 45,
    overflow: "hidden",
  },
  navItemsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 45,
  },
  navItem: {
    position: "relative",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  iconContainer: {
    position: "relative",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: {
    width: 24,
    height: 24,
  },
  activeGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 9999, // rounded-full
    backgroundColor: "rgba(255, 219, 13, 0.22)",
    opacity: 0.8,
    // blur-md is hard to replicate directly with StyleSheet, might need expo-blur
  },
  navItemText: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  navItemTextActive: {
    color: "#FFDB0D",
    transform: [{ scale: 1.05 }],
    textShadowColor: "rgba(255, 219, 13, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  activeIndicatorBar: {
    position: "absolute",
    bottom: -4,
    left: "50%",
    width: 4,
    height: 4,
    backgroundColor: "#FFDB0D",
    borderRadius: 9999, // rounded-full
    transform: [{ translateX: -2 }], // half of width to center
  },
});
