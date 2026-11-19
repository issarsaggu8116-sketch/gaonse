import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import API from "../api/api";

export default function HomeScreen({ navigation }) {
  const [metrics, setMetrics] = useState({ pendingOrdersCount: 0, todayEarnings: 0 });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await API.get("/delivery/khata/metrics");
      if (res.data && res.data.success) {
        setMetrics({
          pendingOrdersCount: res.data.pendingOrdersCount,
          todayEarnings: res.data.todayEarnings,
        });
      }
    } catch (err) {
      console.log("Error fetching metrics:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const unsubscribe = navigation.addListener("focus", () => {
      fetchMetrics();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Welcome Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome Back, Partner! 🚚</Text>
          <Text style={styles.subtitleText}>Here is your delivery performance today.</Text>
        </View>

        {/* Dashboard Cards Row */}
        <View style={styles.metricsContainer}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#3f51b5" />
            </View>
          ) : (
            <>
              {/* Pending Deliveries Card */}
              <View style={[styles.card, styles.pendingCard]}>
                <Text style={styles.cardEmoji}>📦</Text>
                <Text style={styles.cardNumber}>{metrics.pendingOrdersCount}</Text>
                <Text style={styles.cardLabel}>Pending Orders</Text>
              </View>

              {/* Today's Earnings Card */}
              <View style={[styles.card, styles.earningsCard]}>
                <Text style={styles.cardEmoji}>🪙</Text>
                <Text style={[styles.cardNumber, styles.earningsCardText]}>₹{metrics.todayEarnings}</Text>
                <Text style={[styles.cardLabel, styles.earningsCardLabel]}>Today&apos;s Earnings</Text>
              </View>
            </>
          )}
        </View>

        {/* Menu Buttons Section */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Quick Access</Text>

          {/* 📦 ORDERS */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Orders")}
            style={[styles.menuButton, { backgroundColor: "#1e293b" }]}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonEmoji}>📦</Text>
              <Text style={styles.buttonText}>Today&apos;s Orders</Text>
            </View>
          </TouchableOpacity>

          {/* 🔁 SUBSCRIPTIONS */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Subscriptions")}
            style={[styles.menuButton, { backgroundColor: "#475569" }]}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonEmoji}>🔁</Text>
              <Text style={styles.buttonText}>Subscriptions</Text>
            </View>
          </TouchableOpacity>

          {/* 📊 SUMMARY */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Summary")}
            style={[styles.menuButton, { backgroundColor: "#0cbb69" }]}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonEmoji}>📊</Text>
              <Text style={styles.buttonText}>Daily Summary</Text>
            </View>
          </TouchableOpacity>

          {/* 📓 KHATA BOOK */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Khata")}
            style={[styles.menuButton, { backgroundColor: "#3f51b5" }]}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonEmoji}>📓</Text>
              <Text style={styles.buttonText}>Khata Book</Text>
            </View>
          </TouchableOpacity>

          {/* ⚙️ SETTINGS */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={[styles.menuButton, { backgroundColor: "#64748b" }]}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonEmoji}>⚙️</Text>
              <Text style={styles.buttonText}>Settings</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitleText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 5,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    minHeight: 120,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    justifyContent: "space-between",
  },
  pendingCard: {
    backgroundColor: "#1e1e2d",
    marginRight: 8,
  },
  earningsCard: {
    backgroundColor: "#e8f5e9",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  cardEmoji: {
    fontSize: 22,
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a5f3fc",
    marginTop: 4,
  },
  earningsCardText: {
    color: "#1b5e20",
  },
  earningsCardLabel: {
    color: "#2e7d32",
  },
  menuContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 15,
  },
  menuButton: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});