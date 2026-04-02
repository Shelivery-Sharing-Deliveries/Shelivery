import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LocationData } from "../../types/stores/types";
import { Ionicons } from '@expo/vector-icons';

interface Props {
  userLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function LocationStep({ userLocation, onLocationSelect, onContinue, onBack }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>
        Step 2: Set Delivery Location
      </Text>

      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={48} color="#6B7280" />
        <Text style={styles.mapPlaceholderText}>
          Map Integration Placeholder{"\n"}
          (Use react-native-maps here)
        </Text>
      </View>

      {userLocation ? (
        <View style={styles.selectedLocationContainer}>
          <View style={styles.selectedLocationHeader}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.selectedLocationText}>Selected Location:</Text>
          </View>
          <Text style={styles.selectedLocationAddress}>
            {userLocation.placeName || userLocation.address || "Selected location on map"}
          </Text>
        </View>
      ) : (
        <Text style={styles.locationPrompt}>
          Search for your address or tap on the map to set your delivery point.
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !userLocation && styles.disabledButton]}
          onPress={onContinue}
          disabled={!userLocation}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFADF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E8EB",
  },
  headerTitle: {
    color: "#1A1A1A",
    marginBottom: 16,
    fontSize: 24,
    fontWeight: "600",
  },
  mapPlaceholder: {
    height: 300,
    backgroundColor: "#EAE4E4",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E8EB",
    marginBottom: 16,
  },
  mapPlaceholderText: {
    color: "#374151",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },
  selectedLocationContainer: {
    backgroundColor: "#FFF5C0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFDB0D",
  },
  selectedLocationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedLocationText: {
    fontWeight: "600",
    color: "#1A1A1A",
  },
  selectedLocationAddress: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
  },
  locationPrompt: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E8EB",
    gap: 8,
  },
  continueButton: {
    flex: 2,
    backgroundColor: "#FFDB0D",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: "600",
    color: "black",
  },
});