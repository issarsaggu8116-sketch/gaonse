import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../services/api";

const Products = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    discount: "",
    img_url: "",
    stock: "",
    category: "",
  });

  const [editId, setEditId] = useState(null);

  // 📡 FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);
      const c = await API.get("/admin/category");
      const p = await API.get("/admin/product");

      setCategories(c.data.categories || []);
      setProducts(p.data.products || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ➕ CREATE / UPDATE PRODUCT
  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.price ||
      !form.stock ||
      !form.category
    ) {
      return;
    }

    const payload = {
      name: form.name,
      price: Number(form.price),
      discount: Number(form.discount || 0),
      img_url: form.img_url,
      stock: Number(form.stock),
      category: form.category,
    };

    try {
      if (editId) {
        await API.put(`/admin/product/${editId}`, payload);
        setEditId(null);
      } else {
        await API.post("/admin/product/create", payload);
      }

      setForm({
        name: "",
        price: "",
        discount: "",
        img_url: "",
        stock: "",
        category: "",
      });

      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // ✏️ EDIT PRODUCT
  const handleEdit = (p) => {
    setForm({
      name: p.name,
      price: String(p.price),
      discount: String(p.discount || 0),
      img_url: p.img_url || "",
      stock: String(p.stockLimit),
      category: p.category?._id,
    });

    setEditId(p._id);
  };

  // 🗑 DELETE PRODUCT
  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/product/${id}`);
      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔄 TOGGLE STATUS
  const toggleActive = async (p) => {
    try {
      await API.put(`/admin/product/toggle/${p._id}`);
      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>🛒 Products</Text>
        <Text style={styles.subtitle}>Add and manage products in the storefront catalog</Text>

        {/* FORM */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>
            {editId ? "Edit Product ✏️" : "Create New Product ➕"}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Product Name</Text>
            <TextInput
              placeholder="e.g. Standard Cow Milk 1L"
              placeholderTextColor="#94a3b8"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              style={styles.input}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>MRP (₹)</Text>
              <TextInput
                placeholder="80"
                placeholderTextColor="#94a3b8"
                value={form.price}
                keyboardType="numeric"
                onChangeText={(t) => setForm({ ...form, price: t })}
                style={styles.input}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Discount (%)</Text>
              <TextInput
                placeholder="5"
                placeholderTextColor="#94a3b8"
                value={form.discount}
                keyboardType="numeric"
                onChangeText={(t) => setForm({ ...form, discount: t })}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Stock Limit (Units)</Text>
            <TextInput
              placeholder="150"
              placeholderTextColor="#94a3b8"
              value={form.stock}
              keyboardType="numeric"
              onChangeText={(t) => setForm({ ...form, stock: t })}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Image URL</Text>
            <TextInput
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#94a3b8"
              value={form.img_url}
              onChangeText={(t) => setForm({ ...form, img_url: t })}
              style={styles.input}
            />
          </View>

          {form.img_url ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: form.img_url }} style={styles.imagePreview} />
            </View>
          ) : null}

          <Text style={[styles.inputLabel, { marginBottom: 8 }]}>Select Category</Text>
          <View style={styles.categoryChipsContainer}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c._id}
                onPress={() => setForm({ ...form, category: c._id })}
                style={[
                  styles.categoryChip,
                  form.category === c._id && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    form.category === c._id && styles.categoryChipTextActive,
                  ]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {form.category ? (
            <View style={styles.subPolicyContainer}>
              <Text style={styles.subPolicyText}>
                Subscription Policy:{" "}
                <Text style={styles.subPolicyBold}>
                  {categories.find((c) => c._id === form.category)?.isSubscriptionAllowed
                    ? "Allowed 🔄"
                    : "Not Allowed 🚫"}
                </Text>
              </Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnText}>
              {editId ? "Update Product" : "Save Product"}
            </Text>
          </TouchableOpacity>

          {editId ? (
            <TouchableOpacity
              onPress={() => {
                setEditId(null);
                setForm({
                  name: "",
                  price: "",
                  discount: "",
                  img_url: "",
                  stock: "",
                  category: "",
                });
              }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* PRODUCTS LIST */}
        {loading ? (
          <ActivityIndicator color="#4f46e5" size="large" style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            data={products}
            scrollEnabled={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const sellingPrice =
                item.price - (item.price * (item.discount || 0)) / 100;

              return (
                <View style={styles.productCard}>
                  {item.img_url ? (
                    <View style={styles.productImageWrapper}>
                      <Image
                        source={{ uri: item.img_url }}
                        style={styles.productCardImage}
                        resizeMode="cover"
                      />
                      {item.discount > 0 ? (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountBadgeText}>
                            {item.discount}% OFF
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  <View style={styles.productCardContent}>
                    <Text style={styles.productCardName}>{item.name}</Text>
                    <Text style={styles.productCardCategory}>
                      Category: {item.category?.name || "N/A"}
                    </Text>

                    <View style={styles.pricesRow}>
                      <Text style={styles.sellingPriceText}>
                        ₹{sellingPrice.toFixed(2)}
                      </Text>
                      {item.discount > 0 ? (
                        <Text style={styles.mrpText}>₹{item.price}</Text>
                      ) : null}
                    </View>

                    <View style={styles.stockStatusContainer}>
                      <Text style={styles.stockStatusLabel}>
                        Available Stock:{" "}
                        <Text style={styles.stockStatusValue}>
                          {item.currentStock} / {item.stockLimit}
                        </Text>
                      </Text>
                    </View>

                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          item.isActive ? styles.activeBadge : styles.inactiveBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            item.isActive ? styles.activeBadgeText : styles.inactiveBadgeText,
                          ]}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </Text>
                      </View>

                      {item.category?.isSubscriptionAllowed ? (
                        <View style={styles.subscriptionBadge}>
                          <Text style={styles.subscriptionBadgeText}>🔄 Subs Allowed</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
                        <Text style={[styles.actionText, styles.editColor]}>✏️ Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.actionBtn} onPress={() => toggleActive(item)}>
                        <Text style={[styles.actionText, styles.toggleColor]}>
                          {item.isActive ? "⏸️ Deactivate" : "▶️ Activate"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
                        <Text style={[styles.actionText, styles.deleteColor]}>🗑️ Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Products;

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
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  imagePreview: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  categoryChipActive: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  categoryChipText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#ffffff",
  },
  subPolicyContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  subPolicyText: {
    fontSize: 13,
    color: "#475569",
  },
  subPolicyBold: {
    fontWeight: "700",
    color: "#0f172a",
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
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  productImageWrapper: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  productCardImage: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  productCardContent: {
    padding: 18,
  },
  productCardName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  productCardCategory: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  pricesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  sellingPriceText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#10b981",
  },
  mrpText: {
    fontSize: 14,
    color: "#94a3b8",
    textDecorationLine: "line-through",
  },
  stockStatusContainer: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 12,
  },
  stockStatusLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  stockStatusValue: {
    fontWeight: "700",
    color: "#0f172a",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  activeBadge: {
    backgroundColor: "#ecfdf5",
    borderColor: "#d1fae5",
  },
  activeBadgeText: {
    color: "#10b981",
  },
  inactiveBadge: {
    backgroundColor: "#fef2f2",
    borderColor: "#fee2e2",
  },
  inactiveBadgeText: {
    color: "#ef4444",
  },
  subscriptionBadge: {
    backgroundColor: "#eff6ff",
    borderWidth: 0.5,
    borderColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subscriptionBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3b82f6",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 14,
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
    fontWeight: "750",
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