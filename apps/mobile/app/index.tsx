import { useEffect, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/providers/AuthProvider";
import SheliveryLogo from "../public/icons/shelivery-logo2.svg";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Continuous bounce animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (loading) return;

    // Slight delay for a smooth splash experience before navigating
    const timer = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/auth");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
        <SheliveryLogo width={160} height={160} viewBox="0 0 212 211" />
      </Animated.View>
      <ActivityIndicator
        size="large"
        color="#F5C518"
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#245b7b",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    marginTop: 32,
  },
});
