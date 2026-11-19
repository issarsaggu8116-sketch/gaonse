import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import API from "../services/api";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [cities, setCities] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
  });

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchData = async () => {
    try {
      setFetching(true);
      const adminsRes = await API.get("/admins");
      const citiesRes = await API.get("/cities");

      setAdmins(adminsRes.data.admins || []);
      setCities(citiesRes.data.cities || []);
    } catch (err) {
      console.log("Fetch Error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || (!editId && !form.password) || !form.city) {
      return Alert.alert("Validation", "All fields are required");
    }

    try {
      setLoading(true);
      if (editId) {
        await API.put(`/admin/${editId}`, form);
        setEditId(null);
      } else {
        await API.post("/admin/create", form);
      }
      setForm({ name: "", email: "", password: "", city: "" });
      fetchData();
    } catch (err) {
      console.log("Submit Error:", err.response?.data || err.message);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (admin) => {
    setForm({
      name: admin.name,
      email: admin.email,
      password: "",
      city: admin.city?._id || "",
    });
    setEditId(admin._id);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Admin",
      "Are you sure you want to delete this admin account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/admin/${id}`);
              fetchData();
            } catch (err) {
              console.log("Delete Error:", err.response?.data || err.message);
              Alert.alert("Error", "Delete failed");
            }
          },
        },
      ]
    );
  };

  const toggleStatus = async (admin) => {
    try {
      await API.put(`/admin/${admin._id}`, {
        isActive: !admin.isActive,
      });
      fetchData();
    } catch (err) {
      console.log("Toggle Error:", err.response?.data || err.message);
      Alert.alert("Error", "Status update failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={admins}
        keyExtractor={(item) => item._id}
        refreshing={fetching}
        onRefresh={fetchData}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>👨‍💼 Admin Control</Text>
              <Text style={styles.headerSubtitle}>
                Provision and manage admin accounts for city operations
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {editId ? "✏️ Edit Admin Account" : "✨ Create Admin Account"}
              </Text>

              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#94a3b8"
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                style={styles.input}
              />

              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#94a3b8"
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                placeholder={editId ? "Password (leave blank to keep current)" : "Password"}
                placeholderTextColor="#94a3b8"
                value={form.password}
                secureTextEntry
                onChangeText={(t) => setForm({ ...form, password: t })}
                style={styles.input}
              />

              <Text style={styles.selectCityLabel}>Assign Operations City</Text>
              <View style={styles.cityButtonsContainer}>
                {cities.map((c) => (
                  <TouchableOpacity
                    key={c._id}
                    onPress={() => setForm({ ...form, city: c._id })}
                    style={[
                      styles.cityBtn,
                      form.city === c._id && styles.cityBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cityBtnText,
                        form.city === c._id && styles.cityBtnTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={[styles.mainBtn, editId && { flex: 1 }]}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.mainBtnText}>
                      {editId ? "Update Account" : "Create Account"}
                    </Text>
                  )}
                </TouchableOpacity>

                {editId && (
                  <TouchableOpacity
                    onPress={() => {
                      setEditId(null);
                      setForm({ name: "", email: "", password: "", city: "" });
                    }}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Admins List ({admins.length})</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !fetching && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No admin accounts created yet.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.adminCard}>
            <View style={styles.adminInfoRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminName}>{item.name}</Text>
                <Text style={styles.adminEmail}>{item.email}</Text>
                <View style={styles.cityBadge}>
                  <Text style={styles.cityBadgeText}>
                    📍 {item.city?.name || "No City Assigned"}
                  </Text>
                </View>
              </View>

              <View style={item.isActive ? styles.activeBadge : styles.inactiveBadge}>
                <Text style={item.isActive ? styles.activeBadgeText : styles.inactiveBadgeText}>
                  {item.isActive ? "Active" : "Disabled"}
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => toggleStatus(item)}
                style={styles.statusButton}
              >
                <Text style={item.isActive ? styles.statusTextDeactivate : styles.statusTextActivate}>
                  {item.isActive ? "🔒 Deactivate" : "🔓 Activate"}
                </Text>
              </TouchableOpacity>

              <View style={styles.rightActions}>
                <TouchableOpacity
                  onPress={() => handleEdit(item)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionTextEdit}>✏️ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(item._id)}
                  style={[styles.actionButton, { marginLeft: 16 }]}
                >
                  <Text style={styles.actionTextDelete}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      />
    </View>
  );
};

export default Admins;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    marginTop: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: "#0f172a",
    marginBottom: 12,
  },
  selectCityLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 6,
    marginBottom: 10,
  },
  cityButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  cityBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  cityBtnActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  cityBtnText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  cityBtnTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
  },
  mainBtn: {
    backgroundColor: "#6366f1",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    minWidth: 120,
  },
  mainBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    color: "#64748b",
    fontWeight: "700",
    fontSize: 15,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  adminCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  adminInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
    marginBottom: 12,
  },
  adminName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  adminEmail: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  cityBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  cityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  activeBadge: {
    backgroundColor: "#ecfdf5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#a7f3d0",
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
  inactiveBadge: {
    backgroundColor: "#fef2f2",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#fca5a5",
  },
  inactiveBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b91c1c",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusButton: {
    paddingVertical: 6,
  },
  statusTextDeactivate: {
    color: "#d97706",
    fontWeight: "700",
    fontSize: 13,
  },
  statusTextActivate: {
    color: "#059669",
    fontWeight: "700",
    fontSize: 13,
  },
  rightActions: {
    flexDirection: "row",
  },
  actionButton: {
    paddingVertical: 6,
  },
  actionTextEdit: {
    color: "#4f46e5",
    fontWeight: "700",
    fontSize: 13,
  },
  actionTextDelete: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 15,
    textAlign: "center",
  },
});