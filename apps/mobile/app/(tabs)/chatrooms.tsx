import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatroomsScreen() {
  const chatrooms = [
    { id: 1, name: "Migros Pool #123", members: 4, status: "active" },
    { id: 2, name: "Coop Delivery Group", members: 3, status: "active" },
    { id: 3, name: "Denner Shopping", members: 2, status: "waiting" },
    { id: 4, name: "Aldi Weekend Shop", members: 5, status: "delivered" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-shelivery-badge-blue-bg border border-shelivery-badge-blue-border text-shelivery-badge-blue-text";
      case "waiting":
        return "bg-shelivery-badge-red-bg border border-shelivery-badge-red-border text-shelivery-badge-red-text";
      case "delivered":
        return "bg-shelivery-badge-green-bg border border-shelivery-badge-green-border text-shelivery-badge-green-text";
      default:
        return "bg-gray-100 border border-gray-300 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "waiting":
        return "Waiting";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-shelivery-background-gray">
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-shelivery-text-primary font-poppins">
            Chatrooms
          </Text>
          <Text className="text-shelivery-text-secondary mt-1 font-inter">
            Connect with your shopping groups
          </Text>
        </View>

        <View className="space-y-4">
          {chatrooms.map((chatroom) => (
            <View
              key={chatroom.id}
              className="bg-white rounded-shelivery-md p-4 shadow-shelivery-sm"
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-semibold text-shelivery-text-primary font-poppins flex-1">
                  {chatroom.name}
                </Text>
                <View className={`px-2 py-1 rounded-shelivery-full ${getStatusColor(chatroom.status)}`}>
                  <Text className="text-xs font-medium">
                    {getStatusText(chatroom.status)}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center mt-2">
                <View className="flex-row -space-x-2 mr-3">
                  {[...Array(Math.min(chatroom.members, 3))].map((_, i) => (
                    <View
                      key={i}
                      className="w-6 h-6 rounded-full bg-shelivery-primary-blue border border-white"
                    />
                  ))}
                  {chatroom.members > 3 && (
                    <View className="w-6 h-6 rounded-full bg-gray-300 border border-white items-center justify-center">
                      <Text className="text-xs text-shelivery-text-primary">
                        +{chatroom.members - 3}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-shelivery-text-tertiary font-inter text-sm">
                  {chatroom.members} member{chatroom.members !== 1 ? "s" : ""}
                </Text>
              </View>

              <View className="mt-3 pt-3 border-t border-gray-100">
                <Text className="text-shelivery-text-tertiary font-inter text-sm">
                  Tap to view messages and order details
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-6 bg-shelivery-card-background border border-shelivery-card-border rounded-shelivery-md p-4">
          <Text className="text-lg font-semibold text-shelivery-text-primary font-poppins mb-2">
            Start a new chatroom
          </Text>
          <Text className="text-shelivery-text-tertiary font-inter mb-3">
            Create a new shopping pool and invite friends to join your chatroom.
          </Text>
          <View className="bg-shelivery-primary-yellow rounded-shelivery-md p-3 items-center mt-2">
            <Text className="font-semibold text-shelivery-primary-blue font-poppins">
              Create New Chatroom
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}