import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../services/api";
import { useFocusEffect } from "@react-navigation/native";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 📡 FETCH PENDING ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/admin/orders/pending");
      setOrders(data.orders || []);
    } catch (err) {
      console.log("❌ Fetch Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  // 🔄 REFRESH
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // ✅ APPROVE
  const approveOrder = async (id) => {
    try {
      await API.put(`/admin/orders/approve/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
      Alert.alert("Success", "Order Approved ✅");
    } catch (err) {
      Alert.alert("Error", "Failed to approve");
    }
  };

  // ❌ CANCEL
  const cancelOrder = async (id) => {
    Alert.alert("Confirm", "Cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            await API.put(`/admin/orders/cancel/${id}`);
            setOrders((prev) => prev.filter((o) => o._id !== id));
            Alert.alert("Cancelled ❌");
          } catch (err) {
            Alert.alert("Error", "Failed to cancel");
          }
        },
      },
    ]);
  };

  // 🔍 SHOW ORDER DETAILS ON LONG PRESS
  const showOrderDetails = (order) => {
    const itemsList = order.items
      ?.map((item) => `• ${item.name} x${item.qty} - ₹${item.price}`)
      .join("\n") || "No items";

    Alert.alert(
      "📋 Order Details",
      `Customer: ${order.user?.name || "Customer"}\nPhone: ${order.user?.phone || "-"}\nAddress: ${order.address?.text || "No address"}\nTotal: ₹${order.total}\n\nItems:\n${itemsList}`,
      [{ text: "Close", style: "cancel" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>📦 Pending Orders</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{orders.length} New</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Approve or cancel incoming orders • Hold card for items list
        </Text>
      </View>

      {/* LOADING */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : null}

      {/* EMPTY STATE */}
      {!loading && orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>No pending orders to review right now.</Text>
        </View>
      ) : null}

      {/* LIST */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6366f1"]} />
        }
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={() => showOrderDetails(item)}
            style={styles.card}
          >
            {/* User Header */}
            <View style={styles.userRow}>
              <View>
                <Text style={styles.userName}>{item.user?.name || "Customer"}</Text>
                <Text style={styles.userPhone}>📞 {item.user?.phone || "-"}</Text>
              </View>
              <Text style={styles.priceTag}>₹{item.total}</Text>
            </View>

            {/* Address */}
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>📍 Address</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {item.address?.text || "No address"}
              </Text>
            </View>

            {/* Items Summary */}
            <View style={styles.itemsRow}>
              <Text style={styles.itemsCount}>🛒 {item.items?.length || 0} items</Text>
              <Text style={styles.holdHint}>Hold card to inspect items</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => approveOrder(item._id)}
                style={styles.approveBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.approveBtnText}>✅ Approve Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => cancelOrder(item._id)}
                style={styles.cancelBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#c7d2fe",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  userPhone: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  priceTag: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  addressRow: {
    marginTop: 12,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    color: "#334155",
    marginTop: 2,
    lineHeight: 20,
    fontWeight: "500",
  },
  itemsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  itemsCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  holdHint: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  approveBtn: {
    flex: 2,
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  approveBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 14,
  },
});