import {
  View,
  Image,
  Text,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import React from "react";

type ImageCardProps = {
  id: string;
  onPress: (id: string) => void;
  user: string;
  date: string;
  image_path: ImageSourcePropType;
};

export default function Card({
  id,
  onPress,
  user,
  date,
  image_path,
}: ImageCardProps) {
  return (
    <View
      id={id}
      className="w-[165px] h-[228px] mb-2 mx-4 flex flex-col justify-center items-center border border-darker rounded-[25px] shadow-black shadow-lg bg-semilight"
    >
      <TouchableOpacity
        onPress={() => onPress(id)}
        className="flex justify-center items-center gap-4"
      >
        <Image
          source={image_path}
          className="w-max-[165px] h-max-[120px] px-4"
        ></Image>
        <View className="gap-2 px-4 flex flex-col">
          <Text className="text-center text-darker font-semibold">
            Created at {date}
          </Text>
          <Text className="text-center text-darker font-semibold">
            by {user}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
