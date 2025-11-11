import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../stores/useAuth";

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/");
      } else if (user?.role?.toLowerCase() !== "admin") {
        router.replace("/(user)");
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role?.toLowerCase() !== "admin") {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="userList" options={{ headerShown: false }} />
      <Stack.Screen name="userManagement" options={{ headerShown: false }} />
      <Stack.Screen name="peopleList" options={{ headerShown: false }} />
      <Stack.Screen name="peopleManagement" options={{ headerShown: false }} />
      <Stack.Screen name="videoList" options={{ headerShown: false }} />
      <Stack.Screen name="videoManagement" options={{ headerShown: false }} />
      <Stack.Screen name="searchPerson" options={{ headerShown: false }} />
    </Stack>
  );
}
