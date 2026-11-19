import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { clearToken } from "../utils/storage";

export default function SettingsScreen({ navigation }) {
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await clearToken();
            Alert.alert("Logged Out Successfully");
            navigation.replace("Login");
          } catch (err) {
            Alert.alert("Error logging out", err.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f6f6", padding: 20 }}>
      {/* HEADER */}
      <Text style={{ fontSize: 26, fontWeight: "800", marginBottom: 25 }}>
        ⚙️ Settings
      </Text>

      {/* INFO CARD */}
      <View
        style={{
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 12,
          marginBottom: 30,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
          App Information
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 4 }}>
          <Text style={{ color: "#666" }}>App Version</Text>
          <Text style={{ fontWeight: "600" }}>1.0.0</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 4 }}>
          <Text style={{ color: "#666" }}>Role</Text>
          <Text style={{ fontWeight: "600" }}>Delivery Partner</Text>
        </View>
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: "#d9534f",
          padding: 15,
          borderRadius: 10,
          elevation: 2,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
          Logout 🚪
        </Text>
      </TouchableOpacity>
    </View>
  );
}
