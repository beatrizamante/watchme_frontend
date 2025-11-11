import { View, Text, ScrollView } from "react-native";
import React from "react";
import { useAuth } from "../../stores/useAuth";
import Footer from "../../components/Footer";
import RoleBasedNavigation from "../../components/RoleBasedNavigation";

export default function AdminHome() {
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
          <View className="bg-red-50 border border-red-200 rounded-lg p-6">
            <Text className="text-2xl font-bold text-darker mb-2">
              Admin Dashboard
            </Text>
            <Text className="text-semidark text-lg">
              Welcome {user?.name}! You have full system access.
            </Text>
          </View>

          <RoleBasedNavigation />

          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <Text className="text-yellow-800 font-semibold text-base">
              🔧 As an admin, you can access all user features plus system
              management tools.
            </Text>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
