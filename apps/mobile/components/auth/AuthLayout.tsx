import { ReactNode } from "react";
import { View, StyleSheet, SafeAreaView, Image } from "react-native";
import { colors } from "@/lib/theme";

interface AuthLayoutProps {
  children: ReactNode;
  showLogo?: boolean;
}

export default function AuthLayout({
  children,
  showLogo = true,
}: AuthLayoutProps) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
