import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import API from "../api/api";
import * as Location from "expo-location";

export default function SubscriptionScreen() {
  const [orders, setOrders] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [cities, setCities] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [processingId, setProcessingId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [zoneCenter, setZoneCenter] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  /* 🌅 DELIVERY TIME */
  const [deliveryTime, setDeliveryTime] = useState("morning");

  /* 📑 FILTER TAB */
  const [filterTab, setFilterTab] = useState("all"); // "all", "pending", "completed"

  /* -----------------get distance----------------- */
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  //---------optimize route---------
  const optimizeRoute = (ordersList, centerLat, centerLng) => {
    if (!ordersList || !ordersList.length) return [];
    const remaining = [...ordersList];
    const result = [];
    let currentLat = centerLat;
    let currentLng = centerLng;

    while (remaining.length) {
      let nearestIndex = 0;
      let nearestDistance = getDistance(
        currentLat,
        currentLng,
        remaining[0].address.latitude,
        remaining[0].address.longitude
      );

      for (let i = 1; i < remaining.length; i++) {
        const distance = getDistance(
          currentLat,
          currentLng,
          remaining[i].address.latitude,
          remaining[i].address.longitude
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      const next = remaining.splice(nearestIndex, 1)[0];
      result.push(next);
      currentLat = next.address.latitude;
      currentLng = next.address.longitude;
    }
    return result;
  };

  /* 📦 FETCH SUB ORDERS */
  const fetchOrders = async () => {
    try {
      const res = await API.get(
        `/delivery/subscribe-orders/today?deliveryTime=${deliveryTime}`
      );

      if (res.data.zoneCenter) {
        setZoneCenter(res.data.zoneCenter);
      }

      let startLat = res.data.zoneCenter?.lat;
      let startLng = res.data.zoneCenter?.lng;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          startLat = loc.coords.latitude;
          startLng = loc.coords.longitude;
        }
      } catch (locErr) {
        console.log(
          "Could not sort subscription orders using current GPS, falling back to zone center:",
          locErr.message
        );
      }

      const sortedOrders = optimizeRoute(res.data.orders, startLat, startLng);
      setOrders(sortedOrders);
    } catch (err) {
      console.log("FETCH ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* 🥛 GENERATE TODAY ORDERS */
  const generateTodayOrders = async () => {
    try {
      setLoading(true);
      const res = await API.post("/delivery/subscribe-orders/generate", {
        deliveryTime,
      });

      Alert.alert("Success", res.data.message || "Orders generated");
      fetchOrders();
    } catch (err) {
      console.log("GENERATE ERROR:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to generate orders"
      );
    } finally {
      setLoading(false);
    }
  };

  /* 🏙️ FETCH CITIES */
  const fetchCities = async () => {
    try {
      const res = await API.get("/delivery/cities");
      const map = {};
      res.data.cities.forEach((city) => {
        map[city._id] = city.name;
      });
      setCities(map);
    } catch (err) {
      console.log("CITY ERROR:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryTime]);

  useEffect(() => {
    fetchCities();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  /* 📞 CALL CUSTOMER */
  const callCustomer = async (phone) => {
    try {
      if (!phone || phone === "No Phone") {
        Alert.alert("No Phone Number");
        return;
      }
      const url = `tel:${phone}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Calling not supported");
      }
    } catch (err) {
      console.log("CALL ERROR:", err.message);
    }
  };

  /* 🗺️ OPEN MAP */
  const openDirections = async (item) => {
    try {
      const lat = item.address?.latitude || "";
      const long = item.address?.longitude || "";
      const fullAddress = `${lat},${long}`;

      // ✅ GOOGLE MAPS URL
      const url = `geo:0,0?q=${encodeURIComponent(fullAddress)}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        // 🌍 FALLBACK WEB URL
        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          fullAddress
        )}`;
        await Linking.openURL(browserUrl);
      }
    } catch (err) {
      console.log("MAP ERROR:", err.message);
      Alert.alert("Error", "Failed to open map");
    }
  };

  /* 🗺️ OPEN MULTI-STOP ROUTE MAP */
  const openMultiStopRoute = async () => {
    if (!orders || orders.length === 0) {
      Alert.alert("No orders", "There are no active orders to route.");
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to optimize the route from your current location."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const currentLat = location.coords.latitude;
      const currentLng = location.coords.longitude;

      const optimized = optimizeRoute(orders, currentLat, currentLng);
      if (optimized.length === 0) return;

      const originStr = `${currentLat},${currentLng}`;
      const lastOrder = optimized[optimized.length - 1];
      const destStr = `${lastOrder.address.latitude},${lastOrder.address.longitude}`;

      let waypointsStr = "";
      const waypoints = optimized
        .slice(0, -1)
        .map((o) => `${o.address.latitude},${o.address.longitude}`);
      if (waypoints.length > 0) {
        waypointsStr = `&waypoints=${encodeURIComponent(waypoints.join("|"))}`;
      }

      const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}${waypointsStr}`;

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.log("ROUTE MAP ERROR:", err.message);
      Alert.alert("Error", "Failed to retrieve location and optimize route.");
    }
  };

  /* 🚚 START DELIVERY */
  const startDelivery = async (item) => {
    try {
      setProcessingId(item._id);
      await API.put(`/delivery/subscribe-orders/${item._id}/start`);
      fetchOrders();
      openDirections(item);
    } catch (err) {
      console.log("START ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to start delivery");
    } finally {
      setProcessingId(null);
    }
  };

  /* ---------------------------------- */
  /* ✅ DELIVERED WITH OTP Verification */
  /* ---------------------------------- */
  const handleStartDeliverProcess = async (id) => {
    try {
      setProcessingId(id);
      await API.post(`/delivery/subscribe-orders/${id}/send-otp`);
      Alert.alert(
        "OTP Sent",
        "An OTP code has been sent to the customer's email address."
      );
      setCurrentOrderId(id);
      setOtpCode("");
      setOtpModalVisible(true);
    } catch (err) {
      console.log("SEND OTP ERROR:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to send OTP");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!otpCode || otpCode.length < 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setProcessingId(currentOrderId);
      await API.put(
        `/delivery/subscribe-orders/${currentOrderId}/deliver`,
        { otp: otpCode }
      );
      setOtpModalVisible(false);
      Alert.alert(
        "Success",
        "Subscription order delivered and verified successfully!"
      );
      fetchOrders();
    } catch (err) {
      console.log("DELIVER ERROR:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setProcessingId(null);
    }
  };

  /* 🗑️ SOFT DELETE / DISMISS ORDER FOR TODAY */
  const deleteOrder = async (id) => {
    Alert.alert(
      "Dismiss Order",
      "Hide this completed delivery card from today's list?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Hide / Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingId(id);
              await API.delete(`/delivery/subscribe-orders/${id}`);
              fetchOrders();
            } catch (err) {
              console.log("DELETE ERROR:", err.response?.data || err.message);
              Alert.alert("Error", "Failed to hide subscription order");
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  /* ---------------------------------- */
  /* CARD STATE THEME */
  /* ---------------------------------- */
  const getSubStatusColor = (status) => {
    switch (status) {
      case "approved":
        return {
          bg: "#e0e7ff",
          text: "#4f46e5",
          border: "#4f46e5",
          label: "Approved",
        };
      case "out_for_delivery":
        return {
          bg: "#f3e8ff",
          text: "#9333ea",
          border: "#9333ea",
          label: "Out For Delivery",
        };
      case "delivered":
        return {
          bg: "#e6f9f0",
          text: "#0cbb69",
          border: "#0cbb69",
          label: "Delivered",
        };
      default:
        return {
          bg: "#f1f5f9",
          text: "#475569",
          border: "#cbd5e1",
          label: status,
        };
    }
  };

  /* ---------------------------------- */
  /* FILTER AND METRICS COMPUTATIONS */
  /* ---------------------------------- */
  const pendingOrders = orders.filter(
    (o) => o.status === "approved" || o.status === "out_for_delivery"
  );
  const completedOrders = orders.filter((o) => o.status === "delivered");

  const totalPending = pendingOrders.length;
  const totalCompleted = completedOrders.length;
  const completedEarnings = completedOrders.reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );

  const filteredOrders = orders.filter((order) => {
    if (filterTab === "pending") {
      return order.status === "approved" || order.status === "out_for_delivery";
    }
    if (filterTab === "completed") {
      return order.status === "delivered";
    }
    return true; // "all"
  });

  const renderItem = ({ item }) => {
    const busy = processingId === item._id;
    const phone = item.user?.phone || "No Phone";
    const statusTheme = getSubStatusColor(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onLongPress={() => {
          setSelectedOrder(item);
          setDetailModalVisible(true);
        }}
        style={[styles.orderCard, { borderLeftColor: statusTheme.border }]}
      >
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusTheme.bg },
            ]}
          >
            <Text style={[styles.statusText, { color: statusTheme.text }]}>
              {statusTheme.label}
            </Text>
          </View>
          <Text style={styles.cardTotal}>₹{item.total}</Text>
        </View>

        {/* Customer & Product details */}
        <View style={styles.customerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>{item.user?.name || "N/A"}</Text>
            <View style={styles.itemBadgeContainer}>
              <Text style={styles.itemSummaryText}>
                🥛 {item.item?.name} (x{item.item?.qty})
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.phoneCircle}
            onPress={() => callCustomer(phone)}
          >
            <Ionicons name="call" size={18} color="#0cbb69" />
          </TouchableOpacity>
        </View>

        {/* Address snippet with pin icon */}
        <View style={styles.addressContainer}>
          <Ionicons
            name="location"
            size={16}
            color="#64748b"
            style={{ marginRight: 6, marginTop: 1 }}
          />
          <Text style={styles.addressSnippet} numberOfLines={2}>
            {item.address?.text}
          </Text>
        </View>

        <Text style={styles.longPressInstruction}>
          💡 Hold card to view all details & customer info
        </Text>

        {/* Action Buttons Row */}
        <View style={styles.cardActions}>
          {item.status === "approved" && (
            <TouchableOpacity
              disabled={busy}
              style={[styles.cardActionBtn, styles.startBtn]}
              onPress={() => startDelivery(item)}
            >
              <Ionicons
                name="bicycle"
                size={14}
                color="#4f46e5"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.startBtnText}>
                {busy ? "Loading..." : "Start"}
              </Text>
            </TouchableOpacity>
          )}

          {item.status === "out_for_delivery" && (
            <TouchableOpacity
              disabled={busy}
              style={[styles.cardActionBtn, styles.deliverBtn]}
              onPress={() => handleStartDeliverProcess(item._id)}
            >
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#0cbb69"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.deliverBtnText}>
                {busy ? "Loading..." : "Deliver"}
              </Text>
            </TouchableOpacity>
          )}

          {item.status === "delivered" && (
            <TouchableOpacity
              disabled={busy}
              style={[styles.cardActionBtn, styles.deleteBtn]}
              onPress={() => deleteOrder(item._id)}
            >
              <Ionicons
                name="trash-outline"
                size={14}
                color="#ef4444"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.deleteBtnText}>
                {busy ? "Loading..." : "Delete"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.cardActionBtn, styles.directionBtn]}
            onPress={() => openDirections(item)}
          >
            <Ionicons
              name="map-outline"
              size={14}
              color="#9333ea"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.directionBtnText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  /* ---------------------------------- */
  /* LOADING STATE */
  /* ---------------------------------- */
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0cbb69" />
        <Text style={styles.loadingText}>Fetching subscription orders...</Text>
      </View>
    );
  }

  /* ---------------------------------- */
  /* SCREEN RENDER */
  /* ---------------------------------- */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0cbb69"]}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Title & Brand Header */}
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerTitle}>🔁 Subscription Orders</Text>
                <Text style={styles.headerSubtitle}>
                  Deliver Gaon Se fresh items
                </Text>
              </View>
            </View>

            {/* Morning / Evening Segment Picker */}
            <View style={styles.timeSwitchContainer}>
              <TouchableOpacity
                onPress={() => {
                  setDeliveryTime("morning");
                  setFilterTab("all");
                }}
                style={[
                  styles.timeSwitchBtn,
                  deliveryTime === "morning" && styles.timeSwitchBtnActive,
                ]}
              >
                <Ionicons
                  name="sunny"
                  size={16}
                  color={deliveryTime === "morning" ? "#fff" : "#64748b"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.timeSwitchText,
                    deliveryTime === "morning" && styles.timeSwitchTextActive,
                  ]}
                >
                  Morning
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setDeliveryTime("evening");
                  setFilterTab("all");
                }}
                style={[
                  styles.timeSwitchBtn,
                  deliveryTime === "evening" && styles.timeSwitchBtnActive,
                ]}
              >
                <Ionicons
                  name="moon"
                  size={16}
                  color={deliveryTime === "evening" ? "#fff" : "#64748b"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.timeSwitchText,
                    deliveryTime === "evening" && styles.timeSwitchTextActive,
                  ]}
                >
                  Evening
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dashboard Cards Metrics */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricCard, { borderLeftColor: "#4f46e5" }]}>
                <Ionicons name="time" size={18} color="#4f46e5" />
                <Text style={styles.metricVal}>{totalPending}</Text>
                <Text style={styles.metricLabel}>Pending</Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: "#0cbb69" }]}>
                <Ionicons name="checkmark-circle" size={18} color="#0cbb69" />
                <Text style={[styles.metricVal, { color: "#0cbb69" }]}>
                  {totalCompleted}
                </Text>
                <Text style={styles.metricLabel}>Completed</Text>
              </View>

              <View style={[styles.metricCard, { borderLeftColor: "#ea580c" }]}>
                <Ionicons name="cash" size={18} color="#ea580c" />
                <Text style={[styles.metricVal, { color: "#ea580c" }]}>
                  ₹{completedEarnings}
                </Text>
                <Text style={styles.metricLabel}>Today Earnings</Text>
              </View>
            </View>

            {/* Pill Tabs for Filtering */}
            <View style={styles.pillsContainer}>
              <TouchableOpacity
                style={[
                  styles.pillBtn,
                  filterTab === "all" && styles.pillBtnActive,
                ]}
                onPress={() => setFilterTab("all")}
              >
                <Text
                  style={[
                    styles.pillText,
                    filterTab === "all" && styles.pillTextActive,
                  ]}
                >
                  All ({orders.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pillBtn,
                  filterTab === "pending" && styles.pillBtnActive,
                ]}
                onPress={() => setFilterTab("pending")}
              >
                <Text
                  style={[
                    styles.pillText,
                    filterTab === "pending" && styles.pillTextActive,
                  ]}
                >
                  Pending ({totalPending})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pillBtn,
                  filterTab === "completed" && styles.pillBtnActive,
                ]}
                onPress={() => setFilterTab("completed")}
              >
                <Text
                  style={[
                    styles.pillText,
                    filterTab === "completed" && styles.pillTextActive,
                  ]}
                >
                  Completed ({totalCompleted})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Actions Buttons */}
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity
                onPress={generateTodayOrders}
                activeOpacity={0.8}
                style={[styles.primaryActionBtn, { backgroundColor: "#111827" }]}
              >
                <Ionicons
                  name="sync-circle"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.primaryActionBtnText}>
                  Generate {deliveryTime === "morning" ? "Morning" : "Evening"}
                </Text>
              </TouchableOpacity>

              {orders.length > 0 && (
                <TouchableOpacity
                  onPress={openMultiStopRoute}
                  activeOpacity={0.8}
                  style={[
                    styles.primaryActionBtn,
                    { backgroundColor: "#3f51b5", marginLeft: 10 },
                  ]}
                >
                  <Ionicons
                    name="map"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.primaryActionBtnText}>View Route Map</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>
              No {deliveryTime} subscription orders under &quot;{filterTab}&quot; filter today.
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      />

      {/* OTP Delivery Verification Modal */}
      <Modal
        visible={otpModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalOverlayContainer}>
          <View style={styles.otpModalContent}>
            <View style={styles.otpHeaderRow}>
              <Text style={styles.otpTitle}>🔒 Delivery Verification</Text>
              <TouchableOpacity
                onPress={() => setOtpModalVisible(false)}
                style={styles.otpCloseCircle}
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.otpSubtitle}>
              Please enter the 6-digit verification code sent to the customer&apos;s
              registered email address.
            </Text>

            <TextInput
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#94a3b8"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.otpInput}
            />

            <View style={styles.otpButtonRow}>
              <TouchableOpacity
                onPress={() => setOtpModalVisible(false)}
                style={[styles.otpBtn, styles.otpCancelBtn]}
              >
                <Text style={styles.otpCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelivery}
                style={[styles.otpBtn, styles.otpConfirmBtn]}
              >
                <Text style={styles.otpConfirmBtnText}>Verify & Deliver</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detailed View Modal on Long Press */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>🔁 Subscription Details</Text>
                <Text style={styles.modalSubtitleText}>
                  Order Snapshot Information
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >
                {/* Status & Total Row */}
                <View style={styles.modalRow}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: getSubStatusColor(selectedOrder.status)
                          .bg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: getSubStatusColor(selectedOrder.status).text,
                        },
                      ]}
                    >
                      {getSubStatusColor(selectedOrder.status).label}
                    </Text>
                  </View>
                  <Text style={styles.modalTotal}>₹{selectedOrder.total}</Text>
                </View>

                {/* Customer Info Section */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionCardTitle}>👤 Customer Info</Text>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.user?.name || "N/A"}
                    </Text>
                  </View>

                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.user?.email || "N/A"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      callCustomer(selectedOrder.user?.phone || "No Phone")
                    }
                    style={styles.modalPhoneBtn}
                  >
                    <Ionicons
                      name="call"
                      size={16}
                      color="#fff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.modalPhoneText}>
                      Call: {selectedOrder.user?.phone || "No Phone"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Address Section */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionCardTitle}>📍 Delivery Address</Text>
                  <Text style={styles.addressText}>
                    {selectedOrder.address?.text}
                  </Text>
                  <TouchableOpacity
                    onPress={() => openDirections(selectedOrder)}
                    style={styles.modalMapBtn}
                  >
                    <Ionicons
                      name="navigate"
                      size={16}
                      color="#fff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.modalMapText}>Get Directions</Text>
                  </TouchableOpacity>
                </View>

                {/* Product details */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionCardTitle}>🥛 Product & Time</Text>
                  <View style={styles.detailItemRow}>
                    <Text style={styles.detailLabel}>Timeframe:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.deliveryTime === "morning"
                        ? "🌅 Morning"
                        : "🌙 Evening"}
                    </Text>
                  </View>

                  <View style={styles.itemRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.itemNameText}>
                        {selectedOrder.item?.name}
                      </Text>
                      <Text style={styles.itemPriceText}>
                        ₹{selectedOrder.item?.price} each
                      </Text>
                    </View>
                    <Text style={styles.itemQtyText}>
                      x{selectedOrder.item?.qty}
                    </Text>
                    <Text style={styles.itemTotalText}>
                      ₹{selectedOrder.item?.price * selectedOrder.item?.qty}
                    </Text>
                  </View>
                </View>

                {/* Meta details */}
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Subscription ID: {selectedOrder._id}
                  </Text>
                  <Text style={styles.metaText}>
                    Generated Date: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  headerContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "400",
  },
  timeSwitchContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  timeSwitchBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  timeSwitchBtnActive: {
    backgroundColor: "#0cbb69",
    shadowColor: "#0cbb69",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timeSwitchText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 13,
  },
  timeSwitchTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderLeftWidth: 4,
    marginHorizontal: 3,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4f46e5",
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
    marginTop: 2,
  },
  pillsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  pillBtn: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pillBtnActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  pillTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  quickActionsContainer: {
    flexDirection: "row",
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryActionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  customerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  itemBadgeContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemSummaryText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  phoneCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e6f9f0",
    alignItems: "center",
    justifyContent: "center",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  addressSnippet: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  longPressInstruction: {
    fontSize: 11,
    color: "#94a3b8",
    fontStyle: "italic",
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
    marginTop: 4,
  },
  cardActionBtn: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtn: {
    backgroundColor: "#e0e7ff",
  },
  startBtnText: {
    color: "#4f46e5",
    fontWeight: "700",
    fontSize: 12,
  },
  deliverBtn: {
    backgroundColor: "#e6f9f0",
  },
  deliverBtnText: {
    color: "#0cbb69",
    fontWeight: "700",
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: "#fef2f2",
  },
  deleteBtnText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 12,
  },
  directionBtn: {
    backgroundColor: "#f3e8ff",
  },
  directionBtnText: {
    color: "#9333ea",
    fontWeight: "700",
    fontSize: 12,
  },
  modalOverlayContainer: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  otpModalContent: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  otpHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  otpCloseCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  otpSubtitle: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 6,
    fontWeight: "700",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    marginBottom: 24,
  },
  otpButtonRow: {
    flexDirection: "row",
  },
  otpBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  otpCancelBtn: {
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  otpCancelBtnText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 13,
  },
  otpConfirmBtn: {
    backgroundColor: "#0cbb69",
    marginLeft: 8,
  },
  otpConfirmBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailModalContainer: {
    backgroundColor: "#fff",
    width: "90%",
    maxHeight: "80%",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  modalSubtitleText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    padding: 20,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  modalTotal: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0cbb69",
  },
  sectionCard: {
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  addressText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
    marginBottom: 12,
  },
  modalPhoneBtn: {
    flexDirection: "row",
    backgroundColor: "#0cbb69",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  modalPhoneText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  modalMapBtn: {
    flexDirection: "row",
    backgroundColor: "#3f51b5",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalMapText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
  },
  itemNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  itemPriceText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  itemQtyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginHorizontal: 10,
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  metaRow: {
    marginTop: 8,
    marginBottom: 24,
  },
  metaText: {
    fontSize: 11,
    color: "#94a3b8",
    marginVertical: 2,
  },
});