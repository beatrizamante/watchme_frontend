import { Platform } from "react-native";

export const showPlatformAlert = (
  title: string,
  message: string,
  buttons?: Array<{ text: string; onPress?: () => void; style?: string }>
) => {
  console.log("Alert called:", title, message);

  if (Platform.OS === "web" || typeof window !== "undefined") {
    window.alert(`${title}\n\n${message}`);

    if (buttons && buttons.length > 0 && buttons[0]?.onPress) {
      buttons[0].onPress();
    }

    return;
  }

  try {
    const { Alert } = require("react-native");
    Alert.alert(title, message, buttons);
  } catch (error) {
    console.error("Alert error:", error);
    console.log(`${title}: ${message}`);
  }
};
