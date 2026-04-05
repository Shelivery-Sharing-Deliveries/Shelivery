import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Shop, NearbyPool, LocationData } from "../../types/stores/types";
import { Ionicons } from '@expo/vector-icons';

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

  // "null" means create new pool — we track it as a literal null in the parent
  const isNewPoolSelected = selectedPool === null;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Step 4: Choose a Pool</Text>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shop:</Text>
          <Text style={styles.summaryValue}>{selectedShop.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location:</Text>
          <Text style={[styles.summaryValue, { flex: 1, textAlign: "right" }]} numberOfLines={2}>
            {userLocation.placeName || userLocation.address}
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

      <ScrollView style={styles.poolsList} showsVerticalScrollIndicator={false}>
        {/* Expand search button when no pools found */}
        {nearbyPools.length === 0 && onExpandSearch && (
          <TouchableOpacity
            onPress={onExpandSearch}
            disabled={expandedSearchLoading}
            style={styles.expandSearchButton}
          >
            {expandedSearchLoading ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              <Ionicons name="search" size={16} color="#111827" />
            )}
            <Text style={styles.expandSearchButtonText}>
              {expandedSearchLoading ? "Expanding Search..." : "Expand Search Range"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Existing pool cards */}
        {nearbyPools.map((pool) => {
          const isSelected = selectedPool === pool.pool_id;
          const progressPct = Math.min(100, (pool.current_amount / pool.min_amount) * 100);
          return (
            <TouchableOpacity
              key={pool.pool_id}
              style={[styles.poolCard, isSelected && styles.poolCardSelected]}
              onPress={() => onPoolSelect(pool.pool_id)}
              activeOpacity={0.8}
            >
              <View style={styles.poolCardRow}>
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.poolCardInfo}>
                  <Text style={styles.poolCardDistance}>
                    {pool.distance_km.toFixed(2)} km away
                  </Text>
                  <Text style={styles.poolCardMembers}>
                    {pool.member_count} member{pool.member_count !== 1 ? "s" : ""} waiting
                  </Text>
                  {pool.address ? (
                    <Text style={styles.poolCardAddress} numberOfLines={1}>
                      📍 {pool.address}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.poolProgressContainer}>
                  <Text style={styles.poolProgressLabel}>Progress</Text>
                  <Text style={styles.poolProgressAmount}>CHF {pool.current_amount.toFixed(2)}</Text>
                  <Text style={styles.poolProgressOfAmount}>of CHF {pool.min_amount.toFixed(2)}</Text>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progressPct}%` as any }]} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Create New Pool card */}
        <TouchableOpacity
          style={[styles.poolCard, isNewPoolSelected && styles.poolCardSelected]}
          onPress={() => onPoolSelect(null)}
          activeOpacity={0.8}
        >
          <View style={styles.poolCardRow}>
            <View style={styles.radioOuter}>
              {isNewPoolSelected && <View style={styles.radioInner} />}
            </View>
            <View style={styles.poolCardInfo}>
              <Text style={styles.poolCardDistance}>Create New Pool</Text>
              <Text style={styles.poolCardMembers}>Your location will be the anchor</Text>
              {userLocation && (
                <Text style={styles.poolCardAddress} numberOfLines={2}>
                  📍 {userLocation.placeName || userLocation.address}
                </Text>
              )}
            </View>
            <View style={styles.poolProgressContainer}>
              <Text style={styles.poolProgressLabel}>Your amount</Text>
              <Text style={styles.poolProgressAmount}>CHF {totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </TouchableOpacity>
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
          style={[styles.backButton, loading && styles.disabledButton]}
          onPress={onBack}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.disabledButton]}
          onPress={() => onConfirm(selectedPool)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#111827" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Selection</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E8EB",
  },
  headerTitle: {
    color: "#111827",
    marginBottom: 16,
    fontSize: 18,
    fontWeight: "600",
  },
  summaryContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#374151",
    flexShrink: 0,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  poolInfoContainer: {
    marginBottom: 16,
  },
  poolInfoText: {
    fontSize: 14,
    color: "#374151",
  },
  poolInfoHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  poolsList: {
    maxHeight: 400,
  },
  expandSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  expandSearchButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 14,
  },
  poolCard: {
    padding: 14,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: "#E5E8EB",
    backgroundColor: "transparent",
    marginBottom: 12,
  },
  poolCardSelected: {
    borderColor: "#FFDB0D",
    backgroundColor: "#FFFBEB",
  },
  poolCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#6B7280",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFDB0D",
  },
  poolCardInfo: {
    flex: 1,
    gap: 2,
  },
  poolCardDistance: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 14,
  },
  poolCardMembers: {
    fontSize: 13,
    color: "#374151",
  },
  poolCardAddress: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  poolProgressContainer: {
    alignItems: "flex-end",
    flexShrink: 0,
    minWidth: 90,
  },
  poolProgressLabel: {
    fontSize: 11,
    color: "#374151",
  },
  poolProgressAmount: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 13,
  },
  poolProgressOfAmount: {
    fontSize: 11,
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
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#F04438",
  },
  successContainer: {
    backgroundColor: "#ECFDF3",
    borderColor: "#34C759",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  successText: {
    fontSize: 13,
    color: "#12B76A",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E8EB",
  },
  backButtonText: {
    fontWeight: "600",
    color: "#374151",
    fontSize: 15,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#FFDB0D",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
