import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, Dimensions } from "react-native";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onClose: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: "OK" }],
  onClose,
}) => {
  const screenWidth = Dimensions.get("window").width;

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View
          className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm w-full"
          style={{ minWidth: Math.min(screenWidth - 48, 300) }}
        >
          {/* Header */}
          <View className="p-6 pb-4">
            <Text className="text-lg font-bold text-darker mb-3 text-center">
              {title}
            </Text>
            <Text className="text-base text-semidark text-center leading-5">
              {message}
            </Text>
          </View>

          {/* Buttons */}
          <View className="border-t border-gray-200">
            {buttons.length === 1 ? (
              <TouchableOpacity
                onPress={() => handleButtonPress(buttons[0])}
                className="p-4 items-center"
              >
                <Text className="text-blue-600 font-semibold text-lg">
                  {buttons[0].text}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row">
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleButtonPress(button)}
                    className={`flex-1 p-4 items-center ${
                      index > 0 ? "border-l border-gray-200" : ""
                    }`}
                  >
                    <Text
                      className={`font-semibold text-lg ${
                        button.style === "destructive"
                          ? "text-red-600"
                          : button.style === "cancel"
                          ? "text-gray-600"
                          : "text-blue-600"
                      }`}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Custom hook to manage alerts
interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
}

export const useCustomAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  const showAlert = (
    title: string,
    message: string,
    buttons?: AlertButton[]
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: "OK" }],
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => (
    <CustomAlert
      visible={alert.visible}
      title={alert.title}
      message={alert.message}
      buttons={alert.buttons}
      onClose={hideAlert}
    />
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};
