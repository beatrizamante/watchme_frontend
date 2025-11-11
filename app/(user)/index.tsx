import { View, Text, ScrollView } from "react-native";
import React from "react";
import { useAuth } from "../../stores/useAuth";
import Footer from "../../components/Footer";
import RoleBasedNavigation from "../../components/RoleBasedNavigation";

export default function UserHome() {
  const { user } = useAuth();
  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 160,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex flex-col gap-6">
          <RoleBasedNavigation />
          <View className="bg-semilight border border-semidark rounded-lg p-6 mt-4">
            <Text className="text-2xl font-bold text-darker mb-2">
              Welcome back, {user?.name}!
            </Text>
            <Text className="text-semidark text-lg">
              {user?.role === "ADMIN"
                ? "You have admin access to all system features"
                : "Manage your videos and people for AI recognition"}
            </Text>
          </View>

          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <Text className="text-blue-800 font-semibold text-base">
              💡 Now you can create and manage your own people embeddings!
              Upload clear photos for better recognition accuracy.
            </Text>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
