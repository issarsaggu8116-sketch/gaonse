import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import API from "../api/api";
import * as Location from "expo-location";

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [cities, setCities] = useState({});
  const [users, setUsers] = useState({}); // userId => phone
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [zoneCenter, setZoneCenter] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);


  //--get distance ---
  const getDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
};

//---optimize route ----
const optimizeRoute = (
  orders,
  centerLat,
  centerLng
) => {

  if (!orders.length) return [];

  const remaining = [...orders];

  const sorted = [];

  let currentLat = centerLat;
  let currentLng = centerLng;

  while (remaining.length > 0) {

    let nearestIndex = 0;

    let nearestDistance =
      getDistance(
        currentLat,
        currentLng,
        remaining[0].address.latitude,
        remaining[0].address.longitude
      );

    for (
      let i = 1;
      i < remaining.length;
      i++
    ) {

      const distance =
        getDistance(
          currentLat,
          currentLng,
          remaining[i].address.latitude,
          remaining[i].address.longitude
        );

      if (
        distance <
        nearestDistance
      ) {
        nearestDistance =
          distance;

        nearestIndex = i;
      }
    }

    const nextOrder =
      remaining.splice(
        nearestIndex,
        1
      )[0];

    sorted.push(nextOrder);

    currentLat =
      nextOrder.address.latitude;

    currentLng =
      nextOrder.address.longitude;
  }

  return sorted;
};


  /* ===============================
     FETCH ORDERS
  =============================== */
  const fetchOrders = async () => {
    try {
      const res = await API.get(
        "/delivery/today-orders/zone"
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
        console.log("Could not sort orders using current GPS, falling back to zone center:", locErr.message);
      }

      const sortedOrders = optimizeRoute(
        res.data.orders,
        startLat,
        startLng
      );

      setOrders(sortedOrders);
    } catch (err) {

    console.log(
      "FETCH ERROR:",
      err.response?.data ||
      err.message
    );
  }
};

  /* ===============================
     FETCH CITIES
  =============================== */
  const fetchCities = async () => {
    try {
      const res = await API.get("/delivery/cities");

      const cityMap = {};

      res.data.cities.forEach((city) => {
        cityMap[city._id] = city.name;
      });

      setCities(cityMap);
    } catch (err) {
      console.log("CITY ERROR:", err.response?.data || err.message);
    }
  };

  /* ===============================
     FETCH USERS
  =============================== */
  const fetchUsers = async () => {
    try {
      const res = await API.get("/delivery/users");

      const userMap = {};

      res.data.users.forEach((user) => {
        userMap[user._id] = user.phone;
      });

      setUsers(userMap);
    } catch (err) {
      console.log("USER ERROR:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCities();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===============================
     ORDER ACTIONS
  =============================== */
  const approve = async (id) => {
    try {
      await API.put(`/delivery/today-orders/approve/${id}`);
      fetchOrders();
    } catch (err) {
      console.log("APPROVE ERROR:", err.response?.data || err.message);
    }
  };

  const start = async (item) => {
    try {
      await API.put(`/delivery/today-orders/start/${item._id}`);
      fetchOrders();

      // auto open directions
      openDirections(item);
    } catch (err) {
      console.log("START ERROR:", err.response?.data || err.message);
    }
  };

  const handleStartDeliverProcess = async (id) => {
    try {
      await API.post(`/delivery/today-orders/send-otp/${id}`);
      Alert.alert("OTP Sent", "An OTP code has been sent to the customer's email address.");
      setCurrentOrderId(id);
      setOtpCode("");
      setOtpModalVisible(true);
    } catch (err) {
      console.log("SEND OTP ERROR:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleConfirmDelivery = async () => {
    if (!otpCode || otpCode.length < 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      await API.put(`/delivery/today-orders/complete/${currentOrderId}`, { otp: otpCode });
      setOtpModalVisible(false);
      Alert.alert("Success", "Order delivered and verified successfully!");
      fetchOrders();
    } catch (err) {
      console.log("DELIVER ERROR:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to verify OTP");
    }
  };

  /* ===============================
     CALL CUSTOMER
  =============================== */
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

  /* ===============================
     OPEN MAP
  =============================== */
  const openDirections = async (item) => {
  try {
    const lat =
      item.address?.latitude || "";
    const long =
      item.address?.longitude || "";  
    

    const fullAddress = `${lat},${long}`;

    // ✅ GOOGLE MAPS URL
    const url =
      `geo:0,0?q=${encodeURIComponent(fullAddress)}`;

    const supported =
      await Linking.canOpenURL(url);

    if (supported) {

      await Linking.openURL(url);

    } else {

      // 🌍 FALLBACK WEB URL
      const browserUrl =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          fullAddress
        )}`;

      await Linking.openURL(browserUrl);
    }

  } catch (err) {

    console.log(
      "MAP ERROR:",
      err.message
    );

    Alert.alert(
      "Error",
      "Failed to open map"
    );
  }
};

  /* ===============================
     OPEN MULTI-STOP ROUTE MAP
  =============================== */
  const openMultiStopRoute = async () => {
    if (!orders || orders.length === 0) {
      Alert.alert("No orders", "There are no active orders to route.");
      return;
    }

    try {
      // 1. Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to optimize the route from your current location."
        );
        return;
      }

      // 2. Fetch current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const currentLat = location.coords.latitude;
      const currentLng = location.coords.longitude;

      // 3. Optimize route starting from current location
      const optimized = optimizeRoute(orders, currentLat, currentLng);

      if (optimized.length === 0) return;

      // 4. Construct multi-stop Google Maps URL
      const originStr = `${currentLat},${currentLng}`;
      const lastOrder = optimized[optimized.length - 1];
      const destStr = `${lastOrder.address.latitude},${lastOrder.address.longitude}`;

      let waypointsStr = "";
      const waypoints = optimized.slice(0, -1).map(o => `${o.address.latitude},${o.address.longitude}`);
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

  /* ===============================
     CARD UI
  =============================== */
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return { bg: "#fff7ed", text: "#ea580c" };
      case "approved":
        return { bg: "#e0e7ff", text: "#4f46e5" };
      case "out_for_delivery":
        return { bg: "#f3e8ff", text: "#9333ea" };
      case "delivered":
        return { bg: "#dcfce7", text: "#16a34a" };
      default:
        return { bg: "#f1f5f9", text: "#475569" };
    }
  };

  const renderItem = ({ item }) => {
    const phone =
      item.user?.phone || users[item.user] || "No Phone";
    const statusTheme = getStatusColor(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => {
          setSelectedOrder(item);
          setDetailModalVisible(true);
        }}
        style={styles.orderCard}
      >
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
            <Text style={[styles.statusText, { color: statusTheme.text }]}>
              {item.status.toUpperCase().replace(/_/g, " ")}
            </Text>
          </View>
          <Text style={styles.cardTotal}>₹ {item.total}</Text>
        </View>

        {/* Customer phone call badge */}
        <TouchableOpacity style={styles.phoneBadge} onPress={() => callCustomer(phone)}>
          <Text style={styles.phoneBadgeText}>📞 {phone}</Text>
        </TouchableOpacity>

        {/* Address */}
        <Text style={styles.addressSnippet} numberOfLines={2}>
          📍 {item.address?.text}
        </Text>

        {/* Short Item List */}
        <Text style={styles.itemsSummaryLine} numberOfLines={1}>
          📦 {item.items?.map(i => `${i.name} (x${i.qty})`).join(", ")}
        </Text>

        <Text style={styles.longPressInstruction}>💡 Hold card to view all details & customer info</Text>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          {item.status === "pending" && (
            <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => approve(item._id)}>
              <Text style={styles.approveBtnText}>✅ Approve</Text>
            </TouchableOpacity>
          )}

          {item.status === "approved" && (
            <TouchableOpacity style={[styles.actionBtn, styles.startBtn]} onPress={() => start(item)}>
              <Text style={styles.startBtnText}>🚚 Start</Text>
            </TouchableOpacity>
          )}

          {item.status === "out_for_delivery" && (
            <TouchableOpacity style={[styles.actionBtn, styles.deliverBtn]} onPress={() => handleStartDeliverProcess(item._id)}>
              <Text style={styles.deliverBtnText}>🎯 Delivered</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.actionBtn, styles.directionBtn]} onPress={() => openDirections(item)}>
            <Text style={styles.directionBtnText}>🗺️ Direction</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={
          orders.length > 0 ? (
            <TouchableOpacity
              onPress={openMultiStopRoute}
              style={{
                backgroundColor: "#3f51b5",
                padding: 15,
                borderRadius: 12,
                margin: 10,
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
                🗺️ View Full Route Map ({orders.length} Stops)
              </Text>
            </TouchableOpacity>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />

      {/* OTP Delivery Verification Modal */}
      <Modal
        visible={otpModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#fff", width: "85%", padding: 25, borderRadius: 16, elevation: 5 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>🔒 Delivery Verification</Text>
            <Text style={{ color: "#666", marginBottom: 20 }}>Please enter the 6-digit verification code sent to the customer&apos;s registered email address.</Text>
            
            <TextInput
              placeholder="Enter 6-digit OTP"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 12,
                fontSize: 18,
                textAlign: "center",
                letterSpacing: 4,
                marginBottom: 20,
              }}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                onPress={() => setOtpModalVisible(false)}
                style={{ flex: 1, padding: 12, marginRight: 8, borderRadius: 8, backgroundColor: "#eee" }}
              >
                <Text style={{ textAlign: "center", fontWeight: "bold", color: "#333" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelivery}
                style={{ flex: 1, padding: 12, marginLeft: 8, borderRadius: 8, backgroundColor: "#2e7d32" }}
              >
                <Text style={{ textAlign: "center", fontWeight: "bold", color: "#fff" }}>Verify & Deliver</Text>
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
              <Text style={styles.modalTitle}>📦 Order Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                {/* Status & Total Row */}
                <View style={styles.modalRow}>
                  <View style={[styles.badge, { backgroundColor: getStatusColor(selectedOrder.status).bg }]}>
                    <Text style={[styles.badgeText, { color: getStatusColor(selectedOrder.status).text }]}>
                      {selectedOrder.status.toUpperCase().replace(/_/g, " ")}
                    </Text>
                  </View>
                  <Text style={styles.modalTotal}>₹{selectedOrder.total}</Text>
                </View>

                {/* Customer Info Section */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionCardTitle}>👤 Customer Information</Text>
                  <Text style={styles.detailLabel}>Customer Name:</Text>
                  <Text style={styles.detailValue}>{selectedOrder.user?.name || "N/A"}</Text>

                  <Text style={styles.detailLabel}>Email Address:</Text>
                  <Text style={styles.detailValue}>{selectedOrder.user?.email || "N/A"}</Text>
                  
                  <TouchableOpacity 
                    onPress={() => callCustomer(selectedOrder.user?.phone || users[selectedOrder.user] || "No Phone")} 
                    style={styles.modalPhoneBtn}
                  >
                    <Text style={styles.modalPhoneText}>
                      📞 Call Customer: {selectedOrder.user?.phone || users[selectedOrder.user] || "No Phone"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Address Section */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionCardTitle}>📍 Delivery Address</Text>
                  <Text style={styles.addressText}>{selectedOrder.address?.text}</Text>
                  <TouchableOpacity onPress={() => openDirections(selectedOrder)} style={styles.modalMapBtn}>
                    <Text style={styles.modalMapText}>🗺️ Open in Google Maps</Text>
                  </TouchableOpacity>
                </View>

                {/* Items Table Section */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionCardTitle}>🛒 Items Summary</Text>
                  {selectedOrder.items?.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.itemNameText}>{item.name}</Text>
                        <Text style={styles.itemPriceText}>₹{item.price} each</Text>
                      </View>
                      <Text style={styles.itemQtyText}>x{item.qty}</Text>
                      <Text style={styles.itemTotalText}>₹{item.price * item.qty}</Text>
                    </View>
                  ))}
                </View>
                
                {/* Meta details */}
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>Order Type: {selectedOrder.type || "Standard"}</Text>
                  <Text style={styles.metaText}>Order ID: {selectedOrder._id}</Text>
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
  orderCard: {
    padding: 16,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  phoneBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 8,
  },
  phoneBadgeText: {
    color: "#166534",
    fontWeight: "700",
    fontSize: 13,
  },
  addressSnippet: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 8,
  },
  itemsSummaryLine: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  longPressInstruction: {
    fontSize: 11,
    color: "#94a3b8",
    fontStyle: "italic",
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
    marginVertical: 4,
  },
  approveBtn: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#ffedd5",
  },
  approveBtnText: {
    color: "#ea580c",
    fontWeight: "700",
    fontSize: 13,
  },
  startBtn: {
    backgroundColor: "#e0e7ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  startBtnText: {
    color: "#4f46e5",
    fontWeight: "700",
    fontSize: 13,
  },
  deliverBtn: {
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  deliverBtnText: {
    color: "#16a34a",
    fontWeight: "700",
    fontSize: 13,
  },
  directionBtn: {
    backgroundColor: "#f3e8ff",
    borderWidth: 1,
    borderColor: "#e9d5ff",
  },
  directionBtnText: {
    color: "#9333ea",
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
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  closeButton: {
    padding: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  modalScroll: {
    padding: 16,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalTotal: {
    fontSize: 22,
    fontWeight: "800",
    color: "#166534",
  },
  sectionCard: {
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
    marginBottom: 10,
  },
  modalPhoneBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  modalPhoneText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  modalMapBtn: {
    backgroundColor: "#3f51b5",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
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
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#cbd5e1",
  },
  itemNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  itemPriceText: {
    fontSize: 11,
    color: "#64748b",
  },
  itemQtyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginHorizontal: 10,
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  metaRow: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#94a3b8",
    marginVertical: 2,
  },
});