import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

interface ToggleProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

export default function Toggle({ label, value, onToggle }: ToggleProps) {
  return (
    <View className="w-[350px] h-[70px] border border-semidark rounded-[25px] bg-semilight shadow-black shadow-lg px-4 pt-3 justify-center">
      <Text className="absolute top-1 left-4 text-lg font-semibold text-semidark px-1">
        {label}
      </Text>
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-lg text-darker font-medium">
          {value ? "Active" : "Inactive"}
        </Text>
        <TouchableOpacity
          onPress={() => onToggle(!value)}
          className={`w-14 h-7 rounded-full p-1 ${
            value ? "bg-green-500" : "bg-gray-400"
          }`}
          activeOpacity={0.8}
        >
          <View
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              value ? "translate-x-7" : "translate-x-0"
            }`}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
