import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../stores/useAuth";
import Ionicons from "@expo/vector-icons/Ionicons";

interface NavigationCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  description,
  icon,
  onPress,
  color = "blue",
}) => {
  const isBlue = color === "blue";
  const cardStyle = isBlue
    ? "bg-white border-2 border-blue-200 rounded-lg p-4 mb-4 shadow-lg active:bg-blue-50"
    : "bg-white border-2 border-red-200 rounded-lg p-4 mb-4 shadow-lg active:bg-red-50";

  return (
    <TouchableOpacity onPress={onPress} className={cardStyle}>
      <View className="flex-row items-center mb-2">
        <Ionicons
          name={icon}
          size={24}
          color={isBlue ? "#3B82F6" : "#EF4444"}
        />
        <Text className="text-lg font-semibold text-darker ml-3">{title}</Text>
      </View>
      <Text className="text-semidark">{description}</Text>
    </TouchableOpacity>
  );
};

export default function RoleBasedNavigation() {
  const router = useRouter();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const baseRoute = isAdmin ? "/(admin)" : "/(user)";

  return (
    <View className="px-6">
      {/* Common Features for Both Users and Admins */}
      <Text className="text-xl font-bold text-darker mb-4">
        Media Management
      </Text>

      <NavigationCard
        title="My Videos"
        description="Upload, view, and manage your videos"
        icon="videocam"
        onPress={() => router.push(`${baseRoute}/videoList`)}
      />

      <NavigationCard
        title="My People"
        description="Create and manage people for recognition"
        icon="people"
        onPress={() => router.push(`${baseRoute}/peopleList`)}
      />

      <NavigationCard
        title="Search Person"
        description="Find people in your videos using AI"
        icon="search"
        onPress={() => router.push(`${baseRoute}/findPeople`)}
      />

      {/* Admin-Only Features */}
      {isAdmin && (
        <>
          <Text className="text-xl font-bold text-darker mb-4 mt-6">
            Admin Panel
          </Text>

          <NavigationCard
            title="All Users"
            description="Manage system users and permissions"
            icon="person-circle"
            onPress={() => router.push("/(admin)/userList")}
            color="red"
          />

          <NavigationCard
            title="System Management"
            description="Advanced system settings and controls"
            icon="settings"
            onPress={() => router.push("/(admin)/userManagement")}
            color="red"
          />
        </>
      )}
    </View>
  );
}
