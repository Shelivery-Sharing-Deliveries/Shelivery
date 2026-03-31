import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-shelivery-background-gray">
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-shelivery-text-primary font-poppins">
            Dashboard
          </Text>
          <Text className="text-shelivery-text-secondary mt-1 font-inter">
            Welcome to Shelivery Mobile
          </Text>
        </View>

        <View className="bg-white rounded-shelivery-md p-4 mb-4 shadow-shelivery-sm">
          <Text className="text-lg font-semibold text-shelivery-text-primary font-poppins mb-2">
            Your Active Pools
          </Text>
          <Text className="text-shelivery-text-tertiary font-inter">
            No active pools yet. Join or create a pool to get started!
          </Text>
        </View>

        <View className="bg-shelivery-card-background border border-shelivery-card-border rounded-shelivery-md p-4 mb-4">
          <Text className="text-lg font-semibold text-shelivery-text-primary font-poppins mb-2">
            Recent Activity
          </Text>
          <Text className="text-shelivery-text-tertiary font-inter">
            Your activity will appear here.
          </Text>
        </View>

        <View className="bg-white rounded-shelivery-md p-4 shadow-shelivery-sm">
          <Text className="text-lg font-semibold text-shelivery-text-primary font-poppins mb-2">
            Quick Actions
          </Text>
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1 bg-shelivery-primary-yellow rounded-shelivery-md p-3 items-center">
              <Text className="font-semibold text-shelivery-primary-blue font-poppins">
                Join Pool
              </Text>
            </View>
            <View className="flex-1 bg-shelivery-primary-blue rounded-shelivery-md p-3 items-center">
              <Text className="font-semibold text-white font-poppins">
                Create Pool
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}