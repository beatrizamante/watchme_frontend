import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../stores/useAuth";
import Card from "./Card";

export default function RoleBasedNavigation() {
  const router = useRouter();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  return (
    <View className="flex flex-row gap-6 justify-center items-center pt-4">
      <Card
        title="Videos"
        content="Upload, view, and manage your videos"
        uri={require("../assets/manage_videos.png")}
        onPress={() => router.push("/(user)/videoList")}
      />

      <Card
        title="People"
        content="Create and manage people for recognition"
        uri={require("../assets/manage_people.png")}
        onPress={() =>
          router.push(`${isAdmin ? "/(admin)" : "/(user)"}/peopleList`)
        }
      />

      <Card
        title="Search Person"
        content="Find people in your videos using AI"
        uri={require("../assets/finding_people.png")}
        onPress={() => router.push("/(user)/searchPerson")}
      />

      {isAdmin && (
        <>
          <Card
            title="All Users"
            content="Manage system users and permissions"
            uri={require("../assets/manage_users.png")}
            onPress={() => router.push("/(admin)/userList")}
          />
        </>
      )}
    </View>
  );
}
