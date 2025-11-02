import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import { useRouter } from "expo-router";
import ListDelete from "../../components/list/DeleteList";
import { useSelectedItem } from "../../stores/useSelectedItem";
import ConfirmationModal from "../../components/ConfirmationModal";
import Person from "../interfaces/person";
import { usePeopleApi } from "../hooks/usePeopleApi";

export default function peopleList() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const { list, deletePerson } = usePeopleApi();

  const fetchPeople = async () => {
    const allPeople = await list();
    if (!allPeople) return;
    setPeople(allPeople);
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleConfirmDelete = async () => {
    if (!idToDelete) return;
    await deletePerson(Number(idToDelete));
    console.log("DELETE CONFIRMED!");
    await fetchPeople();
    setConfirmModalVisible(false);
  };

  const createHandler = () => {
    router.push("/peopleManagement");
  };

  const handleDelete = (id: string) => {
    setIdToDelete(id);
    setConfirmModalVisible(true);
  };

  return (
    <>
      <ScrollView
        nestedScrollEnabled={true}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 160,
          flexGrow: 1,
        }}
      >
        <View className="flex-1 justify-between items-center px-6">
          <View className="flex flex-col justify-center items-center gap-4 mb-2">
            <Text className="text-darker text-center text-lg font-semibold">
              Click on the icon to delete:
            </Text>
            <ListDelete data={people} handleDelete={handleDelete} />
            <Button content="Create new person!" onPress={createHandler} />
          </View>
        </View>
      </ScrollView>
      <Footer />

      <ConfirmationModal
        content="video"
        visible={confirmModalVisible}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </>
  );
}
