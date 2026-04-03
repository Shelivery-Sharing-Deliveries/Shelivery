import { Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PageLayout from "@/components/ui/PageLayout";

export default function StoresScreen() {
  const router = useRouter();

  return (
    <PageLayout>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Stores</Text>

        <Text style={styles.description}>
          Browse available stores and join a shopping pool or create your own.
        </Text>

        <TouchableOpacity
          style={styles.noStoresContainer}
          onPress={() => router.push("/(tabs)/stores/create")}
          activeOpacity={0.8}
        >
          <Text style={styles.noStoresTitle}>No Stores Selected</Text>
          <Text style={styles.noStoresDescription}>
            Start by creating a new order flow to see available shops.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/(tabs)/stores/create")}
          >
            <Text style={styles.startButtonText}>Start New Order</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 120, // clear floating nav bar
    gap: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
  },
  description: {
    color: "#374151",
  },
  noStoresContainer: {
    backgroundColor: "#FFFADF",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E8EB",
    alignItems: "center",
    gap: 12,
  },
  noStoresTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
  },
  noStoresDescription: {
    textAlign: "center",
    color: "#6B7280",
  },
  startButton: {
    backgroundColor: "#FFDB0D",
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  startButtonText: {
    fontWeight: "600",
    color: "#000000",
  },
});
