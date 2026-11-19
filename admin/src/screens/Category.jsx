import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Switch,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../services/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [isSubscriptionAllowed, setIsSubscriptionAllowed] =
    useState(false);

  const [editId, setEditId] = useState(null);

  // 📡 FETCH
  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/admin/category");
      setCategories(data.categories || []);
    } catch (err) {
      console.log("Fetch categories error:", err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ➕ CREATE / UPDATE
  const handleSubmit = async () => {
    if (!name) return;

    const payload = {
      name,
      isSubscriptionAllowed,
    };

    try {
      if (editId) {
        await API.put(`/admin/category/${editId}`, payload);
        setEditId(null);
      } else {
        await API.post("/admin/category/create", payload);
      }

      setName("");
      setIsSubscriptionAllowed(false);
      fetchCategories();
    } catch (err) {
      console.log("Submit category error:", err.message);
    }
  };

  // ✏️ EDIT
  const handleEdit = (cat) => {
    setName(cat.name);
    setIsSubscriptionAllowed(cat.isSubscriptionAllowed);
    setEditId(cat._id);
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/category/${id}`);
      fetchCategories();
    } catch (err) {
      console.log("Delete category error:", err.message);
    }
  };

  // 🔄 TOGGLE ACTIVE
  const toggleStatus = async (id) => {
    try {
      await API.put(`/admin/category/toggle/${id}`);
      fetchCategories();
    } catch (err) {
      console.log("Toggle status category error:", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* HEADER */}
        <Text style={styles.header}>📦 Categories</Text>
        <Text style={styles.subtitle}>Configure product categories and subscription policies</Text>

        {/* FORM */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>
            {editId ? "Edit Category ✏️" : "Create New Category ➕"}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category Name</Text>
            <TextInput
              placeholder="e.g. A2 Buffalo Milk"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          {/* 🔥 SUBSCRIPTION TOGGLE */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Allow Subscriptions</Text>
              <Text style={styles.toggleDesc}>Let customers schedule recurring deliveries</Text>
            </View>
            <Switch
              value={isSubscriptionAllowed}
              onValueChange={setIsSubscriptionAllowed}
              trackColor={{ false: "#cbd5e1", true: "#a5b4fc" }}
              thumbColor={isSubscriptionAllowed ? "#4f46e5" : "#f1f5f9"}
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnText}>
              {editId ? "Update Category" : "Save Category"}
            </Text>
          </TouchableOpacity>

          {editId && (
            <TouchableOpacity
              onPress={() => {
                setEditId(null);
                setName("");
                setIsSubscriptionAllowed(false);
              }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LIST */}
        <FlatList
          data={categories}
          scrollEnabled={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={[
                      styles.badge,
                      item.isSubscriptionAllowed ? styles.subAllowedBadge : styles.subDeniedBadge
                    ]}>
                      <Text style={[
                        styles.badgeText,
                        item.isSubscriptionAllowed ? styles.subAllowedText : styles.subDeniedText
                      ]}>
                        {item.isSubscriptionAllowed ? "🔄 Subscriptions Allowed" : "🚫 One-time Only"}
                      </Text>
                    </View>
                    <View style={[
                      styles.badge,
                      item.isActive ? styles.activeBadge : styles.inactiveBadge
                    ]}>
                      <Text style={[
                        styles.badgeText,
                        item.isActive ? styles.activeText : styles.inactiveText
                      ]}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
                  <Text style={[styles.actionText, styles.editColor]}>✏️ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleStatus(item._id)}>
                  <Text style={[styles.actionText, styles.toggleColor]}>
                    {item.isActive ? "⏸️ Suspend" : "▶️ Activate"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
                  <Text style={[styles.actionText, styles.deleteColor]}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Categories;

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
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  toggleDesc: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
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
  cancelBtn: {
    marginTop: 12,
    padding: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 13,
  },
  categoryCard: {
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
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "750",
    color: "#0f172a",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  subAllowedBadge: {
    backgroundColor: "#ecfdf5",
    borderWidth: 0.5,
    borderColor: "#d1fae5",
  },
  subAllowedText: {
    color: "#10b981",
  },
  subDeniedBadge: {
    backgroundColor: "#f8fafc",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  subDeniedText: {
    color: "#64748b",
  },
  activeBadge: {
    backgroundColor: "#eff6ff",
    borderWidth: 0.5,
    borderColor: "#dbeafe",
  },
  activeText: {
    color: "#3b82f6",
  },
  inactiveBadge: {
    backgroundColor: "#fff7ed",
    borderWidth: 0.5,
    borderColor: "#ffedd5",
  },
  inactiveText: {
    color: "#f97316",
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
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  editColor: {
    color: "#4f46e5",
  },
  toggleColor: {
    color: "#f59e0b",
  },
  deleteColor: {
    color: "#ef4444",
  },
});