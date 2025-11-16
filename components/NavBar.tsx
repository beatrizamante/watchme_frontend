import { View, Text, Image, Pressable } from "react-native";
import * as Linking from "expo-linking";
import { useAuth } from "../stores/useAuth";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";

export default function NavBar() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  return (
    <View
      className="sticky flex-row items-center justify-between h-[86px] min-w-full bg-lighter mb-6"
      style={{
        shadowColor: "#000",
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 10,
      }}
    >
      <View className="py-6 px-6">
        <Image source={require("../assets/icon.png")} className="w-10 h-10" />
      </View>

      {isAuthenticated ? (
        <View>
          <Pressable
            onPress={() => {
              logout();
              router.replace("/");
            }}
            className="px-6"
          >
            <Ionicons name="power" size={32} color="grey"></Ionicons>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row space-x-8 px-6 pt-8 gap-4">
          <Pressable
            onPress={() =>
              Linking.openURL("https://beatrizamante.github.io/watchme_ai")
            }
          >
            <Text className="text-lg font-semibold text-semidark">Docs</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              Linking.openURL("https://github.com/beatrizamante/watchme_api")
            }
          >
            <Text className="text-lg font-semibold text-semidark">About</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
