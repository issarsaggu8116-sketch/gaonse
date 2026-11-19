import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../services/api";

const Settings = () => {
  const [morning, setMorning] = useState("");
  const [evening, setEvening] = useState("");

  // 📡 FETCH
  const fetchSettings = async () => {
    try {
      const { data } = await API.get("/admin/setting");
      setMorning(data.setting.morningDeadline || "");
      setEvening(data.setting.eveningDeadline || "");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 💾 SAVE
  const handleSave = async () => {
    try {
      await API.put("/admin/setting", {
        morningDeadline: morning,
        eveningDeadline: evening,
      });

      alert("Settings updated ✅");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <Text style={styles.header}>Timing Configurations ⏱</Text>
        <Text style={styles.subtitle}>
          Set order deadlines for morning and evening distribution cycles.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Cutoff Deadlines</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Morning Order Deadline</Text>
            <TextInput
              placeholder="HH:MM (e.g. 00:00)"
              placeholderTextColor="#94a3b8"
              value={morning}
              onChangeText={setMorning}
              style={styles.input}
            />
            <Text style={styles.inputDesc}>
              Orders placed after this time will not be processed for the current morning cycle.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Evening Order Deadline</Text>
            <TextInput
              placeholder="HH:MM (e.g. 14:00)"
              placeholderTextColor="#94a3b8"
              value={evening}
              onChangeText={setEvening}
              style={styles.input}
            />
            <Text style={styles.inputDesc}>
              Orders placed after this time will not be processed for the current evening cycle.
            </Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSave}>
            <Text style={styles.btnText}>Save Configurations</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    borderRadius: 10,
    color: "#0f172a",
    fontSize: 14,
  },
  inputDesc: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 6,
    lineHeight: 16,
  },
  btn: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});