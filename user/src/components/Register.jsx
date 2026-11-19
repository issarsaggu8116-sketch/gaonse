import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import axios from "axios";
import Toast from "react-native-toast-message";

import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../config";

const Register = () => {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // ✅ PERMANENT EMAIL VERIFICATION
  const verificationMethod = "email";

  // CITY STATE
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState("");

  // FETCH CITIES
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // 1. Fetch directly from user server / API base
        const { data } = await axios.get(`${BASE_URL}/api/v1/user/cities`);
        if (data.cities && data.cities.length > 0) {
          setCities(data.cities);
          return;
        }
      } catch (err) {
        // Fallback 1: try /api/v1/cities
        try {
          const { data } = await axios.get(`${BASE_URL}/api/v1/cities`);
          if (data.cities && data.cities.length > 0) {
            setCities(data.cities);
            return;
          }
        } catch (subErr) {
          console.log("Local city fetch notice:", subErr.message);
        }
      }

      // Fallback 2: Production Master API
      try {
        const { data } = await axios.get("https://api.gaonse.in/api/v1/master/cities");
        setCities(data.cities || []);
      } catch (err) {
        console.log("City fetch error:", err.message);
      }
    };

    fetchCities();
  }, []);

  // REGISTER
  const handleRegister = async () => {
    try {
      if (!city) {
        return Toast.show({
          type: "error",
          text1: "Please select a city",
        });
      }

      const data = {
        name,
        email,
        phone: `+91${phone}`,
        password,
        verificationMethod, // always email
        city,
      };

      const res = await axios.post(
        `${BASE_URL}/api/v1/user/register`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Toast.show({
        type: "success",
        text1: res.data.message,
      });

      navigation.navigate("OtpVerification", {
        email: data.email,
        phone: data.phone,
        devOtp: res.data?.otp,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message ||
          "Register failed",
      });
    }
  };

  return (
    <View style={styles.container}>
        {/* HEADER */}
        <Text style={styles.title}>
          Create Account 🚀
        </Text>

        <Text style={styles.subtitle}>
          Join GAON SE and get started
        </Text>

        {/* NAME */}
        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#888"
        />

        {/* EMAIL */}
        <TextInput
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#888"
        />

        {/* PHONE */}
        <View style={styles.phoneWrapper}>
          <Text style={styles.prefix}>+91</Text>

          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
            maxLength={10}
            style={styles.phoneInput}
            placeholderTextColor="#888"
          />
        </View>

        {/* PASSWORD */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor="#888"
        />

        {/* CITY */}
        <Text style={styles.label}>
          Select Delivery City
        </Text>

        <View style={styles.cityContainer}>
          {cities.map((c) => (
            <TouchableOpacity
              key={c._id}
              onPress={() => setCity(c._id)}
              style={[
                styles.cityBtn,
                city === c._id &&
                  styles.activeCityBtn,
              ]}
            >
              <Text
                style={[
                  styles.cityText,
                  city === c._id && {
                    color: "#fff",
                  },
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📧 OTP verification will be sent to
            your email address
          </Text>
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>
            Register
          </Text>
        </TouchableOpacity>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#111",
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: "#fafafa",
    color: "#111",
  },

  phoneWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },

  prefix: {
    paddingHorizontal: 14,
    color: "#555",
    fontWeight: "600",
    borderRightWidth: 1,
    borderColor: "#e1e1e1",
    height: "100%",
    textAlignVertical: "center",
  },

  phoneInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: "#111",
  },

  label: {
    marginBottom: 12,
    fontWeight: "700",
    color: "#444",
    fontSize: 14,
  },

  cityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  cityBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: "#ececec",
    marginRight: 10,
    marginBottom: 10,
  },

  activeCityBtn: {
    backgroundColor: "#0cbb69",
  },

  cityText: {
    color: "#333",
    fontWeight: "700",
    fontSize: 13,
  },

  infoBox: {
    backgroundColor: "#eefcf5",
    borderWidth: 1,
    borderColor: "#c8f1dc",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },

  infoText: {
    color: "#0c8b50",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },

  button: {
    backgroundColor: "#0cbb69",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 2,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});