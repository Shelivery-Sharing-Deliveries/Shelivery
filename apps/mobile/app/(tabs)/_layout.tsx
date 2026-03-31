import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";
import { useState } from "react";
import { IconSymbol, getNavIconName } from "@/components/ui";
import { colors } from "@/lib/theme";

function CustomTabBar(props: any) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const navItems = [
    {
      name: "Dashboard",
      route: "dashboard",
      iconName: getNavIconName("dashboard"),
    },
    {
      name: "Stores",
      route: "stores",
      iconName: getNavIconName("stores"),
    },
    {
      name: "Chatrooms",
      route: "chatrooms",
      iconName: getNavIconName("chatrooms"),
    },
  ];

  const isActive = (route: string) => {
    return pathname === `/(tabs)/${route}` || pathname.startsWith(`/(tabs)/${route}/`);
  };

  return (
    <View 
      style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}
    >
      <View style={styles.navItemsContainer}>
        {navItems.map((item) => {
          const active = isActive(item.route);
          const tabActive = activeTab === item.name;
          const iconColor = active || tabActive ? colors['shelivery-primary-yellow'] : 'white';
          
          return (
            <TouchableOpacity
              key={item.name}
              style={styles.navItem}
              onPressIn={() => setActiveTab(item.name)}
              onPressOut={() => setActiveTab(null)}
              activeOpacity={0.7}
            >
              {/* Icon */}
              <View style={[styles.iconWrapper, (active || tabActive) && styles.iconWrapperActive]}>
                <IconSymbol
                  name={item.iconName}
                  size={24}
                  color={iconColor}
                />
                
                {/* Active indicator glow */}
                {active && (
                  <View style={styles.activeIndicatorGlow} />
                )}
              </View>

              {/* Text */}
              <Text 
                style={[styles.navItemText, (active || tabActive) ? styles.navItemTextActive : styles.navItemTextInactive]}
              >
                {item.name}
              </Text>

              {/* Active indicator bar */}
              {active && (
                <View style={styles.activeIndicatorBar} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="stores" options={{ title: "Stores" }} />
      <Tabs.Screen name="chatrooms" options={{ title: "Chatrooms" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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

