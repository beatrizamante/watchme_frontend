import z from "zod";
import { apiClient } from "../_lib/apiClient";
import Video from "../../../app/interfaces/video";

export const callVideoApi = {
  create: async (data: CreateVideoInput): Promise<Video> => {
    if (!data.file.uri) {
      throw new Error("File URI is missing");
    }

    if (data.file.uri.startsWith("data:")) {
      const mimeMatch = data.file.uri.match(/data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : data.file.type || "video/mp4";
      const fileName = data.file.name || "video.mp4";
      const base64Data = data.file.uri.split(",")[1];

      const jsonPayload = {
        fileData: base64Data,
        fileName: fileName,
        mimeType: mimeType,
      };

      const response = await apiClient.post("/video", jsonPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } else {
      const formData = new FormData();
      const fileObject = {
        uri: data.file.uri,
        type: data.file.type || "video/mp4",
        name: data.file.name || "video.mp4",
      };

      formData.append("file", fileObject as any);

      const response = await apiClient.post("/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }
  },

  delete: async (data: DeleteVideoInput): Promise<void> => {
    const response = await apiClient.delete(`/video?id=${data.id}`);
    return response.data;
  },

  find: async (data: FindVideoInput): Promise<Video> => {
    const response = await apiClient.get(`/video?id=${data.id}`);
    return response.data;
  },

  list: async (): Promise<Video[]> => {
    const response = await apiClient.get("/videos");
    return response.data;
  },
};

const CreateVideoInput = z.object({
  file: z.any(),
});

const DeleteVideoInput = z.object({
  id: z.number(),
});

const FindVideoInput = z.object({
  id: z.number(),
});

export type CreateVideoInput = z.infer<typeof CreateVideoInput>;
export type DeleteVideoInput = z.infer<typeof DeleteVideoInput>;
export type FindVideoInput = z.infer<typeof FindVideoInput>;
