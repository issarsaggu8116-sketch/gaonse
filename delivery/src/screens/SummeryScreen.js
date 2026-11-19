import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import API from "../api/api";

export default function SummaryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("loading"); // "loading" or "completed"
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getLocalYYYYMMDD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getReadableDate = (date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dateNum = date.getDate();
    const year = date.getFullYear();
    
    return `${dayName}, ${monthName} ${dateNum}, ${year}`;
  };

  const fetchSummary = async () => {
    try {
      let url = "/delivery/today-orders/summary";
      if (activeTab === "completed") {
        const dateStr = getLocalYYYYMMDD(selectedDate);
        url += `?mode=completed&date=${dateStr}`;
      }
      const res = await API.get(url);
      setData(res.data);
    } catch (err) {
      console.log("FETCH SUMMARY ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate]);

  useEffect(() => {
    if (!navigation) return;
    const unsubscribe = navigation.addListener("focus", () => {
      fetchSummary();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, activeTab, selectedDate]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleResetToToday = () => {
    setSelectedDate(new Date());
  };

  const isTodaySelected = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        {/* Title */}
        <Text style={styles.screenTitle}>📊 Summary Dashboard</Text>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "loading" ? styles.activeTab : styles.inactiveTab]}
            onPress={() => {
              setActiveTab("loading");
              setLoading(true);
            }}
          >
            <Text style={[styles.tabText, activeTab === "loading" ? styles.activeTabText : styles.inactiveTabText]}>
              📦 Loading List
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "completed" ? styles.activeTab : styles.inactiveTab]}
            onPress={() => {
              setActiveTab("completed");
              setLoading(true);
            }}
          >
            <Text style={[styles.tabText, activeTab === "completed" ? styles.activeTabText : styles.inactiveTabText]}>
              ✅ Completed Sales
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Selector Navigation (only for Completed Sales) */}
        {activeTab === "completed" && (
          <View style={styles.dateSelectorCard}>
            <View style={styles.dateSelectorRow}>
              <TouchableOpacity onPress={handlePrevDay} style={styles.arrowButton}>
                <Text style={styles.arrowText}>◀</Text>
              </TouchableOpacity>
              
              <Text style={styles.dateText}>{getReadableDate(selectedDate)}</Text>

              <TouchableOpacity onPress={handleNextDay} style={styles.arrowButton}>
                <Text style={styles.arrowText}>▶</Text>
              </TouchableOpacity>
            </View>

            {!isTodaySelected() && (
              <TouchableOpacity onPress={handleResetToToday} style={styles.todayBtn}>
                <Text style={styles.todayBtnText}>Back to Today</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Loading Indicator inside Header component so list background remains interactive */}
        {loading ? (
          <View style={styles.innerLoader}>
            <ActivityIndicator size="large" color="#0cbb69" />
          </View>
        ) : (
          <>
            {/* Overview Stats Cards */}
            <View style={styles.statsContainer}>
              {/* Total Orders Card */}
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>
                  {activeTab === "loading" ? "Pending Orders" : "Total Delivered"}
                </Text>
                <Text style={styles.statValue}>{data?.totalOrders || 0}</Text>
              </View>

              {/* Total Amount Card */}
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>
                  {activeTab === "loading" ? "Pending Value" : "Total Revenue"}
                </Text>
                <Text style={[styles.statValue, styles.amountText]}>₹{data?.totalAmount || 0}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              {activeTab === "loading" ? "📦 Loading Item Breakdown" : "🥛 Completed Sales Breakdown"}
            </Text>
          </>
        )}
      </View>
    );
  };

  const renderSummaryItem = ({ item }) => {
    return (
      <View style={styles.itemCard}>
        <Text style={styles.itemName}>🧺 {item.name}</Text>
        
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Total Qty:</Text>
          <Text style={styles.breakdownValue}>{item.totalQty}</Text>
        </View>

        <View style={styles.breakdownSubRow}>
          <Text style={styles.subLabel}>📦 Normal Orders Qty:</Text>
          <Text style={styles.subValue}>{item.normalQty || 0}</Text>
        </View>

        <View style={styles.breakdownSubRow}>
          <Text style={styles.subLabel}>🔁 Subscriptions Qty:</Text>
          <Text style={styles.subValue}>{item.subscriptionQty || 0}</Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Total Value:</Text>
          <Text style={styles.amountValue}>₹ {item.totalAmount}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={loading ? [] : (data?.itemsSummary || [])}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderSummaryItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === "loading"
                  ? "No pending orders to deliver today 🌙"
                  : "No sales recorded on this day 🌙"}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0cbb69"]} />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  listContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    padding: 15,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#0cbb69",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
  },
  activeTabText: {
    color: "#fff",
  },
  inactiveTabText: {
    color: "#64748b",
  },
  dateSelectorCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  dateSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  arrowButton: {
    padding: 10,
    width: 44,
    alignItems: "center",
  },
  arrowText: {
    fontSize: 16,
    color: "#0cbb69",
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  todayBtn: {
    marginTop: 10,
    backgroundColor: "#f0fdf4",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  todayBtnText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "700",
  },
  innerLoader: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  amountText: {
    color: "#166534",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    marginTop: 5,
  },
  itemCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
    paddingBottom: 6,
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  breakdownValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "700",
  },
  breakdownSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  subLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  subValue: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
  amountLabel: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 15,
    color: "#166534",
    fontWeight: "800",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});