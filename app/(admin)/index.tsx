import { View, Text, ScrollView, Pressable } from "react-native";
import React from "react";
import { useAuth } from "../../stores/useAuth";
import Footer from "../../components/Footer";
import RoleBasedNavigation from "../../components/RoleBasedNavigation";
import * as Linking from "expo-linking";

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
        <View className="flex flex-col gap-6 justify-center items-center">
          <View className="bg-semilight p-6 mt-4 mb-4">
            <Text className="text-2xl font-bold text-darker mb-2 text-end">
              Welcome back, {user?.name}!
            </Text>
          </View>

          <RoleBasedNavigation />

          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <Text className="text-yellow-800 font-semibold text-base">
              🔧 As an admin, you can access all user features plus system
              management tools.
            </Text>
          </View>
          <View className="bg-semilight p-4 mt-4 flex flex-col">
            <Text className="text-2xl font-bold text-darker">
              Need to use a real time video stream? No fret, please, access the
              documentation below and see how to connect across websocket
              connections
            </Text>
            <Pressable
              onPress={() =>
                Linking.openURL("https://beatrizamante.github.io/watchme_ai")
              }
            >
              <Text
                className="font-bold text-semidark text-center mt-4"
                style={{ fontSize: 30 }}
              >
                Getting Started
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
