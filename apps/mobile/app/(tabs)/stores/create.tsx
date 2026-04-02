import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { globalStyles } from "../../../lib/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { ShopSelectionStep } from "../../../components/stores/ShopSelectionStep";
import { LocationStep } from "../../../components/stores/LocationStep";
import { OrderDetailsStep } from "../../../components/stores/OrderDetailsStep";
import { PoolSelectionStep } from "../../../components/stores/PoolSelectionStep";
import { Shop, LocationData, NearbyPool } from "../../../types/stores/types";

export default function CreateOrderFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // State for the flow
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopSearchQuery, setShopSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [basketLink, setBasketLink] = useState("");
  const [basketNote, setBasketNote] = useState("");
  const [basketAmount, setBasketAmount] = useState("");
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  
  // Mock data
  const shops: Shop[] = [
    { id: "1", name: "Migros", min_amount: 50, logo_url: null, is_active: true },
    { id: "2", name: "Coop", min_amount: 100, logo_url: null, is_active: true },
    { id: "3", name: "Aldi", min_amount: 30, logo_url: null, is_active: true },
  ];

  const nearbyPools: NearbyPool[] = [
    { pool_id: "p1", current_amount: 25, min_amount: 50, distance_km: 0.5, member_count: 2, address: "Zürichstrasse 1, 8000 Zürich" },
    { pool_id: "p2", current_amount: 80, min_amount: 100, distance_km: 1.2, member_count: 4, address: "Badenerstrasse 10, 8004 Zürich" },
  ];

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ShopSelectionStep
            shops={shops}
            selectedShop={selectedShop}
            shopSearchQuery={shopSearchQuery}
            onShopSelect={setSelectedShop}
            onSearchChange={setShopSearchQuery}
            onContinue={() => setStep(2)}
          />
        );
      case 2:
        return (
          <LocationStep
            userLocation={userLocation}
            onLocationSelect={setUserLocation}
            onContinue={() => setStep(3)}
            onBack={handleBack}
          />
        );
      case 3:
        if (!selectedShop || !userLocation) return null;
        return (
          <OrderDetailsStep
            selectedShop={selectedShop}
            userLocation={userLocation}
            basketLink={basketLink}
            basketNote={basketNote}
            basketAmount={basketAmount}
            onLinkChange={setBasketLink}
            onNoteChange={setBasketNote}
            onAmountChange={setBasketAmount}
            canSubmit={basketAmount !== "" && (basketLink !== "" || basketNote !== "")}
            submitting={false}
            error={null}
            onSubmit={() => setStep(4)}
            onBack={handleBack}
          />
        );
      case 4:
        if (!selectedShop || !userLocation) return null;
        return (
          <PoolSelectionStep
            selectedShop={selectedShop}
            userLocation={userLocation}
            nearbyPools={nearbyPools}
            selectedPool={selectedPool}
            totalAmount={parseFloat(basketAmount) || 0}
            loading={false}
            error={null}
            success={null}
            onPoolSelect={setSelectedPool}
            onConfirm={(poolId) => {
              console.log("Confirmed pool selection:", poolId);
              router.push("/(tabs)/stores");
            }}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Order</Text>
      </View>
      
      <ScrollView style={globalStyles.scrollContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.stepContainer}>
          {renderStep()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E8EB", // A light grey for the button background
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  stepContainer: {
    padding: 16,
  },
});
