import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../services/api";

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [zones, setZones] = useState([]);

  // 📊 Modal & Sales States
  const [salesModalVisible, setSalesModalVisible] = useState(false);
  const [selectedPartnerSales, setSelectedPartnerSales] = useState(null);
  const [salesLoading, setSalesLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    zone: "",
  });

  // 📡 FETCH DATA
  const fetchData = async () => {
    try {
      const p = await API.get("/admin/delivery");
      const z = await API.get("/admin/zone");

      setPartners(p.data.partners || []);
      setZones(z.data.zones || []);
    } catch (err) {
      Alert.alert("Error", "Failed to load data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ➕ CREATE PARTNER
  const handleSubmit = async () => {
    const { name, phone, password, confirmPassword, zone } = form;

    if (!name || !phone || !password || !confirmPassword || !zone) {
      return Alert.alert("Error", "All fields are required");
    }

    if (phone.length < 10) {
      return Alert.alert("Error", "Invalid phone number");
    }

    if (password.length < 4) {
      return Alert.alert("Error", "Password must be at least 4 characters");
    }

    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    try {
      await API.post("/admin/delivery/create", {
        name,
        phone,
        password,
        zone,
      });

      Alert.alert("Success 🎉", "Delivery Partner Created");

      // RESET FORM
      setForm({
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",
        zone: "",
      });

      fetchData();
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to create partner"
      );
    }
  };

  // 🔄 TOGGLE ACTIVE
  const toggle = async (id) => {
    try {
      await API.put(`/admin/delivery/toggle/${id}`);
      fetchData();
    } catch {
      Alert.alert("Error", "Failed to update status");
    }
  };

  // ❌ DELETE
  const remove = async (id) => {
    Alert.alert("Confirm", "Delete this partner?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/admin/delivery/${id}`);
            fetchData();
          } catch {
            Alert.alert("Error", "Delete failed");
          }
        },
      },
    ]);
  };

  // 📊 FETCH SALES DETAILS ON LONG PRESS
  const handleLongPressPartner = async (partner) => {
    try {
      setSalesLoading(true);
      setSelectedPartnerSales({ partnerName: partner.name });
      setSalesModalVisible(true);

      const { data } = await API.get(`/admin/delivery/sales/${partner._id}`);
      setSelectedPartnerSales(data);
    } catch (err) {
      console.log("Error fetching partner sales:", err);
      Alert.alert("Error", "Failed to fetch sales metrics");
      setSalesModalVisible(false);
    } finally {
      setSalesLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Text style={styles.header}>🚚 Delivery Partners</Text>
        <Text style={styles.subtitle}>
          💡 Long press any partner to view their delivery sales report
        </Text>

        {/* 🧾 FORM */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>Add New Partner</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              value={form.phone}
              onChangeText={(t) => setForm({ ...form, phone: t })}
              style={styles.input}
              keyboardType="numeric"
              placeholder="Phone Number"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              value={form.password}
              onChangeText={(t) => setForm({ ...form, password: t })}
              style={styles.input}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              value={form.confirmPassword}
              onChangeText={(t) =>
                setForm({ ...form, confirmPassword: t })
              }
              style={styles.input}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={[styles.inputLabel, { marginBottom: 8 }]}>Assign Zone</Text>
          <View style={styles.zoneChipsContainer}>
            {zones.map((z) => (
              <TouchableOpacity
                key={z._id}
                onPress={() => setForm({ ...form, zone: z._id })}
                style={[
                  styles.zoneChip,
                  form.zone === z._id && styles.zoneChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.zoneChipText,
                    form.zone === z._id && styles.zoneChipTextActive,
                  ]}
                >
                  {z.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnText}>Add Partner</Text>
          </TouchableOpacity>
        </View>

        {/* 📋 LIST */}
        <FlatList
          data={partners}
          scrollEnabled={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onLongPress={() => handleLongPressPartner(item)}
              activeOpacity={0.8}
              delayLongPress={300}
            >
              <View style={styles.partnerCard}>
                <View style={styles.partnerHeader}>
                  <View>
                    <Text style={styles.partnerName}>{item.name}</Text>
                    <Text style={styles.partnerPhone}>📞 {item.phone}</Text>
                  </View>
                  <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                    <Text style={[styles.statusText, item.isActive ? styles.activeText : styles.inactiveText]}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>

                <View style={styles.partnerMetaRow}>
                  <Text style={styles.metaLabel}>Assigned Zone: </Text>
                  <Text style={styles.metaValue}>{item.zone?.name || "None"}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => toggle(item._id)}>
                    <Text style={[styles.actionText, item.isActive ? styles.suspendColor : styles.activateColor]}>
                      {item.isActive ? "⏸️ Suspend" : "▶️ Activate"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn} onPress={() => remove(item._id)}>
                    <Text style={[styles.actionText, styles.deleteColor]}>
                      🗑️ Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* 📊 PARTNER SALES DETAILS MODAL */}
      <Modal
        visible={salesModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSalesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📊 SALES REPORT</Text>
            <Text style={styles.modalPartnerName}>
              {selectedPartnerSales?.partnerName || "Delivery Partner"}
            </Text>

            {salesLoading ? (
              <ActivityIndicator size="large" color="#4f46e5" style={{ marginVertical: 24 }} />
            ) : (
              <View style={styles.salesReportContainer}>
                <View style={styles.salesRow}>
                  <Text style={styles.salesLabel}>Today's Earnings</Text>
                  <Text style={styles.salesValue}>₹ {selectedPartnerSales?.todaySales || 0}</Text>
                </View>
                <View style={styles.salesRow}>
                  <Text style={styles.salesLabel}>Today's Items Delivered</Text>
                  <Text style={styles.salesValue}>{selectedPartnerSales?.todayItems || 0} pcs</Text>
                </View>

                <View style={styles.modalDivider} />

                <View style={styles.salesRow}>
                  <Text style={styles.salesLabelBold}>Total Earnings</Text>
                  <Text style={styles.salesValueBold}>₹ {selectedPartnerSales?.totalSales || 0}</Text>
                </View>
                <View style={styles.salesRow}>
                  <Text style={styles.salesLabelBold}>Total Items Delivered</Text>
                  <Text style={styles.salesValueBold}>{selectedPartnerSales?.totalItems || 0} pcs</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSalesModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DeliveryPartners;

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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
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
  zoneChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  zoneChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  zoneChipActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  zoneChipText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  zoneChipTextActive: {
    color: "#ffffff",
  },
  btn: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  partnerCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  partnerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "750",
    color: "#0f172a",
  },
  partnerPhone: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  activeBadge: {
    backgroundColor: "#ecfdf5",
    borderColor: "#d1fae5",
  },
  activeText: {
    color: "#10b981",
  },
  inactiveBadge: {
    backgroundColor: "#fef2f2",
    borderColor: "#fee2e2",
  },
  inactiveText: {
    color: "#ef4444",
  },
  partnerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metaLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  metaValue: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  activateColor: {
    color: "#10b981",
  },
  suspendColor: {
    color: "#f59e0b",
  },
  deleteColor: {
    color: "#ef4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  modalPartnerName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 6,
    marginBottom: 20,
  },
  salesReportContainer: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  salesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  salesLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  salesValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 10,
  },
  salesLabelBold: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "700",
  },
  salesValueBold: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10b981",
  },
  closeBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  closeBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});