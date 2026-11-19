import React, { useContext, useState } from "react";
import { View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Context } from "../context/AppContext";
import styles from "../styles/ResetPasswordStyles";
import { BASE_URL } from "../config";

const ResetPassword = ({ route, navigation }) => {
  const { email } = route.params || {};
  const { setIsAuthenticated, setUser } = useContext(Context);

  const [emailInput, setEmailInput] = useState(email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async () => {
    try {
      if (!emailInput.trim() || !otp.trim() || !password.trim() || !confirmPassword.trim()) {
        Toast.show({ type: "error", text1: "All fields are required" });
        return;
      }

      const res = await axios.put(
        `${BASE_URL}/api/v1/user/password/reset`,
        { email: emailInput, otp, password, confirmPassword }
      );

      // ✅ SAVE LOGIN STATE
      await AsyncStorage.setItem("isAuthenticated", "true");
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

      setIsAuthenticated(true);
      setUser(res.data.user);

      navigation.replace("Home");

      Toast.show({ type: "success", text1: res.data.message });
    } catch (err) {
      Toast.show({ type: "error", text1: err.response?.data?.message || "Reset failed" });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.page}>
          <View style={styles.container}>
            
            <Text style={styles.heading}>Reset Password</Text>
            <Text style={styles.subText}>
              Enter the OTP sent to your email and your new password.
            </Text>

            <TextInput
              placeholder="Email Address"
              value={emailInput}
              onChangeText={setEmailInput}
              editable={!email}
              style={[styles.input, email && { backgroundColor: "#f0f0f0", color: "#666" }]}
              autoCapitalize="none"
            />

            <TextInput
              placeholder="OTP Code"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
              style={styles.input}
            />

            <TextInput
              placeholder="New Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />

            <TextInput
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={handleReset}>
              <Text style={styles.buttonText}>Reset & Login</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPassword;