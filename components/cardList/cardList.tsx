import { FlatList, useWindowDimensions, View } from "react-native";
import React from "react";
import Card from "./item/item";
import { useVideoThumbnail } from "../../app/hooks/useVideoThumbnail";

type ListProps = {
  data: any[];
  onDoubleClick: (id: string) => void;
};

export default function CardList({ data, onDoubleClick }: ListProps) {
  const { width } = useWindowDimensions();
  const numColumns = width > 800 ? 3 : 2;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getDate())}/${pad(
      date.getMonth() + 1
    )}/${date.getFullYear()} : ${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}`;
  };

  //ANCHOR - Check thumbnails in a mobile device
  return (
    <View className="flex h-[350px] w-full">
      <FlatList
        data={data}
        key={numColumns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card
            id={item.id.toString()}
            onPress={onDoubleClick}
            date={formatDate(item.created_at)}
            user={item.username}
            image_path={require("../../assets/manage_people.png")}
          />
        )}
        nestedScrollEnabled={true}
        className="flex flex-wrap gap-y-4 p-4 bg-semilight"
        numColumns={numColumns}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        contentContainerStyle={{
          padding: 16,
        }}
      />
    </View>
  );
}
