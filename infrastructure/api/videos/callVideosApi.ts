import z from "zod";
import { apiClient } from "../_lib/apiClient";
import Video from "../../../app/interfaces/video";

export const callVideoApi = {
  create: async (data: CreateVideoInput): Promise<Video> => {
    const formData = new FormData();

    if (!data.file.uri) {
      throw new Error("File URI is missing");
    }

    if (data.file.uri.startsWith("data:")) {
      const mimeMatch = data.file.uri.match(/data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : data.file.type || "video/mp4";
      const fileName = data.file.name || "video.mp4";

      const base64Data = data.file.uri.split(",")[1];

      formData.append("fileData", base64Data);
      formData.append("fileName", fileName);
      formData.append("mimeType", mimeType);

      console.log("Sending base64 data as form fields instead of file object");
    } else {
      const fileObject = {
        uri: data.file.uri,
        type: data.file.type || "video/mp4",
        name: data.file.name || "video.mp4",
      };

      formData.append("file", fileObject as any);
    }
    try {
      for (let pair of formData.entries()) {
        console.log("FormData entry:", pair[0], pair[1]);
      }
    } catch (e) {
      console.warn("FormData.entries() not supported in this environment");
    }

    const response = await apiClient.post("/video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [
        function (data, headers) {
          return data;
        },
      ],
    });
    return response.data;
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
