import { useState } from "react";
import {
  callVideoApi,
  CreateVideoInput,
} from "../../infrastructure/api/videos/callVideosApi";
import Video from "../interfaces/video";

export const useVideoApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVideo = async (data: CreateVideoInput): Promise<Video | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callVideoApi.create(data);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await callVideoApi.delete({ id });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const findVideo = async (id: number): Promise<Video | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callVideoApi.find({ id });
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const listVideos = async (): Promise<Video[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callVideoApi.list();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    createVideo,
    deleteVideo,
    findVideo,
    listVideos,
    loading,
    error,
  };
};
