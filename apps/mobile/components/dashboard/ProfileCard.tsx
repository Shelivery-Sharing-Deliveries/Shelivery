import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/lib/theme"; // Assuming you have a theme file with colors

interface ProfileCardProps {
  userName: string;
  userAvatar: string;
  id?: string;
}

export default function ProfileCard({
  userName,
  userAvatar,
  id,
}: ProfileCardProps) {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/alpha" as any); // Temporary: use alpha since profile doesn't exist yet
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleProfileClick}
      activeOpacity={0.8}
      accessibilityLabel={`View profile for ${userName}`}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: userAvatar }}
          alt={userName}
          style={styles.avatarImage}
        />
      </View>

      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>
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
    gap: 18, // gap-[18px]
    marginBottom: 18, // mb-[18px]
    width: "100%",
    // text-left is not directly applicable to TouchableOpacity, but content is left-aligned
  },
  avatarContainer: {
    position: "relative",
    width: 54, // w-[54px]
    height: 54, // h-[54px]
    borderRadius: 27, // rounded-full (54/2)
    borderWidth: 2, // border-2
    borderColor: colors['shelivery-primary-yellow'], // border-[#FFDB0D]
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // object-cover
  },
  greetingContainer: {
    flexDirection: "column",
    gap: 4, // gap-1
  },
  greetingText: {
    fontSize: 20, // text-[20px]
    fontWeight: "400", // font-normal
    lineHeight: 28, // leading-[28px]
    color: colors['shelivery-text-primary'], // text-[#111827]
  },
});
