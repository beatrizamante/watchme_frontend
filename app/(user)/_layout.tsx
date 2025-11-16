import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../stores/useAuth";

export default function UserLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/");
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

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
