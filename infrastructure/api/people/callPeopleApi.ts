import z from "zod";
import { apiClient } from "../_lib/apiClient";
import Person from "../../../app/interfaces/person";
import {
  FindPersonInVideoJobResponse,
  FindPersonInVideoResponse,
} from "./response/findPersonInVideo";
import { dataFileTypeCheck } from "../_lib/dataFileTypeCheck";

export const callPeopleApi = {
  create: async (data: CreatePersonInput): Promise<Person> => {
    const payload = dataFileTypeCheck(data);
    const response = await apiClient.post("/person", payload);
    return response.data;
  },

  delete: async (data: DeletePersonInput): Promise<void> => {
    const response = await apiClient.delete(`/person?id=${data.id}`);
    return response.data;
  },

  find: async (data: FindPersonInput): Promise<Person> => {
    const response = await apiClient.get(`/person?id=${data.id}`);
    return response.data;
  },

  list: async (): Promise<Person[]> => {
    const response = await apiClient.get("/people");
    return response.data;
  },

  search: async (data: SearchInput): Promise<FindPersonInVideoResponse> => {
    const response = await apiClient.get(
      `/person/find?id=${data.id}&videoId=${data.videoId}`
    );
    return response.data;
  },

  check: async (
    data: CheckJobFindPersonInput
  ): Promise<FindPersonInVideoJobResponse> => {
    const response = await apiClient.get(
      `/person/job-status?jobId=${data.jobId}`
    );
    return response.data;
  },
};

const CreatePersonInput = z.object({
  name: z.string().min(1, "Name is required"),
  file: z.any(),
});

const DeletePersonInput = z.object({
  id: z.number().nonnegative(),
});

const FindPersonInput = z.object({
  id: z.number().nonnegative(),
});

const FindPersonInVideoInput = z.object({
  id: z.number().nonnegative(),
  videoId: z.number().nonnegative(),
});

const CheckJobFindPersonInput = z.object({
  jobId: z.string().nonempty(),
});

export type CreatePersonInput = z.infer<typeof CreatePersonInput>;
export type DeletePersonInput = z.infer<typeof DeletePersonInput>;
export type FindPersonInput = z.infer<typeof FindPersonInput>;
export type SearchInput = z.infer<typeof FindPersonInVideoInput>;
export type CheckJobFindPersonInput = z.infer<typeof CheckJobFindPersonInput>;
