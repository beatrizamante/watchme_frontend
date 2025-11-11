import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import Button from "../../components/Button";
import Footer from "../../components/Footer";
import Input from "../../components/form/Input";
import { useSelectedItem } from "../../stores/useSelectedItem";
import DropDown from "../../components/form/Dropdown";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useUsersApi } from "../hooks/useUsersApi";
import {
  CreateUserInput,
  UpdateUserInput,
} from "../../infrastructure/api/users/callUsersApi";
import { showPlatformAlert } from "../../utils/alertUtils";

export default function UserManagement() {
  const router = useRouter();
  const { selectedId, clear } = useSelectedItem();
  const { create, update, find } = useUsersApi();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [password, setPassword] = useState("");
  useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const [originalUser, setOriginalUser] = useState<{
    username: string;
    email: string;
    role: "user" | "admin";
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (selectedId) {
        const user = await find(Number(selectedId));
        if (user) {
          const roleValue = user.role.toLowerCase() as "user" | "admin";
          setUsername(user.username);
          setEmail(user.email);
          setRole(roleValue);

          setOriginalUser({
            username: user.username,
            email: user.email,
            role: roleValue,
          });
          return;
        }
      }
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("user");
      setOriginalUser(null);
    };

    fetchUser();
  }, [selectedId]);

  const handleConfirmDelete = async () => {
    try {
      const userData: UpdateUserInput = {
        id: Number(selectedId!),
        active: false,
      };

      const success = await update(userData);
      if (success) {
        showPlatformAlert(
          "✅ Success",
          `User "${username}" has been deactivated successfully.`,
          [
            {
              text: "OK",
              onPress: () => {
                clear();
                console.log("DELETE CONFIRMED!");
                setConfirmModalVisible(false);
                router.replace("/(admin)/userList");
              },
            },
          ]
        );
      } else {
        showPlatformAlert(
          "❌ Deactivation Failed",
          "The user could not be deactivated. Please try again."
        );
        setConfirmModalVisible(false);
      }
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      const errorMessage =
        error?.message ||
        "An unexpected error occurred while deactivating the user.";
      showPlatformAlert("❌ Deactivation Error", errorMessage);
      setConfirmModalVisible(false);
    }
  };

  const handleUpdate = async () => {
    if (!originalUser) {
      showPlatformAlert("❌ Error", "Original user data not found");
      return;
    }

    if (username !== originalUser.username && username.trim().length < 3) {
      showPlatformAlert(
        "❌ Validation Error",
        "Username must be at least 3 characters long."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== originalUser.email && !emailRegex.test(email.trim())) {
      showPlatformAlert(
        "❌ Validation Error",
        "Please enter a valid email address."
      );
      return;
    }

    if (password.trim() !== "" && password.length < 6) {
      showPlatformAlert(
        "❌ Validation Error",
        "Password must be at least 6 characters long."
      );
      return;
    }

    const userData: UpdateUserInput = {
      id: Number(selectedId!),
    };

    if (username !== originalUser.username) {
      userData.username = username;
    }
    if (email !== originalUser.email) {
      userData.email = email;
    }
    if (role !== originalUser.role) {
      userData.role = role.toUpperCase() as "USER" | "ADMIN";
    }
    if (password.trim() !== "") {
      userData.password = password;
    }

    const hasChanges = Object.keys(userData).length > 1;

    if (!hasChanges) {
      showPlatformAlert("ℹ️ No Changes", "No changes detected to update.");
      return;
    }

    try {
      console.log("Sending update data:", userData);
      const result = await update(userData);

      if (result) {
        showPlatformAlert(
          "✅ Success",
          `User "${username}" updated successfully!`,
          [
            {
              text: "OK",
              onPress: () => {
                clear();
                router.replace("/(admin)/userList");
              },
            },
          ]
        );
      } else {
        showPlatformAlert(
          "❌ Update Failed",
          "The user could not be updated. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      const errorMessage =
        error?.message ||
        "An unexpected error occurred while updating the user.";
      showPlatformAlert("❌ Update Error", errorMessage);
    }
  };

  const handleDelete = async () => {
    setConfirmModalVisible(true);
    console.log("Desativar usuário:", selectedId);
  };

  const handleCreate = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      showPlatformAlert(
        "❌ Validation Error",
        "Please fill in all required fields."
      );
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

    try {
      const userData: CreateUserInput = {
        username: username.trim(),
        email: email.trim(),
        password,
      };

      const result = await create(userData);

      if (result) {
        showPlatformAlert(
          "✅ Success",
          `User "${username.trim()}" created successfully!`,
          [
            {
              text: "OK",
              onPress: () => {
                clear();
                router.replace("/(admin)/userList");
              },
            },
          ]
        );
      } else {
        showPlatformAlert(
          "❌ Creation Failed",
          "The user could not be created. Email might already exist."
        );
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      const errorMessage =
        error?.message ||
        "An unexpected error occurred while creating the user.";
      showPlatformAlert("❌ Creation Error", errorMessage);
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
          <View className="flex flex-row justify-start items-center w-full pl-2 mb-4">
            <TouchableOpacity className="flex" onPress={handleBack}>
              <Text className="text-lg text-darker font-semibold">Back</Text>
            </TouchableOpacity>
          </View>
          {isEditing && (
            <View className="flex justify-center items-center w-full mb-4">
              <Text className="text-darker text-center font-semibold">
                Editing {username}
              </Text>
            </View>
          )}

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

          {isEditing ? (
            <>
              <DropDown label="role" value={role} handler={setRole} />
            </>
          ) : (
            <View></View>
          )}

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
