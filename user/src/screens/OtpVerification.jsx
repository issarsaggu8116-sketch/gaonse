import React, { useContext, useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import axios from "axios";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Context } from "../context/AppContext";
import styles from "../styles/OtpStyles";
import { BASE_URL } from "../config";

const OtpVerification = ({ route, navigation }) => {
  const { email, phone } = route.params;

  const { setIsAuthenticated, setUser } =
    useContext(Context);

  const [otp, setOtp] = useState(["", "", "", "", ""]);

  // INPUT REFS
  const inputRefs = useRef([]);

  // HANDLE OTP CHANGE
  const handleChange = (value, index) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // AUTO MOVE TO NEXT INPUT
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }

    // AUTO BACK TO PREVIOUS INPUT
    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // SUBMIT OTP
  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/user/otp-verification`,
        {
          email,
          phone,
          otp: otp.join(""),
        }
      );

      // ✅ SAVE LOGIN STATE
      await AsyncStorage.setItem("isAuthenticated", "true");

      // ✅ SAVE USER
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

      setIsAuthenticated(true);
      setUser(res.data.user);

      navigation.replace("Home");

      Toast.show({
        type: "success",
        text1: res.data.message,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1:
          err?.response?.data?.message ||
          "OTP Verification Failed",
      });
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
            {/* TITLE */}
            <Text style={styles.title}>Verify OTP</Text>

            <Text style={styles.subtitle}>
              Enter the 5-digit code sent to your
              email/phone
            </Text>

            {/* OTP BOXES */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) =>
                    (inputRefs.current[index] = ref)
                  }
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(value) =>
                    handleChange(value, index)
                  }
                  style={[
                    styles.otpInput,
                    digit && {
                      borderColor: "#0cbb69",
                      backgroundColor: "#eefcf5",
                    },
                  ]}
                  textAlign="center"
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>
                Verify OTP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OtpVerification;