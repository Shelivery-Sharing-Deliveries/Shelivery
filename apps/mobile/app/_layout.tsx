import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";
import { View } from 'react-native';
import { Navigation } from "../components/ui/Navigation";
import { colors } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";
import { useExpoPushNotifications } from "@/hooks/useExpoPushNotifications";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user } = useAuth();
  useExpoPushNotifications(user?.id ?? null);

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    // Blue shell – screens render on top of this; each screen wraps itself
    // in <PageLayout> which provides the white rounded card.
    <View style={{ flex: 1, backgroundColor: colors['shelivery-primary-blue'] }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="alpha" options={{ headerShown: false }} />
        <Stack.Screen name="choose-shop" options={{ headerShown: false }} />
      </Stack>
      {/* Floating pill navigation bar – absolutely positioned over all screens */}
      <Navigation />
    </View>
  );
}
