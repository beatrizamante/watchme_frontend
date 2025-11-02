import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import Button from "../../components/Button";
import Footer from "../../components/Footer";
import VideoIcon from "../../components/videoIcon";
import { useVideoApi } from "../hooks/useVideoApi";

export default function VideoManagement() {
  const { create, loading, error } = useVideoApi();
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const selectVideoFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["video/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedVideo(result.assets[0]);
        Alert.alert("Video Selected", `Selected: ${result.assets[0].name}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select video file");
      console.error("Error selecting video:", error);
    }
  };

  const handleCreate = async () => {
    if (!selectedVideo) {
      Alert.alert("No Video Selected", "Please select a video file first");
      return;
    }

    try {
      const videoFile = {
        uri: selectedVideo.uri,
        type: selectedVideo.mimeType || "video/mp4",
        name: selectedVideo.name,
      };

      const result = await create({ file: videoFile });

      if (result) {
        console.log("Video created successfully:", result);
        Alert.alert("Success", "Video uploaded successfully!", [
          { text: "OK", onPress: () => router.push("/(user)/videoList") },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload video");
      console.error("Error creating video:", error);
    }
  };
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

          <View className="w-full px-4 gap-4">
            <TouchableOpacity
              onPress={selectVideoFile}
              className="border-2 border-dashed border-gray-400 bg-gray-50 p-6 rounded-lg items-center"
            >
              <Text className="text-lg text-gray-600 font-semibold">
                {selectedVideo ? "Change Video" : "Select Video File"}
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                Tap to choose video from device
              </Text>
            </TouchableOpacity>

            {selectedVideo && (
              <View className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <Text className="text-green-800 font-semibold">
                  Selected Video:
                </Text>
                <Text className="text-green-700 mt-1">
                  {selectedVideo.name}
                </Text>
                <Text className="text-green-600 text-sm mt-1">
                  Size:{" "}
                  {selectedVideo.size
                    ? (selectedVideo.size / (1024 * 1024)).toFixed(2)
                    : "Unknown"}{" "}
                  MB
                </Text>
              </View>
            )}

            {error && (
              <View className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <Text className="text-red-800">Error: {error}</Text>
              </View>
            )}
          </View>

          {loading || !selectedVideo ? (
            <View className="h-[60px] opacity-50">
              <TouchableOpacity
                disabled={true}
                className="bg-gray-400 px-[30px] py-3 min-w-[160px] w-full min-h-[36px] h-full flex justify-center items-center rounded-[25px] border-gray-300 border shadow-black shadow-lg"
              >
                <Text className="text-gray-600 text-xl font-semibold text-center">
                  {loading ? "Uploading..." : "Select Video First"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button content="Upload video" onPress={handleCreate} />
          )}
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
