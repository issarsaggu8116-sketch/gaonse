import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Context } from "../context/AppContext";
import styles from "../styles/ProfileStyles";
import { BASE_URL } from "../config";

const Profile = ({ navigation }) => {
  const { setIsAuthenticated, setUser } = useContext(Context);

  const [userData, setUserData] = useState(null);

  // 🔄 Fetch User Data
  const fetchUser = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/v1/user/me`,
        {
          withCredentials: true,
        }
      );

      setUserData(data.user);
    } catch (error) {
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message || "User fetch failed",
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 🚪 Logout
  const logout = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/v1/user/logout`,
        {
          withCredentials: true,
        }
      );

      // 🧹 CLEAR STORAGE
      await AsyncStorage.removeItem("isAuthenticated");
      await AsyncStorage.removeItem("user");

      Toast.show({ type: "success", text1: res.data.message });

      setUser(null);
      setIsAuthenticated(false);

      navigation.replace("Auth");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message || "Logout failed",
      });
    }
  };

  // 🔹 Reusable Menu Item
  const MenuItem = ({ title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.back}>←</Text>
        <Text style={styles.title}>My Profile</Text>

        {/* LOGOUT */}
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutIcon}>⎋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* 👤 USER INFO CARD */}
        <View style={styles.card}>
          {userData ? (
            <>
              <Text style={styles.cardTitle}>{userData.name}</Text>
              <Text style={styles.cardSub}>{userData.email}</Text>
              <Text style={styles.cardSub}>{userData.phone}</Text>
            </>
          ) : (
            <Text>Loading...</Text>
          )}
        </View>

        {/* MENU */}
        <MenuItem
          title="My Orders"
          subtitle="View & Manage your orders"
          onPress={() => navigation.navigate("Order")}
        />

        <MenuItem
          title="My Subscription"
          subtitle="View, Edit or Cancel your subscriptions"
          onPress={() => navigation.navigate("EditSubscription")}
        />

        {/* <MenuItem
          title="Vacation Mode"
          subtitle="Create or Manage your vacations"
          onPress={() => navigation.navigate("Calendar")}
        /> */}

        

        {/* <MenuItem
          title="My Addresses"
          subtitle="Manage your delivery locations"
          onPress={() => navigation.navigate("Address")}
        /> */}

        <MenuItem
          title="Help & Support"
          subtitle="Contact customer care"
          onPress={() => navigation.navigate("HelpSupport")}
        />

        <MenuItem
          title="Legal and About us"
          subtitle="Know more about GAON SE"
          onPress={() => navigation.navigate("LegalAbout")}
        />

        {/* <MenuItem
          title="My Promo Codes"
          subtitle="View Promo Codes"
        /> */}

      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;