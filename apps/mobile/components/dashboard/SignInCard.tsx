import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";
import SheliveryLogo from "../../public/icons/shelivery-logo3.svg";
import { ThemeColors } from "@/lib/theme";
import React from "react";


interface SignInCardProps {
  id?: string;
}
const createStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 18,
    width: "100%",
  },
  imageContainer: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "column",
    gap: 4,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 28,
    color: isDark ? colors['shelivery-text-secondary'] : colors.black,
  },
  signInText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    color: isDark ? colors['shelivery-text-secondary'] : colors['shelivery-text-primary'],
  },
});


export default function SignInCard({ id }: SignInCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const handleSignInClick = () => {
    router.push('/auth' as any);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleSignInClick}
      activeOpacity={0.8}
      accessibilityLabel="Sign in to Shelivery"
    >
      {/* Logo */}
      <View style={styles.imageContainer}>
        <SheliveryLogo width={52} height={52} />
      </View>

      {/* Greeting */}
      <View style={styles.textContainer}>
        <Text style={styles.welcomeText}>
          Welcome to Shelivery!
        </Text>
        <Text style={styles.signInText}>
          Sign in to track your baskets
        </Text>
      </View>
    </TouchableOpacity>
  );
}

