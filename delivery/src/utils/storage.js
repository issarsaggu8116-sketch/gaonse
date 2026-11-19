import AsyncStorage from "@react-native-async-storage/async-storage";

export const setToken = async (token) => {
  await AsyncStorage.setItem("deliveryToken", token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem("deliveryToken");
};

export const clearToken = async () => {
  await AsyncStorage.removeItem("deliveryToken");
};