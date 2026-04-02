import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/lib/theme";

interface SignInCardProps {
  id?: string;
}

export default function SignInCard({ id }: SignInCardProps) {
  const router = useRouter();

  const handleSignInClick = () => {
    router.push('/auth' as any); // Temporary: use alpha since auth doesn't exist yet
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleSignInClick}
      activeOpacity={0.8}
      accessibilityLabel="Sign in to Shelivery"
    >
      {/* Avatar with default profile picture */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../public/icons/shelivery-logo3.svg")} // Adjust path to local asset
          alt="Default Avatar"
          style={styles.image}
        />
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18, // gap-[18px]
    marginBottom: 18, // mb-[18px]
    width: "100%",
  },
  imageContainer: {
    position: "relative",
    width: 52, // w-[52px]
    height: 52, // h-[52px]
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // object-cover
  },
  textContainer: {
    flexDirection: "column",
    gap: 4, // gap-1
  },
  welcomeText: {
    fontSize: 20, // text-[20px]
    fontWeight: "400", // font-normal
    lineHeight: 28, // leading-[28px]
    color: colors['shelivery-text-primary'], // text-[#111827]
  },
  signInText: {
    fontSize: 14, // text-[14px]
    fontWeight: "400", // font-normal
    lineHeight: 20, // leading-[20px]
    color: colors['shelivery-text-secondary'], // text-[#6B7280]
  },
});
