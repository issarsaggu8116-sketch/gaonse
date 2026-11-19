import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import API from "../api/api";

export default function KhataScreen() {
  const [summary, setSummary] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchKhata = async () => {
    try {
      const res = await API.get("/delivery/khata/summary");
      if (res.data.success) {
        setSummary(res.data.summary || []);
        setGrandTotal(res.data.grandTotal || 0);
      }
    } catch (err) {
      console.log("Error fetching khata summary:", err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKhata();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchKhata();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f6f6f6" }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ padding: 20 }}>
        {/* HEADER */}
        <Text style={{ fontSize: 26, fontWeight: "800", marginBottom: 20 }}>
          📓 Khata Book
        </Text>

        {/* GRAND TOTAL INCOME CARD */}
        <View
          style={{
            backgroundColor: "#1b5e20",
            padding: 20,
            borderRadius: 14,
            marginBottom: 25,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
        >
          <Text style={{ color: "#a5d6a7", fontSize: 14, fontWeight: "600", textTransform: "uppercase" }}>
            Grand Total Income
          </Text>
          <Text style={{ color: "#fff", fontSize: 36, fontWeight: "bold", marginTop: 5 }}>
            ₹ {grandTotal}
          </Text>
        </View>

        {/* ITEMS LIST TITLE */}
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 15, color: "#333" }}>
          📦 Sales Summary
        </Text>

        {/* LIST OF SALES */}
        {summary.length === 0 ? (
          <View style={{ backgroundColor: "#fff", padding: 25, borderRadius: 12, alignItems: "center" }}>
            <Text style={{ color: "#777", fontSize: 16 }}>No sales recorded yet 🌙</Text>
          </View>
        ) : (
          <FlatList
            data={summary}
            keyExtractor={(item) => item.itemName}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#222" }}>
                    🥛 {item.itemName}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
                    Sales: {item.totalQty} units
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#2e7d32" }}>
                    ₹ {item.totalIncome}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                    Total Income
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}
