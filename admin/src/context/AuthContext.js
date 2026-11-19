import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("adminToken");
        const storedAdmin = await AsyncStorage.getItem("adminData");
        if (storedToken && storedAdmin) {
          setToken(storedToken);
          setAdmin(JSON.parse(storedAdmin));
          global.token = storedToken;
        }
      } catch (err) {
        console.log("Error loading stored auth:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (adminData, tokenData) => {
    try {
      await AsyncStorage.setItem("adminToken", tokenData);
      await AsyncStorage.setItem("adminData", JSON.stringify(adminData));
      setToken(tokenData);
      setAdmin(adminData);
      global.token = tokenData;
    } catch (err) {
      console.log("Error storing auth details:", err);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("adminToken");
      await AsyncStorage.removeItem("adminData");
      setToken(null);
      setAdmin(null);
      global.token = null;
    } catch (err) {
      console.log("Error clearing auth details:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};