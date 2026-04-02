import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { globalStyles } from "../../../lib/globalStyles";
import { Ionicons } from "@expo/vector-icons"; // Using Expo vector icons as a replacement

export default function StoresScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Stores</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/(tabs)/stores/create")}
            >
              <Ionicons name="add" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Browse available stores and join a shopping pool or create your own.
          </Text>

          <View style={styles.noStoresContainer}>
            <Text style={styles.noStoresTitle}>
              No Stores Selected
            </Text>
            <Text style={styles.noStoresDescription}>
              Start by creating a new order flow to see available shops.
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push("/(tabs)/stores/create")}
            >
              <Text style={styles.startButtonText}>Start New Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFDB0D",
    alignItems: "center",
    justifyContent: "center",
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
    color: "black",
  },
});
