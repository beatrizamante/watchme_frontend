import { View, Text, Pressable, Image } from "react-native";
import * as Linking from "expo-linking";

export default function Footer() {
  const handleGitHubPress = () => {
    Linking.openURL("https://github.com/beatrizamante/projeto_pma");
  };

  return (
    <View className="h-[80px] bg-darker flex flex-row justify-between items-end py-6 px-6">
      <Text className="text-lg text-lighter font-semibold">
        © 2025 WatchMe — All rights reserved
      </Text>
      <Pressable onPress={handleGitHubPress}>
        <Image source={require("../assets/github.svg")}></Image>
      </Pressable>
    </View>
  );
}
