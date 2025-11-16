import axios from "axios";
import { config } from "../../../config";

export const apiClient = axios.create({
  baseURL: config.http.baseUrl,
  timeout: 10000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized access - token might be expired");
    } else if (error.response?.status === 403) {
      console.log("Access forbidden");
    } else if (error.response?.status >= 500) {
      console.log("Server error occurred");
    }
    return Promise.reject(error);
  }
);
