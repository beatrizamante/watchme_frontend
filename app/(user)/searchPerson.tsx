import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import Footer from "../../components/Footer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PersonDetection } from "../interfaces/person";
import { useTracking } from "../../stores/useTracking";
import { usePeopleApi } from "../hooks/usePeopleApi";

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
  const screenWidth = Dimensions.get("window").width;
  const videoHeight = (screenWidth - 48) * 0.6;

  const { selectedVideoId, selectedPersonId, clearSelection } = useTracking();
  const { search } = usePeopleApi();
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [personData, setPersonData] = useState<PersonData | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedDetection, setSelectedDetection] =
    useState<PersonDetection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const player = useVideoPlayer(videoData?.path || "", (player: any) => {
    player.loop = false;

    player.addListener("statusChange", (status: any) => {
      if (status.isLoaded && player.duration && videoData) {
        setVideoData((prev) =>
          prev ? { ...prev, duration: player.duration } : null
        );
      }
    });
  });

  useEffect(() => {
    const loadData = async () => {
      if (!selectedVideoId || !selectedPersonId) {
        setError(
          "No video or person selected. Please go back and select both."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const searchResult = await search(
          Number(selectedPersonId),
          selectedVideoId
        );
        if (!searchResult) {
          throw new Error("No search results found");
        }

        setVideoData({
          id: Number(searchResult.video.id),
          name: `Video ${searchResult.video.id}`,
          path: searchResult.video.path,
          duration: searchResult.video.length || 0,
        });

        const detections: PersonDetection[] = searchResult.matches.map(
          (match: any) => ({
            timestamp: match.timestamp || 0,
            bbox: {
              x: match.bbox?.x || 0,
              y: match.bbox?.y || 0,
              width: match.bbox?.width || 100,
              height: match.bbox?.height || 100,
            },
          })
        );

        setPersonData({
          id: Number(searchResult.person.id),
          name: searchResult.person.name,
          embedding: [],
          detections: detections,
        });

        setLoading(false);
      } catch (err: any) {
        console.error("Error loading search results:", err);
        setError(err.message || "Failed to load search results");
        setLoading(false);
      }
    };

    loadData();
  }, [selectedVideoId, selectedPersonId, search]);

  const jumpToTimestamp = (timestamp: number) => {
    try {
      if (player) {
        player.currentTime = timestamp;
        setCurrentTime(timestamp);
        console.log(`Jumping to timestamp: ${timestamp}s`);
      }
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
    if (personData?.detections) {
      const currentDetection = personData.detections.find(
        (detection) => Math.abs(detection.timestamp - currentTime) < 0.5
      );
      setSelectedDetection(currentDetection || null);
    }
  }, [currentTime, personData?.detections]);

  const handleBack = () => {
    clearSelection();
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
        <View className="flex flex-col gap-4 mb-2">
          <View className="flex flex-row justify-start items-center w-full pl-2 mb-4">
            <TouchableOpacity className="flex" onPress={handleBack}>
              <Text className="text-lg text-darker font-semibold">Back</Text>
            </TouchableOpacity>
          </View>
          <View className="flex justify-center items-center w-full mb-4">
            <Text className="text-darker text-center font-semibold">
              Search Results
            </Text>
          </View>

          {loading && (
            <View className="flex justify-center items-center py-10">
              <Text className="text-darker text-lg">
                Loading video and person data...
              </Text>
            </View>
          )}

          {error && (
            <View className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <Text className="text-red-800 font-semibold">Error:</Text>
              <Text className="text-red-700">{error}</Text>
              <TouchableOpacity
                onPress={handleBack}
                className="mt-3 bg-red-100 p-2 rounded"
              >
                <Text className="text-red-800 text-center">Go Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && videoData && personData && (
            <>
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
                      left: selectedDetection.bbox.x * 0.8,
                      top: selectedDetection.bbox.y * 0.8,
                      width: selectedDetection.bbox.width * 0.8,
                      height: selectedDetection.bbox.height * 0.8,
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
                    {formatTime(currentTime)} /{" "}
                    {formatTime(player?.duration || 0)}
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
                        {detection.bbox.width}×{detection.bbox.height}
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
            </>
          )}
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
