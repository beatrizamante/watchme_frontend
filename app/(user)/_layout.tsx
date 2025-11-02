import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../stores/useAuth";

export default function UserLayout() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="videoList" options={{ headerShown: false }} />
      <Stack.Screen name="videoManagement" options={{ headerShown: false }} />
      <Stack.Screen name="peopleList" options={{ headerShown: false }} />
      <Stack.Screen name="peopleManagement" options={{ headerShown: false }} />
      <Stack.Screen name="searchPerson" options={{ headerShown: false }} />
    </Stack>
  );
}
