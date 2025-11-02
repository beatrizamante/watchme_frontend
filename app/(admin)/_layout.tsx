import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../stores/useAuth";

export default function AdminLayout() {
  const { user } = useAuth();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="userList" options={{ headerShown: false }} />
      <Stack.Screen name="userManagement" options={{ headerShown: false }} />
      <Stack.Screen name="peopleList" options={{ headerShown: false }} />
    </Stack>
  );
}
