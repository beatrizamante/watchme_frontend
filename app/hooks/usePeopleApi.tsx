import { useState } from "react";
import {
  callPeopleApi,
  CreatePersonInput,
} from "../../infrastructure/api/people/callPeopleApi";
import Person from "../interfaces/person";

export const usePeopleApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreatePersonInput): Promise<Person | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callPeopleApi.create(data);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePerson = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await callPeopleApi.delete({ id });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const find = async (id: number): Promise<Person | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callPeopleApi.find({ id });
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const search = async (id: number, videoId: number): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callPeopleApi.search({ id, videoId });
      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const list = async (): Promise<Person[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await callPeopleApi.list();
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
    deletePerson,
    find,
    list,
    search,
    loading,
    error,
  };
};
