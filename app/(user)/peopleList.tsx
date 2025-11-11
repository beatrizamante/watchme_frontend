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
import List from "../../components/list/List";
import Button from "../../components/Button";
import Person from "../interfaces/person";
import { usePeopleApi } from "../hooks/usePeopleApi";
import { useTracking } from "../../stores/useTracking";
import Ionicons from "@expo/vector-icons/Ionicons";

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
      Alert.alert(
        "Live Tracking Started",
        "WebSocket connection established. You'll see real-time person detection.",
        [{ text: "OK", onPress: () => router.push("/(user)/searchPerson") }]
      );
    }
  };

  const handleSearchInVideos = () => {
    if (selectedPersonId) {
      // Navigate to regular video search
      router.push("/(user)/searchPerson");
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
          {/* Header with back button */}
          <View className="flex flex-row justify-between items-center w-full">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-lg text-darker font-semibold">Back</Text>
            </TouchableOpacity>
            <Text className="text-darker text-center font-semibold">
              Select Person to Track
            </Text>
            <View className="w-12" />
          </View>

          {/* Video selection status */}
          {selectedVideoId && (
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Text className="text-blue-800 font-semibold">
                📹 Video Selected: ID {selectedVideoId}
              </Text>
              <Text className="text-blue-600 text-sm mt-1">
                Now choose a person to track in this video
              </Text>
            </View>
          )}

          {/* Person selection */}
          <View className="flex flex-col gap-4">
            <Text className="text-darker text-center text-lg font-semibold">
              Select a person to find:
            </Text>

            {/* Custom person selector for tracking */}
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

            {/* Selected person indicator */}
            {selectedPersonId && (
              <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Text className="text-green-800 font-semibold">
                  ✓ Person Selected: ID {selectedPersonId}
                </Text>
              </View>
            )}
          </View>

          {/* Tracking options */}
          {canStartTracking && (
            <View className="flex flex-col gap-4 mt-4">
              <Text className="text-darker text-center text-lg font-semibold">
                Choose tracking method:
              </Text>

              <Button
                content="🔴 Start Live Tracking (WebSocket)"
                onPress={handleStartLiveTracking}
              />

              <TouchableOpacity
                onPress={handleSearchInVideos}
                className="bg-gray-100 border border-gray-300 rounded-lg p-4"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="search" size={20} color="#666" />
                  <Text className="text-gray-700 font-semibold ml-2">
                    Search in Saved Videos
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* WebSocket status */}
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
