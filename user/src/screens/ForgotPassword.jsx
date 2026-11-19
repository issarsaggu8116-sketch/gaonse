import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import styles from "../styles/ForgotPasswordStyles";
import { BASE_URL } from "../config";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/user/password/forgot`,
        { email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      Toast.show({ type: "success", text1: res.data.message });
      navigation.navigate("ResetPassword", { email });
    } catch (error) {
      Toast.show({ type: "error", text1: error.response.data.message });
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
            
            <Text style={styles.heading}>Forgot Password</Text>

            <Text style={styles.subText}>
              Enter your email to receive reset link
            </Text>

            <TextInput
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleForgotPassword}
            >
              <Text style={styles.buttonText}>Send Reset Link</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;