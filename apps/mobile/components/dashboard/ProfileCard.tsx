import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/providers/ThemeProvider";

interface ProfileCardProps {
  userName: string;
  userAvatar: string;
  id?: string;
}

export default function ProfileCard({ userName, userAvatar, id }: ProfileCardProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/profile" as any)}
      activeOpacity={0.8}
      accessibilityLabel={`View profile for ${userName}`}
    >
      <View style={[styles.avatarContainer, { borderColor: colors['shelivery-primary-yellow'] }]}>
        <Image
          source={{ uri: `https://app.shelivery.com/${userAvatar}` }}
          alt={userName}
          style={styles.avatarImage}
        />
      </View>
      <View style={styles.greetingContainer}>
        <Text style={[styles.greetingText, { color: colors['shelivery-text-primary'] }]}>
          Hi {userName}!
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 18,
    width: "100%",
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  greetingContainer: { flexDirection: "column", gap: 4 },
  greetingText: { fontSize: 20, fontWeight: "400", lineHeight: 28 },
});
