import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";
import { useState } from "react";
import { IconSymbol } from "@/components/ui";
import { colors } from "@/lib/theme";
import { navItems, NavItem } from "../../constants/navigation";
import { tabBarStyles as styles } from "../../styles/tabBarStyles";

function CustomTabBar(props: any) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const isActive = (route: string) => {
    return pathname === `/(tabs)/${route}` || pathname.startsWith(`/(tabs)/${route}/`);
  };

  return (
    <View 
      style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}
    >
      <View style={styles.navItemsContainer}>
        {navItems.map((item: NavItem) => {
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
