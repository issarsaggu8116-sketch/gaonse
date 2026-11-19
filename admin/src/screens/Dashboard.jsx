import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../services/api";
import socket from "../services/socket";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { admin } = useContext(AuthContext);

  /* ===============================
     DASHBOARD STATE
  =============================== */
  const [data, setData] = useState({
    totalProducts: 0,
    products: [],
  });

  /* ===============================
     INVENTORY STATE
  =============================== */
  const [inventory, setInventory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  /* ===============================
     FETCH DASHBOARD
  =============================== */
  const fetchDashboard = async () => {
    try {
      const res = await API.get("/admin/dashboard");
      setData({
        totalProducts: res.data.totalProducts || 0,
        products: res.data.products || [],
      });
    } catch (err) {
      console.log("Dashboard Error:", err.message);
    }
  };

  /* ===============================
     FETCH INVENTORY
  =============================== */
  const fetchInventory = async () => {
    try {
      const res = await API.get("/admin/inventory");
      setInventory(res.data.inventory || []);
    } catch (err) {
      console.log("Inventory Error:", err.message);
    }
  };

  /* ===============================
     RESET INVENTORY
  =============================== */
  const resetInventory = () => {
    Alert.alert(
      "Reset Inventory",
      "Start new day and reset today demand counters?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await API.put("/admin/inventory/reset");
              await fetchInventory();
              Alert.alert("Success", "Inventory reset complete");
            } catch (err) {
              Alert.alert("Error", "Failed to reset inventory");
            }
          },
        },
      ]
    );
  };

  /* ===============================
     RESET PRODUCT STOCK
  =============================== */
  const resetProductStock = async (productId, productName) => {
    Alert.alert(
      "Reset Stock",
      `Reset ${productName} stock?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await API.put(`/admin/reset-stock/${productId}`);
              await fetchDashboard();
              Alert.alert("Success", "Stock reset successfully");
            } catch (err) {
              Alert.alert("Error", "Failed to reset stock");
            }
          },
        },
      ]
    );
  };

  /* ===============================
     REFRESH
  =============================== */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    await fetchInventory();
    setRefreshing(false);
  };

  /* ===============================
     SOCKET LIVE UPDATE
  =============================== */
  useEffect(() => {
    if (!admin?.city?._id) return;
    const cityId = admin.city._id;
    socket.emit("joinCity", cityId);

    const handleUpdate = () => {
      fetchDashboard();
      fetchInventory();
    };

    socket.on("newOrder", handleUpdate);
    socket.on("stockUpdated", handleUpdate);

    return () => {
      socket.off("newOrder", handleUpdate);
      socket.off("stockUpdated", handleUpdate);
    };
  }, [admin]);

  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    fetchDashboard();
    fetchInventory();
  }, []);

  // Calculate KPI values
  const lowStockCount = data.products.filter((product) => {
    const invItem = inventory.find((inv) => inv.productId === product.productId.toString());
    const demand = invItem ? (invItem.todayDemand || 0) : 0;
    return product.currentStock <= demand;
  }).length;

  const todayDemandSum = inventory.reduce(
    (sum, item) => sum + (item.todayDemand || 0),
    0
  );
  const soldTodaySum = inventory.reduce(
    (sum, item) => sum + (item.soldToday || 0),
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4f46e5"]} />
        }
      >
        {/* WELCOME BANNER */}
        <View style={styles.banner}>
          <Text style={styles.bannerGreeting}>
            Welcome Back, {admin?.name || "Admin"}! 👋
          </Text>
          <Text style={styles.bannerSub}>
            📍 Managing: {admin?.city?.name || "All Cities"}
          </Text>
          <Text style={styles.bannerEmail}>{admin?.email}</Text>
        </View>

        {/* QUICK METRICS GRID */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricEmoji}>🥛</Text>
              <Text style={styles.metricLabel}>Total Products</Text>
            </View>
            <Text style={styles.metricValue}>{data.totalProducts}</Text>
          </View>

          <View style={[styles.metricCard, lowStockCount > 0 && styles.metricAlertCard]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricEmoji}>⚠️</Text>
              <Text style={styles.metricLabel}>Low Stock Alerts</Text>
            </View>
            <Text
              style={[
                styles.metricValue,
                { color: lowStockCount > 0 ? "#ef4444" : "#10b981" }
              ]}
            >
              {lowStockCount}
            </Text>
          </View>
        </View>

        <View style={styles.metricsGridSecondary}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricEmoji}>📊</Text>
              <Text style={styles.metricLabel}>Today's Demand</Text>
            </View>
            <Text style={styles.metricValue}>{todayDemandSum} pcs</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricEmoji}>💰</Text>
              <Text style={styles.metricLabel}>Sold Today</Text>
            </View>
            <Text style={styles.metricValue}>{soldTodaySum} pcs</Text>
          </View>
        </View>

        {/* PRODUCTS SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🥛 Product Stock Levels</Text>
          </View>

          {data.products.map((item) => {
            const limit = item.stockLimit || 100;
            const current = item.currentStock || 0;
            const percentage = Math.min(100, Math.max(0, Math.round((current / limit) * 100)));
            
            // Find today's demand for this product
            const invItem = inventory.find((inv) => inv.productId === item.productId.toString());
            const demand = invItem ? (invItem.todayDemand || 0) : 0;
            const isLowStock = current <= demand;

            // Determine progress bar color
            let barColor = "#4f46e5"; // default Indigo
            if (isLowStock) barColor = "#ef4444"; // red for low stock
            else if (percentage <= 20) barColor = "#f59e0b"; // orange/amber
            else barColor = "#10b981"; // green/emerald

            return (
              <View key={item.productId} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.productTitleCol}>
                    <Text style={styles.productName}>{item.productName}</Text>
                    {isLowStock && (
                      <View style={styles.lowBadge}>
                        <Text style={styles.lowBadgeText}>LOW STOCK</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.actionBtnOutline}
                    onPress={() => resetProductStock(item.productId, item.productName)}
                  >
                    <Text style={styles.actionBtnText}>Restock</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.stockDetails}>
                  <Text style={styles.cardText}>
                    Available: <Text style={styles.boldText}>{current}</Text> / {limit} Units
                  </Text>
                  <Text style={[styles.percentageText, { color: barColor }]}>
                    {percentage}%
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
                </View>
              </View>
            );
          })}

          {data.products.length === 0 ? (
            <Text style={styles.emptyText}>No products found</Text>
          ) : null}
        </View>

        {/* INVENTORY SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📦 Inventory Demand</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={resetInventory}>
              <Text style={styles.resetText}>🔄 Reset All</Text>
            </TouchableOpacity>
          </View>

          {inventory.map((item) => {
            return (
              <View key={item._id} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.productName}>{item.productName}</Text>
                  <View style={styles.unitBadge}>
                    <Text style={styles.unitBadgeText}>{item.unit}</Text>
                  </View>
                </View>

                <View style={styles.gridContainer}>
                  <View style={styles.gridCol}>
                    <Text style={styles.gridLabel}>TODAY'S DEMAND</Text>
                    <Text style={styles.gridValue}>
                      {item.todayDemand}
                    </Text>
                  </View>
                  <View style={styles.gridCol}>
                    <Text style={styles.gridLabel}>SOLD TODAY</Text>
                    <Text style={styles.gridValue}>
                      {item.soldToday}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {inventory.length === 0 ? (
            <Text style={styles.emptyText}>No inventory data yet</Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  banner: {
    backgroundColor: "#0f172a",
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerGreeting: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 4,
  },
  bannerEmail: {
    fontSize: 12,
    color: "#64748b",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  metricsGridSecondary: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  metricAlertCard: {
    borderColor: "#fecaca",
    backgroundColor: "#fff8f8",
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  metricEmoji: {
    fontSize: 16,
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  resetBtn: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productTitleCol: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  actionBtnOutline: {
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    color: "#4f46e5",
    fontWeight: "700",
    fontSize: 12,
  },
  stockDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  cardText: {
    fontSize: 13,
    color: "#64748b",
  },
  boldText: {
    fontWeight: "700",
    color: "#0f172a",
  },
  percentageText: {
    fontSize: 13,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  lowBadge: {
    backgroundColor: "#fef2f2",
    borderWidth: 0.5,
    borderColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lowBadgeText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 9,
  },
  unitBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitBadgeText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 11,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  gridCol: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "700",
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    marginVertical: 24,
    fontSize: 14,
  },
});