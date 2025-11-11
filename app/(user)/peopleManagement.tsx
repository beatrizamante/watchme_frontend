import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import Button from "../../components/Button";
import Footer from "../../components/Footer";
import Input from "../../components/form/Input";
import { usePeopleApi } from "../hooks/usePeopleApi";
import { showPlatformAlert } from "../../utils/alertUtils";

export default function PeopleManagement() {
  const router = useRouter();
  const { create, loading, error } = usePeopleApi();
  const [name, setName] = useState<string>("");
  const [selectedImage, setSelectedImage] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const selectPersonImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: false,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedFile = result.assets[0];

        // Validate file type
        if (!selectedFile.mimeType?.startsWith("image/")) {
          showPlatformAlert(
            "❌ Invalid File",
            "Please select a valid image file (JPG, PNG, etc.)"
          );
          return;
        }

        setSelectedImage(selectedFile);
        console.log(
          "Selected file URI type:",
          selectedFile.uri.startsWith("data:") ? "base64 data URI" : "file URI"
        );
        showPlatformAlert(
          "✅ Image Selected",
          `Selected: ${selectedFile.name}`
        );
      } else if (result.canceled) {
        console.log("Image selection cancelled by user");
      }
    } catch (error: any) {
      console.error("Error selecting image:", error);
      showPlatformAlert(
        "❌ Selection Error",
        "Failed to select image file. Please try again."
      );
    }
  };

  const handleCreate = async () => {
    // Validation
    if (!name.trim()) {
      showPlatformAlert("❌ Validation Error", "Please enter a person's name");
      return;
    }

    if (name.trim().length < 2) {
      showPlatformAlert(
        "❌ Validation Error",
        "Person's name must be at least 2 characters long"
      );
      return;
    }

    if (!selectedImage) {
      showPlatformAlert(
        "❌ Validation Error",
        "Please select a person's image"
      );
      return;
    }

    // Validate image size (optional)
    const maxSizeInMB = 10;
    if (selectedImage.size && selectedImage.size > maxSizeInMB * 1024 * 1024) {
      showPlatformAlert(
        "❌ File Too Large",
        `Image file must be smaller than ${maxSizeInMB}MB. Current size: ${(
          selectedImage.size /
          (1024 * 1024)
        ).toFixed(2)}MB`
      );
      return;
    }

    try {
      const imageFile = {
        uri: selectedImage.uri,
        type: selectedImage.mimeType || "image/jpeg",
        name: selectedImage.name || "image.jpeg",
      };

      const result = await create({
        name: name.trim(),
        file: imageFile,
      });

      if (result) {
        showPlatformAlert(
          "✅ Success",
          `Person "${name.trim()}" created successfully!`,
          [
            {
              text: "Create Another",
              onPress: () => {
                setName("");
                setSelectedImage(null);
              },
            },
            { text: "Go Back", onPress: () => router.back() },
          ]
        );
      } else {
        showPlatformAlert(
          "❌ Creation Failed",
          "The person could not be created. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Error creating person:", error);
      const errorMessage =
        error?.message ||
        "An unexpected error occurred while creating the person.";
      showPlatformAlert("❌ Creation Error", errorMessage, [
        { text: "Retry", onPress: () => handleCreate() },
        { text: "Cancel", style: "cancel" },
      ]);
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
        <View className="flex flex-col justify-center items-center gap-4 mb-2">
          <View className="flex flex-row justify-start items-center w-full pl-2">
            <TouchableOpacity className="flex" onPress={() => router.back()}>
              <Text className="text-lg text-darker font-semibold">Back</Text>
            </TouchableOpacity>
          </View>

          <Input
            label="name"
            value={name}
            handler={setName}
            isPassword={false}
          />
          <View className="w-full px-4 gap-4">
            <TouchableOpacity
              onPress={selectPersonImage}
              className="border-2 border-dashed border-gray-400 bg-gray-50 p-6 rounded-lg items-center"
            >
              <Text className="text-lg text-gray-600 font-semibold">
                {selectedImage ? "Change Person Image" : "Select Person Image"}
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                Required for person recognition
              </Text>
            </TouchableOpacity>

            {selectedImage && (
              <View className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <Text className="text-green-800 font-semibold">
                  Selected Image:
                </Text>
                <Text className="text-green-700 mt-1">
                  {selectedImage.name}
                </Text>
              </View>
            )}

            {error && (
              <View className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <Text className="text-red-800">Error: {error}</Text>
              </View>
            )}
          </View>
          <Text className="text-lg text-darker font-semibold text-center px-4">
            Upload a clear photo of the person for reidentification
          </Text>

          {loading || !name.trim() || !selectedImage ? (
            <View className="h-[60px] opacity-50">
              <TouchableOpacity
                disabled={true}
                className="bg-gray-400 px-[30px] py-3 min-w-[160px] w-full min-h-[36px] h-full flex justify-center items-center rounded-[25px] border-gray-300 border shadow-black shadow-lg"
              >
                <Text className="text-gray-600 text-xl font-semibold text-center">
                  {loading ? "Creating..." : "Fill All Fields"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button content="Create new person!" onPress={handleCreate} />
          )}
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
