import * as VideoThumbnails from "expo-video-thumbnails";
import { useEffect, useState } from "react";

export function useVideoThumbnail(videoPath: string) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    async function getThumbnail() {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoPath, {
          time: 0,
        });
        console.log("gets the uri", uri);
        setThumbnail(uri);
      } catch (e) {
        setThumbnail(null);
      }
    }
    if (videoPath) getThumbnail();
  }, [videoPath]);

  return thumbnail;
}
