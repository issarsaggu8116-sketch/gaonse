import React, {
  useContext,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import axios from "axios";

import Toast from "react-native-toast-message";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Context } from "../context/AppContext";

import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../config";

const Login = () => {
  const {
    setIsAuthenticated,
    setUser,
  } = useContext(Context);

  const navigation =
    useNavigation();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");



  /* ===============================
     LOGIN
  =============================== */
  const handleLogin = async () => {
    try {
      // 🔐 LOGIN
      const res = await axios.post(
        `${BASE_URL}/api/v1/user/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type":
              "application/json",
          },

          withCredentials: true,
        }
      );

      // 👤 GET USER
      const userRes = await axios.get(
        `${BASE_URL}/api/v1/user/me`,
        {
          withCredentials: true,
        }
      );

      // ✅ SAVE USER
      const user =
        userRes.data.user;

      // ✅ SAVE LOGIN STATE
      await AsyncStorage.setItem(
        "isAuthenticated",
        "true"
      );

      // ✅ SAVE USER
      await AsyncStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      Toast.show({
        type: "success",
        text1: res.data.message,
      });

      // ✅ UPDATE CONTEXT
      setIsAuthenticated(true);

      setUser(user);

      navigation.replace("Home");
    } catch (error) {
      Toast.show({
        type: "error",
        text1:
          error?.response?.data
            ?.message ||
          "Login failed",
      });
    }
  };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>
          Welcome Back 👋
        </Text>

        <Text style={styles.subtitle}>
          Login to continue
        </Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#888"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor="#888"
        />

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              "ForgotPassword"
            )
          }
        >
          <Text style={styles.forgot}>
            Forgot your password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >
          <Text
            style={styles.buttonText}
          >
            Login
          </Text>
        </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 5,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },

  forgot: {
    textAlign: "right",
    color: "#0cbb69",
    marginBottom: 20,
    fontWeight: "500",
  },

  button: {
    backgroundColor: "#0cbb69",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});