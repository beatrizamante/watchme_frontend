import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import Footer from "../../components/Footer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTracking } from "../../stores/useTracking";
import { showPlatformAlert } from "../../utils/alertUtils";

export default function LiveTracking() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;

  const { selectedPersonId, tracker, isTrackingMode, clearSelection } =
    useTracking();

  useEffect(() => {
    // If no person is selected or tracking is not active, redirect back
    if (!selectedPersonId || !isTrackingMode) {
      showPlatformAlert(
        "No Live Tracking Active",
        "Please select a person and start live tracking first.",
        [{ text: "OK", onPress: () => router.push("/(user)/peopleList") }]
      );
      return;
    }
  }, [selectedPersonId, isTrackingMode, router]);

  const handleBack = () => {
    tracker.disconnect();
    clearSelection();
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
        <View className="flex flex-col gap-4 mb-2">
          <View className="flex flex-row justify-start items-center w-full pl-2 mb-4">
            <TouchableOpacity className="flex" onPress={handleBack}>
              <Text className="text-lg text-darker font-semibold">Back</Text>
            </TouchableOpacity>
          </View>
          <View className="flex justify-center items-center w-full mb-4">
            <Text className="text-darker text-center font-semibold">
              Live Person Tracking
            </Text>
          </View>

          {/* WebSocket Connection Status */}
          <View
            className={`border rounded-lg p-4 ${
              tracker.status.connected
                ? "bg-green-50 border-green-200"
                : tracker.status.connecting
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <View className="flex-row items-center mb-2">
              <View
                className={`w-3 h-3 rounded-full mr-3 ${
                  tracker.status.connected
                    ? "bg-green-500"
                    : tracker.status.connecting
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              <Text
                className={`font-semibold ${
                  tracker.status.connected
                    ? "text-green-800"
                    : tracker.status.connecting
                    ? "text-yellow-800"
                    : "text-red-800"
                }`}
              >
                WebSocket:{" "}
                {tracker.status.connected
                  ? "Connected"
                  : tracker.status.connecting
                  ? "Connecting..."
                  : "Disconnected"}
              </Text>
            </View>
            <Text
              className={`text-sm ${
                tracker.status.connected
                  ? "text-green-700"
                  : tracker.status.connecting
                  ? "text-yellow-700"
                  : "text-red-700"
              }`}
            >
              {tracker.status.connected
                ? "Receiving live detection data from camera feed"
                : tracker.status.connecting
                ? "Establishing connection to live camera feed..."
                : "Connection lost. Make sure your camera is connected to the backend."}
            </Text>
            {tracker.status.error && (
              <Text className="text-red-700 text-sm mt-1">
                Error: {tracker.status.error}
              </Text>
            )}
          </View>

          {/* Person Info */}
          {selectedPersonId && (
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Text className="text-blue-800 font-semibold">
                👤 Tracking Person: ID {selectedPersonId}
              </Text>
              <Text className="text-blue-600 text-sm mt-1">
                Live detection from camera feed
              </Text>
            </View>
          )}

          {/* Live Detection Area */}
          <View className="bg-gray-900 rounded-lg p-4 min-h-[300px] flex justify-center items-center">
            <View className="text-center">
              <Ionicons name="videocam" size={48} color="#fff" />
              <Text className="text-white text-lg font-semibold mt-4">
                Live Camera Feed
              </Text>
              <Text className="text-gray-300 text-sm mt-2">
                Camera feed and detection overlay will appear here
              </Text>
              <Text className="text-gray-400 text-xs mt-4">
                This requires backend implementation for live video streaming
              </Text>
            </View>
          </View>

          {/* Latest Detection */}
          {tracker.status.lastMessage && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-4">
              <Text className="text-green-800 font-semibold mb-2">
                ✓ Latest Detection
              </Text>
              <View className="space-y-1">
                <Text className="text-green-700 text-sm">
                  Person: {tracker.status.lastMessage.personName}
                </Text>
                <Text className="text-green-700 text-sm">
                  Confidence:{" "}
                  {(tracker.status.lastMessage.confidence * 100).toFixed(1)}%
                </Text>
                <Text className="text-green-700 text-sm">
                  Position: ({tracker.status.lastMessage.boundingBox.x},{" "}
                  {tracker.status.lastMessage.boundingBox.y})
                </Text>
                <Text className="text-green-700 text-sm">
                  Size: {tracker.status.lastMessage.boundingBox.width} ×{" "}
                  {tracker.status.lastMessage.boundingBox.height}
                </Text>
              </View>
            </View>
          )}

          {/* Detection History */}
          <View className="bg-semilight border border-semidark rounded-lg p-4">
            <Text className="text-darker text-lg font-semibold mb-3">
              Detection History ({tracker.trackingHistory.length})
            </Text>
            {tracker.trackingHistory.length === 0 ? (
              <Text className="text-semidark">
                No detections yet. Waiting for live camera feed...
              </Text>
            ) : (
              <View className="max-h-[200px]">
                <ScrollView nestedScrollEnabled={true}>
                  {tracker.trackingHistory
                    .slice(-10)
                    .reverse()
                    .map((detection, index) => (
                      <View
                        key={tracker.trackingHistory.length - index}
                        className="flex-row justify-between items-center p-3 mb-2 bg-white border border-gray-200 rounded-lg"
                      >
                        <View className="flex-row items-center">
                          <Ionicons name="person" size={16} color="#666" />
                          <Text className="ml-2 text-darker font-medium">
                            {detection.personName}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-darker font-semibold">
                            {(detection.confidence * 100).toFixed(1)}%
                          </Text>
                          <Text className="text-semidark text-xs">
                            {detection.boundingBox.width}×
                            {detection.boundingBox.height}px
                          </Text>
                        </View>
                      </View>
                    ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Controls */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => tracker.clearHistory()}
              className="flex-1 bg-gray-100 border border-gray-300 rounded-lg p-3"
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="trash" size={16} color="#666" />
                <Text className="text-gray-700 font-semibold ml-2">
                  Clear History
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (tracker.status.connected) {
                  tracker.disconnect();
                } else if (selectedPersonId) {
                  tracker.connect(selectedPersonId);
                }
              }}
              className={`flex-1 border rounded-lg p-3 ${
                tracker.status.connected
                  ? "bg-red-100 border-red-300"
                  : "bg-green-100 border-green-300"
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name={tracker.status.connected ? "stop" : "play"}
                  size={16}
                  color={tracker.status.connected ? "#DC2626" : "#059669"}
                />
                <Text
                  className={`font-semibold ml-2 ${
                    tracker.status.connected ? "text-red-700" : "text-green-700"
                  }`}
                >
                  {tracker.status.connected
                    ? "Stop Tracking"
                    : "Start Tracking"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text className="text-blue-800 font-semibold mb-2">
              📋 How Live Tracking Works:
            </Text>
            <Text className="text-blue-700 text-sm mb-2">
              1. Connect a camera to your backend system
            </Text>
            <Text className="text-blue-700 text-sm mb-2">
              2. WebSocket receives real-time detection data
            </Text>
            <Text className="text-blue-700 text-sm">
              3. Person detections appear here as they happen
            </Text>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
