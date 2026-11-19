import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import API from "../api/api.js"
import { setToken, getToken } from "../utils/storage";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getToken();
        if (token) {
          navigation.replace("Home");
          return;
        }
      } catch (err) {
        console.log("Error checking token:", err);
      }
      setCheckingAuth(false);
    };
    checkToken();
  }, [navigation]);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18, color: "#666" }}>Loading...</Text>
      </View>
    );
  }

  const login = async () => {
    
    
    try {
      const res = await API.post("/delivery/auth/login", {
        phone,
        password,
      });
      
      await setToken(res.data.token);

      Alert.alert("Login Success 🚚");

      navigation.replace("Home");
    } catch (err) {
      Alert.alert(
        "Login Failed",
        err.response?.data?.message || "Error"
      );
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 26, fontWeight: "bold" }}>
        Delivery Partner Login
      </Text>

      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        style={{
          borderWidth: 1,
          marginTop: 20,
          padding: 10,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          marginTop: 15,
          padding: 10,
          borderRadius: 8,
        }}
      />

      <TouchableOpacity
        onPress={login}
        style={{
          backgroundColor: "#000",
          padding: 15,
          marginTop: 25,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}