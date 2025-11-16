import z from "zod";
import { apiClient } from "../_lib/apiClient";
import Video from "../../../app/interfaces/video";
import { dataFileTypeCheck } from "../_lib/dataFileTypeCheck";

export const callVideoApi = {
  create: async (data: CreateVideoInput): Promise<Video> => {
    const payload = dataFileTypeCheck(data);

    const response = await apiClient.post("/video", payload);
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
