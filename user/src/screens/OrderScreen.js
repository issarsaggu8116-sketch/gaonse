import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import axios from "axios";

import { BASE_URL } from "../config";

const OrderScreen = ({
  navigation,
}) => {
  const [orders, setOrders] =
    useState([]);

  const [refreshing, setRefreshing] =
    useState(false);

  const fetchOrders = async () => {
    try {
      const { data } =
        await axios.get(
          `${BASE_URL}/api/v1/order/me`,
          {
            withCredentials: true,
          }
        );

      setOrders(data.orders || []);
    } catch (err) {
      console.log(
        "Order fetch error:",
        err.message
      );
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const unsub =
      navigation.addListener(
        "focus",
        fetchOrders
      );

    return unsub;
  }, [navigation]);

  const getStatusColor = (
    status
  ) => {
    switch (status) {
      case "pending":
        return "#ff9800";

      case "approved":
        return "#2196f3";

      case "out_for_delivery":
        return "#9c27b0";

      case "delivered":
        return "#0cbb69";

      default:
        return "#777";
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>
          My Orders 📦
        </Text>

        {orders.length === 0 ? (
          <Text style={styles.empty}>
            No orders yet 🚀
          </Text>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) =>
              item._id
            }
            contentContainerStyle={{
              paddingBottom: 120,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchOrders();
                }}
              />
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.id}>
                    Order #{item._id.slice(-6)}
                  </Text>
                  <View
                    style={[
                      styles.status,
                      {
                        backgroundColor: getStatusColor(item.status),
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.dateText}>
                  {new Date(item.date).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </Text>

                <View style={styles.divider} />

                {item.items?.map((subItem, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>
                      • {subItem.name} x{subItem.qty}
                    </Text>
                    <Text style={styles.itemPrice}>
                      ₹{subItem.price * subItem.qty}
                    </Text>
                  </View>
                ))}

                <View style={styles.divider} />

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
                  <Text style={styles.totalLabel}>Total Amount:</Text>
                  <Text style={styles.totalAmount}>₹{item.total}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fae8c3",
  },

  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: "#fae8c3",
  },

  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#4E342E",
    marginBottom: 16,
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#6D4C41",
  },

  card: {
    backgroundColor: "#FFFDF8",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8DDD0",
    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  id: {
    fontWeight: "800",
    fontSize: 15,
    color: "#4E342E",
  },

  dateText: {
    fontSize: 12,
    color: "#8B7355",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#E8DDD0",
    marginVertical: 10,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },

  itemName: {
    fontSize: 14,
    color: "#5C3D2E",
    fontWeight: "500",
  },

  itemPrice: {
    fontSize: 14,
    color: "#6D4C41",
    fontWeight: "600",
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "750",
    color: "#5C3D2E",
  },

  totalAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#6D4C41",
  },

  status: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});