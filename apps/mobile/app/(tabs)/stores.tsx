import { View, Text, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StoresScreen() {
  const stores = [
    { id: 1, name: "Migros" },
    { id: 2, name: "Coop" },
    { id: 3, name: "Denner" },
    { id: 4, name: "Aldi" },
    { id: 5, name: "Lidl" },
    { id: 6, name: "Digitec" },
    { id: 7, name: "Galaxus" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-shelivery-background-gray">
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-shelivery-text-primary font-poppins">
            Stores
          </Text>
          <Text className="text-shelivery-text-secondary mt-1 font-inter">
            Browse available stores for group shopping
          </Text>
        </View>

        <View className="grid grid-cols-2 gap-4">
          {stores.map((store) => (
            <View
              key={store.id}
              className="bg-white rounded-shelivery-md p-4 items-center shadow-shelivery-sm"
            >
              <View className="w-16 h-16 mb-3 bg-gray-100 rounded-shelivery-md items-center justify-center">
                <Text className="text-shelivery-text-tertiary font-inter">
                  {store.name.charAt(0)}
                </Text>
              </View>
              <Text className="font-medium text-shelivery-text-primary font-poppins">
                {store.name}
              </Text>
              <Text className="text-xs text-shelivery-text-tertiary font-inter mt-1">
                Tap to browse
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-6 bg-shelivery-card-background border border-shelivery-card-border rounded-shelivery-md p-4">
          <Text className="text-lg font-semibold text-shelivery-text-primary font-poppins mb-2">
            How it works
          </Text>
          <Text className="text-shelivery-text-tertiary font-inter mb-3">
            1. Choose a store from the list above
          </Text>
          <Text className="text-shelivery-text-tertiary font-inter mb-3">
            2. Browse products and add to your basket
          </Text>
          <Text className="text-shelivery-text-tertiary font-inter">
            3. Join or create a pool with friends
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}