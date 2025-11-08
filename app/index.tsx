import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import React, { useEffect } from "react";
import Footer from "../components/Footer";
import Input from "../components/form/Input";
import Button from "../components/Button";
import { useRouter } from "expo-router";
import { useAuth } from "../stores/useAuth";
import { useLoginApi } from "./hooks/useLoginApi";

export default function Home() {
  const router = useRouter();
  const logInfo = useAuth((state) => state.login);
  const { login } = useLoginApi();
  const [email, onChangeLogin] = React.useState("");
  const [password, onChangePassword] = React.useState("");

  useEffect(() => {
    const setup = async () => {
      console.log("Tables created");
    };
    setup();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await login({ email, password });
      const { user } = response;

      if (!user || user === null || !user.username) {
        Alert.alert(
          "Login Error",
          "There was an error logging in. Does your user exist? Please, create an account."
        );
        return;
      }

      logInfo({
        name: user.username,
        role: user.role,
      });

      setTimeout(() => {
        if (user.role.toLowerCase() === "admin") {
          router.replace("/(admin)");
        } else {
          router.replace("/(user)");
        }
      }, 100);
    } catch (error) {
      Alert.alert("Login Error", "An unexpected error occurred during login.");
      console.error("Login error:", error);
    }
  };

  const handleGoToSignUp = () => {
    router.push("/signup");
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
        <View className="flex flex-col justify-center items-center gap-4">
          <Input
            label="email"
            value={email}
            handler={onChangeLogin}
            isPassword={false}
          />
          <Input
            label="password"
            value={password}
            handler={onChangePassword}
            isPassword={true}
          />
          <Button content="Join Our Reign!" onPress={handleLogin} />
          <Text className="pt-6 text-darker font-semibold text-lg">
            Don’t have an account yet?{" "}
          </Text>
          <TouchableOpacity onPress={handleGoToSignUp}>
            <Text className="text-xl text-semidark font-semibold">
              Sign Up!
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
