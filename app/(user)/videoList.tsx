import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Button from "../../components/Button";
import Footer from "../../components/Footer";
import CardList from "../../components/cardList/cardList";
import ActionModal from "../../components/ActionModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useSelectedItem } from "../../stores/useSelectedItem";
import Video from "../interfaces/video";
import { useVideoApi } from "../hooks/useVideoApi";

export default function videoList() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const { selectedId, clear, store } = useSelectedItem();
  const { list, deleteVideo, loading, error } = useVideoApi();
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        console.log("Fetching videos...");
        const allVideos = await list();

        if (allVideos && Array.isArray(allVideos)) {
          setVideos(allVideos);
          console.log("Videos set successfully:", allVideos.length);
        } else {
          console.warn("Invalid video data received:", allVideos);
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    };
    fetchVideo();
  }, []);

  useEffect(() => {
    if (selectedId) {
      setActionModalVisible(true);
    }
  }, [selectedId]);

  const handleFind = () => {
    console.log("Find action");
    setActionModalVisible(false);
  };

  const handleDoubleClick = (id: string) => {
    store(Number(id));
    setActionModalVisible(true);
  };

  const handleDelete = () => {
    console.log("Delete action");
    setActionModalVisible(false);
    setConfirmModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    await deleteVideo(Number(selectedId!));
    clear();
    console.log("DELETE CONFIRMED!");
    setConfirmModalVisible(false);
  };

  const createHandler = () => {
    router.push("/videoManagement");
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
              Select a video to manage:
            </Text>

            {loading && (
              <Text className="text-gray-500 text-center">
                Loading videos...
              </Text>
            )}

            {error && (
              <Text className="text-red-500 text-center">Error: {error}</Text>
            )}

            {!loading && !error && videos.length === 0 && (
              <Text className="text-gray-500 text-center">
                No videos found. Create your first video!
              </Text>
            )}

            <CardList data={videos} onDoubleClick={handleDoubleClick} />
            <Button content="Create new video!" onPress={createHandler} />
          </View>
        </View>
      </ScrollView>
      <Footer />

      <ActionModal
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        onFind={handleFind}
        onDelete={handleDelete}
      />

      <ConfirmationModal
        content="video"
        visible={confirmModalVisible}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </>
  );
}
