import z from "zod";
import { apiClient } from "../_lib/apiClient";
import User from "../../../app/interfaces/user";

export const callUsersApi = {
  create: async (data: CreateUserInput): Promise<User> => {
    const response = await apiClient.post("/user", data);
    return response.data;
  },

  update: async (data: UpdateUserInput): Promise<User> => {
    const response = await apiClient.patch("/user", data);
    return response.data;
  },

  delete: async (data: DeleteUserInput): Promise<void> => {
    const response = await apiClient.delete(`/user?id=${data.id}`);
    return response.data;
  },

  find: async (data: FindUserInput): Promise<User> => {
    const response = await apiClient.get(`/user?id=${data.id}`);
    return response.data;
  },

  list: async (data: FindAllUsersInput): Promise<User[]> => {
    const response = await apiClient.get(`/users?active=${data.active}`);
    return response.data;
  },
};

const CreateUserInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const UpdateUserInput = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

const DeleteUserInput = z.object({
  id: z.number(),
});

const FindUserInput = z.object({
  id: z.number(),
});

const FindAllUsersInput = z.object({
  active: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserInput>;
export type UpdateUserInput = z.infer<typeof UpdateUserInput>;
export type DeleteUserInput = z.infer<typeof DeleteUserInput>;
export type FindUserInput = z.infer<typeof FindUserInput>;
export type FindAllUsersInput = z.infer<typeof FindAllUsersInput>;
