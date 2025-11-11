import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import Button from "../../components/Button";
import Footer from "../../components/Footer";
import VideoIcon from "../../components/videoIcon";
import { useVideoApi } from "../hooks/useVideoApi";
import { showPlatformAlert } from "../../utils/alertUtils";

export default function VideoManagement() {
  const { create, loading, error } = useVideoApi();
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const selectVideoFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["video/*"],
        copyToCacheDirectory: false,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedFile = result.assets[0];

        // Validate file type
        if (!selectedFile.mimeType?.startsWith("video/")) {
          showPlatformAlert(
            "❌ Invalid File",
            "Please select a valid video file."
          );
          return;
        }

        setSelectedVideo(selectedFile);
        console.log(
          "Selected file URI type:",
          selectedFile.uri.startsWith("data:") ? "base64 data URI" : "file URI"
        );
        showPlatformAlert(
          "✅ Video Selected",
          `Selected: ${selectedFile.name}`
        );
      } else if (result.canceled) {
        console.log("Video selection cancelled by user");
      }
    } catch (error: any) {
      console.error("Error selecting video:", error);
      showPlatformAlert(
        "❌ Selection Error",
        "Failed to select video file. Please try again."
      );
    }
  };

  const handleCreate = async () => {
    if (!selectedVideo) {
      showPlatformAlert(
        "❌ No Video Selected",
        "Please select a video file first"
      );
      return;
    }

    // Validate file size (optional - adjust limit as needed)
    const maxSizeInMB = 100;
    if (selectedVideo.size && selectedVideo.size > maxSizeInMB * 1024 * 1024) {
      showPlatformAlert(
        "❌ File Too Large",
        `Video file must be smaller than ${maxSizeInMB}MB. Current size: ${(
          selectedVideo.size /
          (1024 * 1024)
        ).toFixed(2)}MB`
      );
      return;
    }

    try {
      const videoFile = {
        uri: selectedVideo.uri,
        type: selectedVideo.mimeType || "video/mp4",
        name: selectedVideo.name || "video.mp4",
      };

      const result = await create({ file: videoFile });
      if (result) {
        showPlatformAlert("✅ Success", "Video uploaded successfully!", [
          { text: "OK", onPress: () => router.push("/(user)/videoList") },
        ]);
      } else {
        showPlatformAlert(
          "❌ Upload Failed",
          "The video could not be uploaded. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Error creating video:", error);
      const errorMessage =
        error?.message ||
        "An unexpected error occurred while uploading the video.";
      showPlatformAlert("❌ Upload Error", errorMessage, [
        { text: "Retry", onPress: () => handleCreate() },
        { text: "Cancel", style: "cancel" },
      ]);
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
