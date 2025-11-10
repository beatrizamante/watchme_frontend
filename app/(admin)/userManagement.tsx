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
import Toggle from "../../components/form/Toggle";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useUsersApi } from "../hooks/useUsersApi";
import {
  CreateUserInput,
  UpdateUserInput,
} from "../../infrastructure/api/users/callUsersApi";

export default function UserManagement() {
  const router = useRouter();
  const { selectedId, clear } = useSelectedItem();
  const { create, update, find, error } = useUsersApi();
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
    const userData: UpdateUserInput = {
      id: Number(selectedId!),
      active: false,
    };

    const success = await update(userData);
    if (success) {
      clear();
      console.log("DELETE CONFIRMED!");
      setConfirmModalVisible(false);
      router.replace("/(admin)/userList");
    }
  };

  const handleUpdate = async () => {
    if (!originalUser) {
      Alert.alert("Error", "Original user data not found");
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
      Alert.alert("No Changes", "No changes detected to update.");
      return;
    }

    console.log("Sending update data:", userData);
    const result = await update(userData);

    if (result) {
      clear();
      router.replace("/(admin)/userList");
    }
  };

  const handleDelete = async () => {
    setConfirmModalVisible(true);
    console.log("Desativar usuário:", selectedId);
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
