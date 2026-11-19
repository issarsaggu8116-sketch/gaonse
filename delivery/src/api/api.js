import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://deliveryapi.gaonse.in/api";

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach delivery partner authentication token automatically
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("deliveryToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("Error attaching delivery token:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
