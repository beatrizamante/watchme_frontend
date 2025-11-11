import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { usePeopleApi } from "../app/hooks/usePeopleApi";
import Person from "../app/interfaces/person";
import Ionicons from "@expo/vector-icons/Ionicons";

interface PersonSelectorProps {
  selectedPersonId?: string;
  onPersonSelect: (person: Person | null) => void;
  style?: any;
}

export default function PersonSelector({
  selectedPersonId,
  onPersonSelect,
  style,
}: PersonSelectorProps) {
  const { list, loading, error } = usePeopleApi();
  const [people, setPeople] = useState<Person[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const allPeople = await list();
        if (allPeople && Array.isArray(allPeople)) {
          setPeople(allPeople);
        }
      } catch (err) {
        console.error("Error fetching people:", err);
      }
    };
    fetchPeople();
  }, []);

  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  return (
    <View
      style={style}
      className="bg-semilight border border-semidark rounded-lg p-4"
    >
      <Text className="text-darker font-semibold mb-3">
        Select Person to Track
      </Text>

      {/* Selected Person Display */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row justify-between items-center p-3 bg-white border border-gray-300 rounded-lg"
      >
        <View className="flex-row items-center flex-1">
          {selectedPerson ? (
            <>
              <View className="w-8 h-8 bg-blue-500 rounded-full mr-3 items-center justify-center">
                <Text className="text-white font-bold text-xs">
                  {selectedPerson.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-darker font-medium">
                {selectedPerson.name}
              </Text>
            </>
          ) : (
            <>
              <View className="w-8 h-8 bg-gray-300 rounded-full mr-3 items-center justify-center">
                <Ionicons name="person" size={16} color="#666" />
              </View>
              <Text className="text-gray-500">Choose a person to track</Text>
            </>
          )}
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {/* Person List */}
      {isExpanded && (
        <View className="mt-2 max-h-48">
          {loading ? (
            <Text className="text-gray-500 text-center p-4">
              Loading people...
            </Text>
          ) : error ? (
            <Text className="text-red-500 text-center p-4">Error: {error}</Text>
          ) : people.length === 0 ? (
            <Text className="text-gray-500 text-center p-4">
              No people found. Create a person first.
            </Text>
          ) : (
            <ScrollView className="max-h-48">
              {/* Clear Selection Option */}
              {selectedPersonId && (
                <TouchableOpacity
                  onPress={() => {
                    onPersonSelect(null);
                    setIsExpanded(false);
                  }}
                  className="flex-row items-center p-3 border-b border-gray-200"
                >
                  <View className="w-8 h-8 bg-gray-300 rounded-full mr-3 items-center justify-center">
                    <Ionicons name="close" size={16} color="#666" />
                  </View>
                  <Text className="text-gray-600 italic">Clear selection</Text>
                </TouchableOpacity>
              )}

              {people.map((person) => (
                <TouchableOpacity
                  key={person.id}
                  onPress={() => {
                    onPersonSelect(person);
                    setIsExpanded(false);
                  }}
                  className={`flex-row items-center p-3 border-b border-gray-200 ${
                    selectedPersonId === person.id ? "bg-blue-50" : ""
                  }`}
                >
                  <View
                    className={`w-8 h-8 rounded-full mr-3 items-center justify-center ${
                      selectedPersonId === person.id
                        ? "bg-blue-500"
                        : "bg-gray-400"
                    }`}
                  >
                    <Text className="text-white font-bold text-xs">
                      {person.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    className={`flex-1 ${
                      selectedPersonId === person.id
                        ? "text-blue-700 font-medium"
                        : "text-darker"
                    }`}
                  >
                    {person.name}
                  </Text>
                  {selectedPersonId === person.id && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}
