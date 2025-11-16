import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, Dimensions } from "react-native";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useWebSocket } from "../hooks/useWebSocket";
import { useTracking } from "../../stores/useTracking";
import Footer from "../../components/Footer";

interface LiveDetection {
  bbox: [number, number, number, number];
  confidence: number;
  person_id: string;
  person_name: string;
  timestamp: number;
}

export default function LiveCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState<LiveDetection[]>([]);
  const [currentDetection, setCurrentDetection] =
    useState<LiveDetection | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const screenWidth = Dimensions.get("window").width;
  const cameraHeight = screenWidth * (4 / 3); // 4:3 aspect ratio

  const { selectedPersonId } = useTracking();

  // WebSocket connection for real-time AI analysis
  const {
    isConnected,
    isConnecting,
    sendMessage,
    lastDetection,
    connect,
    disconnect,
  } = useWebSocket({
    url: "ws://localhost:8000/ws/live-camera",
    enabled: isStreaming,
    selectedPersonId: selectedPersonId || undefined,
    onDetection: (detection) => {
      // Convert WebSocket detection to LiveDetection format
      const liveDetection: LiveDetection = {
        bbox: [
          detection.boundingBox.x,
          detection.boundingBox.y,
          detection.boundingBox.width,
          detection.boundingBox.height,
        ],
        confidence: detection.confidence,
        person_id: detection.personId || "unknown",
        person_name: "Detected Person",
        timestamp: detection.timestamp,
      };

      setDetections((prev) => [...prev.slice(-10), liveDetection]);
      setCurrentDetection(liveDetection);

      // Clear detection after 2 seconds
      setTimeout(() => {
        setCurrentDetection(null);
      }, 2000);
    },
    onError: (error) => {
      Alert.alert("WebSocket Error", error);
    },
  });

  // Request camera permissions
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-center mb-4">
          We need camera permission to stream live video
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startLiveAnalysis = async () => {
    try {
      if (!selectedPersonId) {
        Alert.alert(
          "No Person Selected",
          "Please select a person to track before starting live analysis."
        );
        return;
      }

      setIsStreaming(true);

      // WebSocket will auto-connect due to enabled: isStreaming
      // Wait a moment for connection
      setTimeout(() => {
        if (!isConnected && !isConnecting) {
          connect();
        }
      }, 100);

      // Start capturing frames every 1000ms (1 FPS to be gentle on resources)
      const interval = setInterval(async () => {
        if (cameraRef.current && isConnected) {
          try {
            // Capture frame as base64
            const photo = await cameraRef.current.takePictureAsync({
              quality: 0.3, // Lower quality for faster processing
              base64: true,
              skipProcessing: true,
            });

            if (photo.base64) {
              // Send frame to AI backend via WebSocket
              const success = sendMessage({
                type: "analyze_frame",
                frame_data: photo.base64,
                timestamp: Date.now(),
                person_id: selectedPersonId,
              });

              if (!success) {
                console.warn("Failed to send frame - WebSocket not ready");
              }
            }
          } catch (error) {
            console.error("Error capturing frame:", error);
          }
        }
      }, 1000); // 1 second intervals

      // Store interval ID to clear later
      (global as any).cameraInterval = interval;
    } catch (error) {
      console.error("Error starting live analysis:", error);
      Alert.alert("Error", "Failed to start live analysis");
      setIsStreaming(false);
    }
  };

  // Stop streaming
  const stopLiveAnalysis = () => {
    setIsStreaming(false);
    if ((global as any).cameraInterval) {
      clearInterval((global as any).cameraInterval);
      delete (global as any).cameraInterval;
    }
    disconnect();
    setCurrentDetection(null);
    setDetections([]);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Camera View */}
      <View
        className="relative overflow-hidden"
        style={{ height: cameraHeight }}
      >
        <CameraView
          ref={cameraRef}
          style={{ width: "100%", height: "100%" }}
          facing="back"
        />

        {/* Live bounding box overlay */}
        {currentDetection && (
          <>
            {/* Pulse background */}
            <View
              className="absolute border-2 border-green-300 bg-green-300/5 rounded-sm animate-pulse"
              style={{
                left: `${(currentDetection.bbox[0] / 640) * 100 - 1}%`,
                top: `${(currentDetection.bbox[1] / 480) * 100 - 1}%`,
                width: `${(currentDetection.bbox[2] / 640) * 100 + 2}%`,
                height: `${(currentDetection.bbox[3] / 480) * 100 + 2}%`,
              }}
            />

            {/* Main detection box */}
            <View
              className="absolute border-4 border-green-500 bg-green-500/10 rounded-sm"
              style={{
                left: `${(currentDetection.bbox[0] / 640) * 100}%`,
                top: `${(currentDetection.bbox[1] / 480) * 100}%`,
                width: `${(currentDetection.bbox[2] / 640) * 100}%`,
                height: `${(currentDetection.bbox[3] / 480) * 100}%`,
              }}
            >
              {/* Person label */}
              <View className="bg-green-500 px-2 py-1 rounded-sm absolute -top-7 left-0">
                <Text className="text-white text-xs font-bold">
                  🎯 {currentDetection.person_name} (
                  {Math.round(currentDetection.confidence * 100)}%)
                </Text>
              </View>

              {/* Corner markers */}
              <View className="absolute -top-1 -left-1 w-3 h-3 bg-green-600 rounded-full border-2 border-white" />
              <View className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 rounded-full border-2 border-white" />
              <View className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-600 rounded-full border-2 border-white" />
              <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-600 rounded-full border-2 border-white" />
            </View>
          </>
        )}

        {/* Connection status */}
        <View className="absolute top-4 left-4">
          <View
            className={`px-3 py-2 rounded-lg ${
              isConnected ? "bg-green-500/90" : "bg-red-500/90"
            }`}
          >
            <Text className="text-white text-xs font-bold">
              {isConnected ? "🟢 AI Connected" : "🔴 Disconnected"}
            </Text>
          </View>
        </View>

        {/* Live indicator */}
        {isStreaming && (
          <View className="absolute top-4 right-4 bg-red-500/90 px-3 py-2 rounded-lg">
            <Text className="text-white text-xs font-bold">🔴 LIVE</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View className="flex-1 p-4">
        <View className="bg-gray-900 rounded-lg p-4 mb-4">
          <Text className="text-white text-lg font-semibold mb-2">
            🤖 Live AI Analysis
          </Text>
          <Text className="text-gray-300 text-sm mb-4">
            Real-time person detection with WebSocket streaming
          </Text>

          {!isStreaming ? (
            <TouchableOpacity
              onPress={startLiveAnalysis}
              className="bg-green-600 rounded-lg py-3 px-4 flex-row items-center justify-center"
            >
              <Ionicons name="play" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Start Live Analysis
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={stopLiveAnalysis}
              className="bg-red-600 rounded-lg py-3 px-4 flex-row items-center justify-center"
            >
              <Ionicons name="stop" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Stop Analysis
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent detections */}
        {detections.length > 0 && (
          <View className="bg-gray-900 rounded-lg p-4">
            <Text className="text-white text-lg font-semibold mb-2">
              Recent Detections
            </Text>
            {detections.slice(-5).map((detection, index) => (
              <View
                key={index}
                className="bg-gray-800 rounded p-2 mb-2 last:mb-0"
              >
                <Text className="text-green-400 font-semibold text-sm">
                  {detection.person_name} -{" "}
                  {Math.round(detection.confidence * 100)}%
                </Text>
                <Text className="text-gray-400 text-xs">
                  {new Date(detection.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Footer />
    </View>
  );
}
