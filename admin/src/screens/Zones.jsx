import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../services/api";

const Zones = () => {
  const [zones, setZones] = useState([]);

  const [form, setForm] = useState({
    name: "",
    lat: "",
    lng: "",
    radius: "",
  });

  const [editId, setEditId] = useState(null);

  // 📡 FETCH ZONES
  const fetchZones = async () => {
    try {
      const res = await API.get("/admin/zone");
      setZones(res.data.zones || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // ➕ CREATE / UPDATE
  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.lat ||
      !form.lng ||
      !form.radius
    ) {
      return;
    }

    const payload = {
      name: form.name,
      center: {
        lat: Number(form.lat),
        lng: Number(form.lng),
      },
      radius: Number(form.radius),
    };

    try {
      if (editId) {
        await API.put(`/admin/zone/${editId}`, payload);
        setEditId(null);
      } else {
        await API.post("/admin/zone/create", payload);
      }

      setForm({
        name: "",
        lat: "",
        lng: "",
        radius: "",
      });

      fetchZones();
    } catch (err) {
      console.log(err);
    }
  };

  // ✏️ EDIT
  const handleEdit = (zone) => {
    setForm({
      name: zone.name,
      lat: String(zone.center?.lat || ""),
      lng: String(zone.center?.lng || ""),
      radius: String(zone.radius),
    });

    setEditId(zone._id);
  };

  // 🗑 DELETE
  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/zone/${id}`);
      fetchZones();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔄 TOGGLE STATUS
  const toggleStatus = async (id) => {
    try {
      await API.put(`/admin/zone/toggle/${id}`);
      fetchZones();
    } catch (err) {
      console.log(err);
    }
  };

  // ❌ CANCEL EDIT
  const cancelEdit = () => {
    setEditId(null);
    setForm({
      name: "",
      lat: "",
      lng: "",
      radius: "",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* HEADER */}
        <Text style={styles.header}>📍 Delivery Zones</Text>
        <Text style={styles.subtitle}>Define coordinates and radial ranges for active delivery zones</Text>

        {/* FORM */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>
            {editId ? "Edit Zone Details ✏️" : "Create New Delivery Zone ➕"}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Zone Name</Text>
            <TextInput
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              style={styles.input}
              placeholder="e.g. Sikar North"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Center Latitude</Text>
              <TextInput
                value={form.lat}
                keyboardType="numeric"
                onChangeText={(t) => setForm({ ...form, lat: t })}
                style={styles.input}
                placeholder="27.6094"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Center Longitude</Text>
              <TextInput
                value={form.lng}
                keyboardType="numeric"
                onChangeText={(t) => setForm({ ...form, lng: t })}
                style={styles.input}
                placeholder="75.1399"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Delivery Radius (KM)</Text>
            <TextInput
              value={form.radius}
              keyboardType="numeric"
              onChangeText={(t) => setForm({ ...form, radius: t })}
              style={styles.input}
              placeholder="15"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnText}>
              {editId ? "Update Zone" : "Create Zone"}
            </Text>
          </TouchableOpacity>

          {editId && (
            <TouchableOpacity onPress={cancelEdit} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ZONES LIST */}
        <FlatList
          data={zones}
          scrollEnabled={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.zoneCard}>
              <View style={styles.zoneHeader}>
                <Text style={styles.zoneName}>{item.name}</Text>
                <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                  <Text style={[styles.statusText, item.isActive ? styles.activeText : styles.inactiveText]}>
                    {item.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>

              <View style={styles.gridContainer}>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>COORDINATES</Text>
                  <Text style={styles.gridValue}>
                    {item.center?.lat?.toFixed(4)}, {item.center?.lng?.toFixed(4)}
                  </Text>
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>RADIUS LIMIT</Text>
                  <Text style={styles.gridValue}>
                    {item.radius} KM
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
                  <Text style={[styles.actionText, styles.editColor]}>✏️ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleStatus(item._id)}>
                  <Text style={[styles.actionText, styles.toggleColor]}>
                    {item.isActive ? "⏸️ Deactivate" : "▶️ Activate"}
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

export default Zones;

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
  rowInputs: {
    flexDirection: "row",
    gap: 12,
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
  btn: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
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
  zoneCard: {
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
  zoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  zoneName: {
    fontSize: 16,
    fontWeight: "750",
    color: "#0f172a",
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
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
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