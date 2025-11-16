import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Person from "../interfaces/person";
import { usePeopleApi } from "../hooks/usePeopleApi";
import { useTracking } from "../../stores/useTracking";
import Ionicons from "@expo/vector-icons/Ionicons";
import { showPlatformAlert } from "../../utils/alertUtils";

export default function peopleList() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const { list } = usePeopleApi();
  const {
    selectedVideoId,
    selectedPersonId,
    setSelectedPerson,
    canStartTracking,
    startTracking,
    isTrackingMode,
    tracker,
    isProcessingVideo,
  } = useTracking();

  useEffect(() => {
    const fetchPeople = async () => {
      const allPeople = await list();
      if (!allPeople) return;
      setPeople(allPeople);
    };
    fetchPeople();
  }, []);

  const handlePersonSelect = (personId: string) => {
    setSelectedPerson(personId);
  };

  const handleStartLiveTracking = () => {
    if (canStartTracking) {
      startTracking();
      router.push("/(user)/liveTracking");
    }
  };

  const handleSearchInVideos = () => {
    if (selectedPersonId && selectedVideoId && !isProcessingVideo) {
      router.push("/(user)/searchPerson");
    } else if (isProcessingVideo) {
      showPlatformAlert(
        "Video Processing",
        "Please wait for the current video analysis to complete before starting a new search.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <>
      <ScrollView
        nestedScrollEnabled={true}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 160,
          flexGrow: 1,
        }}
      >
        <View className="flex flex-col gap-6 px-6">
          <View className="flex flex-row justify-start items-center w-full pl-2 mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-lg text-darker font-semibold">Back</Text>
            </TouchableOpacity>
          </View>
          <View className="flex justify-center items-center w-full mb-4">
            <Text className="text-darker text-center font-semibold">
              Select Person to Track
            </Text>
          </View>

          {selectedVideoId && (
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Text className="text-blue-800 font-semibold">
                Video Selected: {selectedVideoId}
              </Text>
              <Text className="text-blue-600 text-sm mt-1">
                Now choose a person to track in this video
              </Text>
            </View>
          )}

          <View className="flex flex-col gap-4">
            <Text className="text-darker text-center text-lg font-semibold">
              Select a person to find:
            </Text>

            <Button
              content="Create new person!"
              onPress={() => router.push("/(user)/peopleManagement")}
            />

            <View className="h-[250px]">
              <FlatList
                data={people}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handlePersonSelect(item.id.toString())}
                    className={`p-4 mb-2 rounded-lg border ${
                      selectedPersonId === item.id
                        ? "bg-blue-100 border-blue-300"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="person"
                        size={20}
                        color={
                          selectedPersonId === item.id ? "#3B82F6" : "#666"
                        }
                      />
                      <Text
                        className={`ml-3 font-medium ${
                          selectedPersonId === item.id
                            ? "text-blue-800"
                            : "text-darker"
                        }`}
                      >
                        {item.name}
                      </Text>
                      {selectedPersonId === item.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#3B82F6"
                          className="ml-auto"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                nestedScrollEnabled={true}
                className="flex gap-y-4 p-4 bg-semilight rounded-lg"
              />
            </View>

            {selectedPersonId && (
              <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Text className="text-green-800 font-semibold">
                  ✓ Person Selected: ID {selectedPersonId}
                </Text>
              </View>
            )}

            {isProcessingVideo && (
              <View className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <View className="flex-row items-center">
                  <Ionicons name="hourglass" size={20} color="#EA580C" />
                  <Text className="text-orange-800 font-semibold ml-2">
                    🤖 AI Processing in Progress
                  </Text>
                </View>
                <Text className="text-orange-700 text-sm mt-1">
                  Please wait for the current video analysis to complete before
                  starting a new search.
                </Text>
              </View>
            )}
          </View>

          {canStartTracking && (
            <View className="flex flex-col gap-4 mt-4">
              <Text className="text-darker text-center text-lg font-semibold">
                Choose tracking method:
              </Text>

              <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                <Text className="text-red-800 font-semibold mb-2">
                  🔴 Live Feed Tracking (WebSocket)
                </Text>
                <Text className="text-red-700 text-sm mb-3">
                  For real-time tracking from a live camera feed. Requires you
                  to connect a live video source.
                </Text>
                <Button
                  content="Start Live Tracking"
                  onPress={handleStartLiveTracking}
                />
              </View>

              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Text className="text-blue-800 font-semibold mb-2">
                  📹 Search in Uploaded Video
                </Text>
                <Text className="text-blue-700 text-sm mb-3">
                  Go to detection page where you can manually start AI analysis
                  of the uploaded video file.
                </Text>
                <TouchableOpacity
                  onPress={handleSearchInVideos}
                  disabled={isProcessingVideo}
                  className={`rounded-lg p-3 ${
                    isProcessingVideo
                      ? "bg-gray-200 border border-gray-300"
                      : "bg-blue-100 border border-blue-300"
                  }`}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name={isProcessingVideo ? "hourglass" : "arrow-forward"}
                      size={20}
                      color={isProcessingVideo ? "#9CA3AF" : "#3B82F6"}
                    />
                    <Text
                      className={`font-semibold ml-2 ${
                        isProcessingVideo ? "text-gray-500" : "text-blue-800"
                      }`}
                    >
                      {isProcessingVideo ? "Processing..." : "Go to Detection"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isTrackingMode && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4">
              <View className="flex-row items-center">
                <View
                  className={`w-3 h-3 rounded-full mr-2 ${
                    tracker.status.connected
                      ? "bg-green-500"
                      : tracker.status.connecting
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <Text className="text-red-800 font-semibold">
                  Live Tracking:{" "}
                  {tracker.status.connected
                    ? "Connected"
                    : tracker.status.connecting
                    ? "Connecting..."
                    : "Disconnected"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
