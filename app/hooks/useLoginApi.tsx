import { useState } from "react";
import { authApi, LoginInput } from "../../infrastructure/api/middleware/auth";
import { CreateUserInput } from "../../infrastructure/api/users/callUsersApi";
import User from "../interfaces/user";

export const useLoginApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    data: LoginInput
  ): Promise<{ message: string; user: { username: string; role: string } }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authApi.login(data);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return {
        message: "There was an error logging in ",
        user: { username: "", role: "" },
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authApi.logout();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return { message: "There was an error logging out " };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: CreateUserInput): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authApi.register(data);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkIfLoggedIn = async (): Promise<{
    isValid: boolean;
    user?: {
      username: string;
      role: string;
    };
  }> => {
    setLoading(true);
    setError(null);

    try {
      return await authApi.checkAuth();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return { isValid: false, user: { username: "", role: "" } };
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    logout,
    register,
    checkIfLoggedIn,
    loading,
    error,
  };
};
