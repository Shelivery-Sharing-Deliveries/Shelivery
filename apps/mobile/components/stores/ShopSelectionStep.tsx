import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from "react-native";
import { Shop } from "../../types/stores/types";
import { Ionicons } from '@expo/vector-icons';

interface Props {
  shops: Shop[];
  selectedShop: Shop | null;
  shopSearchQuery: string;
  onShopSelect: (shop: Shop) => void;
  onSearchChange: (query: string) => void;
  onContinue: () => void;
}

export function ShopSelectionStep({ shops, selectedShop, shopSearchQuery, onShopSelect, onSearchChange, onContinue }: Props) {
  const filtered = shops.filter((s) => s.name.toLowerCase().includes(shopSearchQuery.toLowerCase()));

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>
        Step 1: Select a Shop
      </Text>

      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={16} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          placeholder="Search shops..."
          value={shopSearchQuery}
          onChangeText={onSearchChange}
          style={styles.searchInput}
        />
      </View>

      <ScrollView style={{ maxHeight: 400 }}>
        <View style={styles.shopGrid}>
          {filtered.map((shop) => (
            <TouchableOpacity
              key={shop.id}
              style={[
                styles.shopCard,
                selectedShop?.id === shop.id && styles.selectedShopCard,
              ]}
              onPress={() => onShopSelect(shop)}
            >
              <View style={styles.shopLogoContainer}>
                {shop.logo_url ? (
                  <Image
                    source={{ uri: shop.logo_url, width: 40, height: 40 }}
                    resizeMode="contain"
                    style={styles.shopLogo}
                  />
                ) : (
                  <Ionicons name="bag" size={24} color="#6B7280" />
                )}
              </View>
              <Text style={styles.shopName} numberOfLines={1}>
                {shop.name}
              </Text>
              <Text style={styles.shopMinAmount}>
                Min: CHF {shop.min_amount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {filtered.length === 0 && (
          <View style={styles.noShopsFoundContainer}>
            <Text style={styles.noShopsFoundText}>No shops found matching "{shopSearchQuery}"</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.continueButtonContainer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedShop && styles.disabledButton]}
          onPress={onContinue}
          disabled={!selectedShop}
        >
          <Text style={styles.continueButtonText}>Continue to Location</Text>
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
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
  },
  shopGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  shopCard: {
    width: "47%", // Roughly half with gap
    padding: 12,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: "#E5E8EB",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },
  selectedShopCard: {
    borderColor: "#FFDB0D",
    backgroundColor: "#FFF5C0",
  },
  shopLogoContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#EAE4E4",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  shopLogo: {
    width: 40,
    height: 40,
  },
  shopName: {
    fontWeight: "600",
    color: "#1A1A1A",
    fontSize: 14,
    textAlign: "center",
  },
  shopMinAmount: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  noShopsFoundContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noShopsFoundText: {
    color: "#374151",
  },
  continueButtonContainer: {
    marginTop: 24,
  },
  continueButton: {
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
  continueButtonText: {
    fontWeight: "600",
    color: "black",
    fontSize: 16,
  },
});
