import { useState } from "react";
import {
  callUsersApi,
  CreateUserInput,
  UpdateUserInput,
} from "../../infrastructure/api/users/callUsersApi";
import User from "../interfaces/user";

export const useUsersApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateUserInput): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callUsersApi.create(data);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (data: UpdateUserInput): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await callUsersApi.update(data);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteUserPicture = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await callUsersApi.delete({ id });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const find = async (id: number): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callUsersApi.find({ id });
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const list = async (active?: boolean): Promise<User[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callUsersApi.list(active);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    update,
    deleteUserPicture,
    find,
    list,
    loading,
    error,
  };
};
