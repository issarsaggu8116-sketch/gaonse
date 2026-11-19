import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";

const Profile = ({ navigation }) => {
  const { admin, logout } = useContext(AuthContext);

  const menu = [
    { title: "📍 Manage Zones", screen: "Zones", subtitle: "Define delivery radiuses and zone coordinates" },
    { title: "🛒 Manage Products", screen: "Products", subtitle: "Configure price, discounts, and inventory limits" },
    { title: "📦 Manage Categories", screen: "Category", subtitle: "Set category names and subscription rules" },
    { title: "🚚 Delivery Partners", screen: "Delivery", subtitle: "Register partners and monitor sales reports" },
    { title: "⚙️ Settings", screen: "Settings", subtitle: "Adjust timing thresholds and order deadlines" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const getAdminInitial = () => {
    if (!admin?.name) return "A";
    return admin.name.charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* HEADER */}
        <Text style={styles.header}>Control Center 👨‍💼</Text>
        <Text style={styles.subHeader}>
          Manage your entire dairy distribution network and system parameters
        </Text>

        {/* 👤 ADMIN INFO CARD */}
        <View style={styles.infoCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getAdminInitial()}</Text>
          </View>
          <View style={styles.adminDetails}>
            <Text style={styles.adminName}>{admin?.name || "Admin"}</Text>
            <Text style={styles.adminEmail}>{admin?.email}</Text>
            <View style={styles.cityBadge}>
              <Text style={styles.cityBadgeText}>
                📍 {admin?.city?.name || "All Cities"}
              </Text>
            </View>
          </View>
        </View>

        {/* MENU */}
        <View style={styles.menuContainer}>
          {menu.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItemCard}
              onPress={() => {
                try {
                  navigation.navigate(item.screen);
                } catch (err) {
                  console.log("Navigation Error:", err.message);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSub}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>&gt;</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🚪 LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

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
  subHeader: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#4f46e5",
  },
  adminDetails: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  adminEmail: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  cityBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  cityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItemCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemContent: {
    flex: 1,
    paddingRight: 16,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  menuItemSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 3,
  },
  chevron: {
    fontSize: 16,
    color: "#94a3b8",
    fontWeight: "bold",
  },
  logoutBtn: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutBtnText: {
    color: "#ef4444",
    fontWeight: "800",
    fontSize: 15,
  },
});