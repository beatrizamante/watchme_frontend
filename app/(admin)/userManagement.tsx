import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import Button from "../../components/Button";
import Footer from "../../components/Footer";
import Input from "../../components/form/Input";
import { useSelectedItem } from "../../stores/useSelectedItem";
import DropDown from "../../components/form/Dropdown";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useUsersApi } from "../hooks/userUsersApi";
import {
  CreateUserInput,
  UpdateUserInput,
} from "../../infrastructure/api/users/callUsersApi";

export default function UserManagement() {
  const router = useRouter();
  const { selectedId, clear } = useSelectedItem();
  const { create, update, deleteUserPicture, find, error } = useUsersApi();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [password, setPassword] = useState("");
  const [selectedProfilePicture, setSelectedProfilePicture] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (selectedId) {
        const user = await find(Number(selectedId));
        if (user) {
          setUsername(user.name);
          setEmail(user.email);
          setRole(user.role.toLowerCase() as "user" | "admin");
          return;
        }
      }
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("user");
      setSelectedProfilePicture(null);
    };

    fetchUser();
  }, [selectedId]);

  const selectProfilePicture = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedProfilePicture(result.assets[0]);
        Alert.alert(
          "Profile Picture Selected",
          `Selected: ${result.assets[0].name}`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select profile picture");
      console.error("Error selecting image:", error);
    }
  };

  const handleConfirmDelete = async () => {
    const success = await deleteUserPicture(Number(selectedId!));
    if (success) {
      clear();
      console.log("DELETE CONFIRMED!");
      setConfirmModalVisible(false);
      router.replace("/(admin)/userList");
    }
  };

  const handleUpdate = async () => {
    const userData: UpdateUserInput = {
      id: Number(selectedId!),
      username,
      email,
      password,
      role: role.toUpperCase() as "USER" | "ADMIN",
    };

    if (selectedProfilePicture) {
      userData.file = {
        uri: selectedProfilePicture.uri,
        type: selectedProfilePicture.mimeType || "image/jpeg",
        name: selectedProfilePicture.name,
      };
    }

    const result = await update(userData);

    if (result) {
      clear();
      router.replace("/(admin)/userList");
    }
  };

  const handleDelete = async () => {
    setConfirmModalVisible(true);
    console.log("Deletar usuário:", selectedId);
  };

  const handleCreate = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    const userData: CreateUserInput = {
      username: username.trim(),
      email: email.trim(),
      password,
    };

    const result = await create(userData);

    if (result) {
      clear();
      router.replace("/(admin)/userList");
    }
  };

  const handleBack = () => {
    clear();
    router.back();
  };

  const isEditing = !!selectedId;

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
          <View className="flex flex-row justify-between items-center w-full px-7">
            <TouchableOpacity className="flex w-[140px]" onPress={handleBack}>
              <Text className="text-lg text-darker font-semibold text-center">
                Back
              </Text>
            </TouchableOpacity>
            <Text className="text-darker text-center font-semibold">
              {isEditing ? `Editing ${username}` : ""}
            </Text>
          </View>

          <Input
            label="name"
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

          {isEditing ? (
            <DropDown label="role" value={role} handler={setRole} />
          ) : (
            <div></div>
          )}

          <View className="w-full px-4 gap-4">
            <TouchableOpacity
              onPress={selectProfilePicture}
              className="border-2 border-dashed border-gray-400 bg-gray-50 p-4 rounded-lg items-center"
            >
              <Text className="text-base text-gray-600 font-semibold">
                {selectedProfilePicture
                  ? "Change Profile Picture"
                  : "Select Profile Picture (Optional)"}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Tap to choose image from device
              </Text>
            </TouchableOpacity>

            {selectedProfilePicture && (
              <View className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <Text className="text-green-800 font-semibold text-sm">
                  Selected Image:
                </Text>
                <Text className="text-green-700 text-sm mt-1">
                  {selectedProfilePicture.name}
                </Text>
              </View>
            )}

            {error && (
              <View className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <Text className="text-red-800 text-sm">Error: {error}</Text>
              </View>
            )}
          </View>

          {isEditing ? (
            <View className="flex flex-row justify-between items-center gap-4 mt-4">
              <Button content="Update user" onPress={handleUpdate} />
              <TouchableOpacity className="w-7 h-7" onPress={handleDelete}>
                <Image source={require("../../assets/Vector.png")} />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mt-4">
              <Button content="Create user" onPress={handleCreate} />
            </View>
          )}
        </View>
      </ScrollView>
      <Footer />

      <ConfirmationModal
        content="user"
        visible={confirmModalVisible}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </>
  );
}
