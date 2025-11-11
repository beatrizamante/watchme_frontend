import { Platform } from "react-native";

// Cross-platform alert function
export const showPlatformAlert = (
  title: string,
  message: string,
  buttons?: Array<{ text: string; onPress?: () => void; style?: string }>
) => {
  console.log("🚨 Alert called:", title, message);

  // Always use browser alerts for web to ensure compatibility
  if (Platform.OS === "web" || typeof window !== "undefined") {
    // Simple browser alert that works in all browsers including Opera
    window.alert(`${title}\n\n${message}`);

    // If there's a callback action, execute it
    if (buttons && buttons.length > 0 && buttons[0]?.onPress) {
      buttons[0].onPress();
    }

    return;
  }

  // For native platforms
  try {
    const { Alert } = require("react-native");
    Alert.alert(title, message, buttons);
  } catch (error) {
    console.error("Alert error:", error);
    console.log(`${title}: ${message}`);
  }
};
