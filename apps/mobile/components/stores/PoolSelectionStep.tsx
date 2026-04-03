import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Shop, NearbyPool, LocationData } from "../../types/stores/types";
import { Ionicons } from '@expo/vector-icons';
import { RadioGroup } from "react-native-radio-buttons-group"; // Assuming a library for RadioGroup

interface Props {
  selectedShop: Shop;
  userLocation: LocationData;
  nearbyPools: NearbyPool[];
  selectedPool: string | null;
  totalAmount: number;
  loading: boolean;
  error: string | null;
  success: string | null;
  onPoolSelect: (poolId: string | null) => void;
  onConfirm: (poolId: string | null) => void;
  onBack: () => void;
  onExpandSearch?: () => void;
  expandedSearchLoading?: boolean;
  currentSearchRadius?: number;
}

export function PoolSelectionStep({
  selectedShop, userLocation, nearbyPools, selectedPool, totalAmount,
  loading, error, success, onPoolSelect, onConfirm, onBack,
  onExpandSearch, expandedSearchLoading = false, currentSearchRadius = 5,
}: Props) {

  const radioButtons = [
    ...nearbyPools.map((pool) => ({
      id: pool.pool_id,
      label: `${pool.distance_km.toFixed(2)} km away`,
      value: pool.pool_id,
      containerStyle: {
        padding: 16,
        borderWidth: 2,
        borderRadius: 12,
        borderColor: selectedPool === pool.pool_id ? "#FFDB0D" : "#E5E8EB",
        backgroundColor: selectedPool === pool.pool_id ? "#FFF5C0" : "transparent",
        flexDirection: "row" as const,
        alignItems: "flex-start" as const,
        justifyContent: "space-between" as const,
        gap: 8,
      },
      labelStyle: {
        fontWeight: "600" as const,
        color: "#1A1A1A",
      },
      description: `${pool.member_count} member${pool.member_count !== 1 ? "s" : ""} waiting
📍 ${pool.address}`,
      descriptionStyle: {
        fontSize: 12,
        color: "#374151",
      },
      rightElement: (
        <View style={styles.poolProgressContainer}>
          <Text style={styles.poolProgressLabel}>Progress</Text>
          <Text style={styles.poolProgressAmount}>CHF {pool.current_amount.toFixed(2)}</Text>
          <Text style={styles.poolProgressOfAmount}>of CHF {pool.min_amount.toFixed(2)}</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${(pool.current_amount / pool.min_amount) * 100}%` }]} />
          </View>
        </View>
      ),
    })),
    {
      id: "NEW_POOL",
      label: "Create New Pool",
      value: "NEW_POOL",
      containerStyle: {
        padding: 16,
        borderWidth: 2,
        borderRadius: 12,
        borderColor: selectedPool === null ? "#FFDB0D" : "#E5E8EB",
        backgroundColor: selectedPool === null ? "#FFF5C0" : "transparent",
        flexDirection: "row" as const,
        alignItems: "flex-start" as const,
        justifyContent: "space-between" as const,
        gap: 8,
      },
      labelStyle: {
        fontWeight: "600" as const,
        color: "#1A1A1A",
      },
      description: userLocation ? `Your location will be the anchor
📍 ${userLocation.placeName || userLocation.address}` : "Your location will be the anchor",
      descriptionStyle: {
        fontSize: 12,
        color: "#374151",
      },
      rightElement: (
        <View style={styles.poolProgressContainer}>
          <Text style={styles.poolProgressLabel}>Your amount</Text>
          <Text style={styles.poolProgressAmount}>CHF {totalAmount.toFixed(2)}</Text>
        </View>
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>
        Step 4: Choose a Pool
      </Text>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shop:</Text>
          <Text style={styles.summaryValue}>{selectedShop.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location:</Text>
          <Text style={styles.summaryValue}>
            {userLocation.placeName || userLocation.address}
          </Text>
        </View>
        <View style={styles.summaryLocationDetails}>
          <Ionicons name="location-sharp" size={12} color="#6B7280" />
          <Text style={styles.summaryLocationText}>
            📍 {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        </View>
      </View>

      <View style={styles.poolInfoContainer}>
        <Text style={styles.poolInfoText}>
          {nearbyPools.length > 0
            ? `Found ${nearbyPools.length} nearby pool${nearbyPools.length > 1 ? "s" : ""} for ${selectedShop.name}:`
            : `No nearby pools found for ${selectedShop.name} within ${currentSearchRadius} km.`}
        </Text>
        {nearbyPools.length === 0 && (
          <Text style={styles.poolInfoHint}>
            💡 Try expanding the search range to find more options
          </Text>
        )}
      </View>

      <ScrollView style={{ maxHeight: 400 }}>
        <View style={styles.radioGroupContainer}>
          {/* Expand search button when no pools found */}
          {nearbyPools.length === 0 && onExpandSearch && (
            <TouchableOpacity
              onPress={onExpandSearch}
              disabled={expandedSearchLoading}
              style={styles.expandSearchButton}
            >
              {expandedSearchLoading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Ionicons name="search" size={16} color="black" />
              )}
              <Text style={styles.expandSearchButtonText}>
                {expandedSearchLoading ? "Expanding Search..." : "Expand Search Range"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Existing pools */}
          <RadioGroup
            radioButtons={radioButtons}
            onPress={(id) => onPoolSelect(id === "NEW_POOL" ? null : id)}
            selectedId={selectedPool || "NEW_POOL"}
            containerStyle={styles.radioGroup}
          />
        </View>
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.disabledButton]}
          onPress={() => onConfirm(selectedPool)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={styles.buttonText}>Confirm Selection</Text>
          )}
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
  summaryContainer: {
    backgroundColor: "#EAE4E4",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#374151",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "right",
    flex: 1,
  },
  summaryLocationDetails: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E8EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryLocationText: {
    fontSize: 10,
    color: "#6B7280",
  },
  poolInfoContainer: {
    marginBottom: 16,
  },
  poolInfoText: {
    fontSize: 16,
    color: "#374151",
  },
  poolInfoHint: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  radioGroupContainer: {
    gap: 12,
  },
  expandSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAE4E4",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  expandSearchButtonText: {
    color: "#1A1A1A",
    fontWeight: "600",
  },
  poolProgressContainer: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  poolProgressLabel: {
    fontSize: 10,
    color: "#374151",
  },
  poolProgressAmount: {
    fontWeight: "700",
    color: "#1A1A1A",
  },
  poolProgressOfAmount: {
    fontSize: 10,
    color: "#6B7280",
  },
  progressBarBackground: {
    width: 80,
    height: 4,
    backgroundColor: "#E5E8EB",
    borderRadius: 2,
    marginTop: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFDB0D",
    borderRadius: 2,
  },
  errorContainer: {
    backgroundColor: "#FEF3F2",
    borderColor: "#FF3B30",
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
  },
  successContainer: {
    backgroundColor: "#ECFDF3",
    borderColor: "#34C759",
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  successText: {
    fontSize: 12,
    color: "#34C759",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  backButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E8EB",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#FFDB0D",
    paddingVertical: 12,
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
    fontSize: 16,
  },
  radioGroup: {
    alignItems: "stretch", // Ensure radio buttons take full width
  },
});
