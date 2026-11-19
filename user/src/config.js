import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Gaon Se Customer App - Production Base URL
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.gaonse.in";

// Setup global axios request interceptor to attach JWT token for all authenticated user requests
axios.interceptors.request.use(
  async (config) => {
    try {
      const token =
        (typeof global !== "undefined" && global.userToken) ||
        (await AsyncStorage.getItem("token"));

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Failed to attach customer auth token:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
