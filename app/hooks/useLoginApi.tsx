import { useState } from "react";
import { authApi, LoginInput } from "../../infrastructure/api/middleware/auth";

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

  const checkIfLoggedIn = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await authApi.checkAuth();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    logout,
    checkIfLoggedIn,
    loading,
    error,
  };
};
