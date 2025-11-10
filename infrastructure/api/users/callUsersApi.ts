import z from "zod";
import { apiClient } from "../_lib/apiClient";
import User from "../../../app/interfaces/user";

export const callUsersApi = {
  create: async (data: CreateUserInput): Promise<User> => {
    const response = await apiClient.post("/user", data);
    return response.data;
  },

  update: async (data: UpdateUserInput): Promise<User> => {
    const updatePayload: any = {};

    if (data.username !== undefined) updatePayload.username = data.username;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.password !== undefined) updatePayload.password = data.password;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.active !== undefined) updatePayload.active = data.active;

    console.log("Update payload being sent:", updatePayload);

    const response = await apiClient.patch(
      `/user?id=${data.id}`,
      updatePayload
    );
    return response.data;
  },

  find: async (data: FindUserInput): Promise<User> => {
    const response = await apiClient.get(`/user?id=${data.id}`);
    return response.data;
  },

  list: async (active?: boolean): Promise<User[]> => {
    try {
      const response = await apiClient.get(
        active !== undefined ? `/users?active=${active}` : "/users"
      );

      let users = response.data;
      if (typeof response.data === "string") {
        try {
          users = JSON.parse(response.data);
          console.log("Parsed users:", users);
        } catch (parseError) {
          console.error("Failed to parse response data:", parseError);
          throw new Error("Invalid JSON response from server");
        }
      }

      return users;
    } catch (error) {
      console.error("Error in list users API:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        console.log("Error Response Status:", axiosError.response?.status);
        console.log("Error Response Data:", axiosError.response?.data);
      }
      throw error;
    }
  },
};

const CreateUserInput = z.object({
  username: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const UpdateUserInput = z.object({
  id: z.number(),
  username: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  active: z.boolean().optional(),
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
