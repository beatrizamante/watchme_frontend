import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import Footer from "../../components/Footer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PersonDetection } from "../interfaces/person";

interface VideoData {
  id: number;
  name: string;
  path: string;
  duration: number;
}

interface PersonData {
  id: number;
  name: string;
  embedding: number[];
  detections: PersonDetection[];
}

export default function SearchPerson() {
  const router = useRouter();

  // Mock data for now - replace with actual backend data
  const [videoData, setVideoData] = useState<VideoData>({
    id: 1,
    name: "Sample Video",
    path: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
    duration: 596,
  });

  const [personData, setPersonData] = useState<PersonData>({
    id: 1,
    name: "John Doe",
    embedding: [],
    detections: [
      {
        timestamp: 15.5,
        boundingBox: { x: 100, y: 50, width: 80, height: 120 },
      },
      {
        timestamp: 45.2,
        boundingBox: { x: 200, y: 80, width: 85, height: 125 },
      },
      {
        timestamp: 78.8,
        boundingBox: { x: 150, y: 60, width: 75, height: 115 },
      },
    ],
  });

  // expo-video player setup
  const player = useVideoPlayer(videoData.path, (player: any) => {
    player.loop = false;
    // Don't auto-play, let user control it
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [selectedDetection, setSelectedDetection] =
    useState<PersonDetection | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const videoHeight = (screenWidth - 48) * 0.6;

  const handleBack = () => {
    router.back();
  };

  const jumpToTimestamp = (timestamp: number) => {
    try {
      player.currentTime = timestamp;
      setCurrentTime(timestamp);
      console.log(`Jumping to timestamp: ${timestamp}s`);
    } catch (error) {
      console.error("Error seeking video:", error);
    }
  };

  const handlePlayPause = () => {
    try {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.error("Error controlling video playback:", error);
    }
  };

  // Listen to player time changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (player && player.currentTime !== undefined) {
        setCurrentTime(player.currentTime);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const currentDetection = personData.detections.find(
      (detection) => Math.abs(detection.timestamp - currentTime) < 0.5
    );
    setSelectedDetection(currentDetection || null);
  }, [currentTime, personData.detections]);

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
          <View className="flex flex-row justify-between items-center w-full px-7">
            <TouchableOpacity className="flex w-[140px]" onPress={handleBack}>
              <Text className="text-lg text-darker font-semibold text-center">
                Back
              </Text>
            </TouchableOpacity>
            <Text className="text-darker text-center font-semibold">
              Search Results
            </Text>
            <View className="w-[140px]" />
          </View>

          <View
            className="bg-black rounded-lg overflow-hidden relative"
            style={{ height: videoHeight }}
          >
            <VideoView
              style={{ width: "100%", height: "100%" }}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
            />

            {selectedDetection && (
              <View
                className="absolute border-2 border-red-500 bg-red-500/20"
                style={{
                  left: selectedDetection.boundingBox.x * 0.8,
                  top: selectedDetection.boundingBox.y * 0.8,
                  width: selectedDetection.boundingBox.width * 0.8,
                  height: selectedDetection.boundingBox.height * 0.8,
                }}
              >
                <View className="bg-red-500 px-2 py-1 rounded-sm">
                  <Text className="text-white text-xs font-bold">
                    {personData.name}
                  </Text>
                </View>
              </View>
            )}

            <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 flex-row justify-between items-center">
              <TouchableOpacity onPress={handlePlayPause}>
                <Ionicons
                  name={player?.playing ? "pause" : "play"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <View className="flex-1 mx-4">
                <View className="h-1 bg-gray-600 rounded-full">
                  <View
                    className="h-1 bg-white rounded-full"
                    style={{
                      width: `${
                        player?.duration
                          ? (currentTime / player.duration) * 100
                          : 0
                      }%`,
                    }}
                  />
                </View>
              </View>

              <Text className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(player?.duration || 0)}
              </Text>
            </View>
          </View>

          <View className="bg-semilight border border-semidark rounded-lg p-4">
            <Text className="text-darker text-lg font-semibold mb-2">
              Tracking: {personData.name}
            </Text>
            <Text className="text-semidark">
              Found {personData.detections.length} instances in this video
            </Text>
          </View>

          <View className="bg-semilight border border-semidark rounded-lg p-4">
            <Text className="text-darker text-lg font-semibold mb-3">
              Detection Timeline
            </Text>
            {personData.detections.map((detection, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => jumpToTimestamp(detection.timestamp)}
                className={`flex-row justify-between items-center p-3 mb-2 rounded-lg ${
                  selectedDetection?.timestamp === detection.timestamp
                    ? "bg-blue-100 border border-blue-300"
                    : "bg-white border border-gray-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons name="person" size={20} color="#666" />
                  <Text className="ml-2 text-darker font-medium">
                    Detection {index + 1}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-darker font-semibold">
                    {formatTime(detection.timestamp)}
                  </Text>
                  <Text className="text-semidark text-sm">
                    {detection.boundingBox.width}×{detection.boundingBox.height}
                    px
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View className="bg-gray-100 border border-gray-300 rounded-lg p-4">
            <Text className="text-gray-600 font-semibold mb-2">
              Debug Info:
            </Text>
            <Text className="text-gray-600 text-sm">
              Video ID: {videoData.id} | Person ID: {personData.id}
            </Text>
            <Text className="text-gray-600 text-sm">
              Current Detection: {selectedDetection ? "Active" : "None"}
            </Text>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
