import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../stores/useAuth";

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isAuthenticated || user?.role?.toLowerCase() !== "admin") {
        router.replace("/");
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role?.toLowerCase() !== "admin") {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="userList" options={{ headerShown: false }} />
      <Stack.Screen name="userManagement" options={{ headerShown: false }} />
      <Stack.Screen name="peopleList" options={{ headerShown: false }} />
    </Stack>
  );
}
