import { Stack } from "expo-router";

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="stores" options={{ headerShown: false }} />
      <Stack.Screen name="chatrooms" options={{ headerShown: false }} />
    </Stack>
  );
}
