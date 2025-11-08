import React, { useEffect } from "react";
import "../global.css";
import { Stack } from "expo-router";
import NavBar from "../components/NavBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "../stores/useAuth";

export default function Layout() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          header: () => <NavBar />,
        }}
      >
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="signup" options={{ title: "Register" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
