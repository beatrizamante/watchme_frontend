import z from "zod";
import { apiClient } from "../_lib/apiClient";
import User from "../../../app/interfaces/user";

export const authApi = {
  login: async (
    data: LoginInput
  ): Promise<{ message: string; user: { username: string; role: string } }> => {
    const response = await apiClient.post("/login", data);
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post("/logout");
    return response.data;
  },

  checkAuth: async (): Promise<{
    isValid: boolean;
    user?: { username: string; role: string };
  }> => {
    try {
      const response = await apiClient.get("/auth/refresh");
      return {
        isValid: true,
        user: response.data.user,
      };
    } catch (error) {
      return { isValid: false };
    }
  },

  register: async (data: RegisterInput): Promise<User> => {
    const response = await apiClient.post("/register", data);
    return response.data;
  },
};

const LoginInput = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const RegisterUserInput = z.object({
  username: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof LoginInput>;
export type RegisterInput = z.infer<typeof RegisterUserInput>;
