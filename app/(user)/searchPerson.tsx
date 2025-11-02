import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import Footer from "../../components/Footer";
import Ionicons from "@expo/vector-icons/Ionicons";
import VideoIcon from "../../components/videoIcon";

export default function findPeople() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

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
        <View className="flex flex-col justify-center items-center gap-4 mb-2">
          <View className="flex flex-row justify-between items-center w-full px-7">
            <TouchableOpacity className="flex w-[140px]" onPress={handleBack}>
              <Text className="text-lg text-darker font-semibold text-center">
                Back
              </Text>
            </TouchableOpacity>
          </View>
          <VideoIcon thumbnail={require("../../assets/bigvid.png")} />
          <Text className="text-lg text-darker font-semibold text-center">
            The person {"person"} was found at {"timestamp"}.
          </Text>
          <Text className="text-lg text-darker font-semibold text-center">
            Snapshot of first sight.
          </Text>
          <Ionicons name="eye" size={32} color="black"></Ionicons>
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
