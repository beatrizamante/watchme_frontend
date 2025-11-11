import { View, Text, ScrollView } from "react-native";
import React, { useState } from "react";
import Footer from "../components/Footer";
import Input from "../components/form/Input";
import Button from "../components/Button";
import { useRouter } from "expo-router";
import { useLoginApi } from "./hooks/useLoginApi";
import { showPlatformAlert } from "../utils/alertUtils";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { register } = useLoginApi();

  const handleCreateAccount = async () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPass.trim()
    ) {
      showPlatformAlert("❌ Validation Error", "Please fill in all fields.");
      return;
    }

    if (username.trim().length < 3) {
      showPlatformAlert(
        "❌ Validation Error",
        "Username must be at least 3 characters long."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showPlatformAlert(
        "❌ Validation Error",
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      showPlatformAlert(
        "❌ Validation Error",
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPass) {
      showPlatformAlert(
        "❌ Password Mismatch",
        "The password and confirmation password must match."
      );
      return;
    }

    try {
      const data = {
        username: username.trim(),
        email: email.trim(),
        password,
      };

      const user = await register(data);

      if (user) {
        showPlatformAlert(
          "✅ Account Created!",
          `Welcome ${username}! Your account has been created successfully. Please log in.`,
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
      } else {
        showPlatformAlert(
          "❌ Registration Failed",
          "There was an error creating your account. The email might already be in use."
        );
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error?.message || "An unexpected error occurred during registration.";
      showPlatformAlert("❌ Registration Error", errorMessage);
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 160,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-between items-center px-6">
          <View className="flex flex-col justify-center items-center gap-4 mb-2">
            <Text className="text-darker text-center text-xl font-semibold">
              Enter information for sign up:
            </Text>
            <Input
              label="username"
              value={username}
              handler={setUsername}
              isPassword={false}
            />
            <Input
              label="email"
              value={email}
              handler={setEmail}
              isPassword={false}
            />
            <Input
              label="password"
              value={password}
              handler={setPassword}
              isPassword={true}
            />
            <Input
              label="confirm password"
              value={confirmPass}
              handler={setConfirmPass}
              isPassword={true}
            />
            <Button content="Sign Up!" onPress={handleCreateAccount} />
          </View>
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
