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

const Cities = () => {
  const [cities, setCities] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchCities = async () => {
    try {
      setFetching(true);
      const { data } = await API.get("/cities");
      setCities(data.cities || []);
    } catch (err) {
      console.log("Fetch Error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch cities");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      return Alert.alert("Validation", "City name is required");
    }

    try {
      setLoading(true);
      if (editId) {
        await API.put(`/cities/${editId}`, { name: name.trim() });
        setEditId(null);
      } else {
        await API.post("/cities/create", { name: name.trim() });
      }
      setName("");
      fetchCities();
    } catch (err) {
      console.log("Submit Error:", err.response?.data || err.message);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (city) => {
    setName(city.name);
    setEditId(city._id);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete City",
      "Are you sure you want to delete this city? This will affect admins assigned to it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await API.delete(`/cities/${id}`);
              fetchCities();
            } catch (err) {
              console.log("Delete Error:", err.response?.data || err.message);
              Alert.alert("Error", "Delete failed");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchCities();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={cities}
        keyExtractor={(item) => item._id}
        refreshing={fetching}
        onRefresh={fetchCities}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>🏙️ City Hub</Text>
              <Text style={styles.headerSubtitle}>
                Manage active delivery locations across GAON SE network
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {editId ? "✏️ Edit Location" : "✨ Add New Location"}
              </Text>

              <TextInput
                placeholder="e.g. Ludhiana, Punjab"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />

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
                      {editId ? "Update City" : "Add City"}
                    </Text>
                  )}
                </TouchableOpacity>

                {editId && (
                  <TouchableOpacity
                    onPress={() => {
                      setEditId(null);
                      setName("");
                    }}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Cities ({cities.length})</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !fetching && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No delivery cities registered yet.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.cityCard}>
            <View style={styles.cityInfo}>
              <Text style={styles.cityName}>{item.name}</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active Location</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.actionButton}
              >
                <Text style={styles.actionTextEdit}>✏️ Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item._id)}
                style={[styles.actionButton, { marginLeft: 20 }]}
              >
                <Text style={styles.actionTextDelete}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      />
    </View>
  );
};

export default Cities;

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
    marginBottom: 16,
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
  cityCard: {
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
  cityInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
    marginBottom: 12,
  },
  cityName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#a7f3d0",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingVertical: 6,
  },
  actionTextEdit: {
    color: "#4f46e5",
    fontWeight: "700",
    fontSize: 14,
  },
  actionTextDelete: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 14,
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