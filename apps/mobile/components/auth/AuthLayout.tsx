import { ReactNode, useMemo } from "react";
import { View, StyleSheet, SafeAreaView, Image } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { ThemeColors } from "@/lib/theme";

interface AuthLayoutProps {
  children: ReactNode;
  showLogo?: boolean;
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // Transparent so PageLayout's card background shows through
      backgroundColor: "transparent",
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    logoContainer: {
      marginBottom: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    logo: {
      width: 80,
      height: 92,
    },
    inner: {
      width: "100%",
      maxWidth: 343,
    },
  });

export default function AuthLayout({
  children,
  showLogo = true,
}: AuthLayoutProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {showLogo && (
          <View style={styles.logoContainer}>
            <Image
              source={require("../../public/icons/shelivery-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}
        <View style={styles.inner}>{children}</View>
      </View>
    </SafeAreaView>
  );
}
