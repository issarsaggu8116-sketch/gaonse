import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

import { BASE_URL } from "../config";

const SubscriptionListScreen = ({
  navigation,
}) => {

  const [subs, setSubs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  /* ---------------------------------- */
  /* 🔄 FETCH SUBSCRIPTIONS */
  /* ---------------------------------- */
  const fetchSubs = async () => {
    try {

      setLoading(true);

      const { data } = await axios.get(
        `${BASE_URL}/api/v1/subscription/me`,
        {
          withCredentials: true,
        }
      );

      setSubs(
        data.subscriptions || []
      );

    } catch (err) {

      console.log(err.message);

      Alert.alert(
        "Error",
        "Failed to load subscriptions"
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    const unsubscribe =
      navigation.addListener(
        "focus",
        fetchSubs
      );

    return unsubscribe;

  }, [navigation]);

  useEffect(() => {
    fetchSubs();
  }, []);

  /* ---------------------------------- */
  /* 🗑️ DELETE */
  /* ---------------------------------- */
  const deleteSubscription = async (
    id
  ) => {
    try {

      await axios.delete(
        `${BASE_URL}/api/v1/subscription/delete/${id}`,
        {
          withCredentials: true,
        }
      );

      Alert.alert(
        "Deleted",
        "Subscription removed 🗑️"
      );

      fetchSubs();

    } catch (err) {

      console.log(
        err.response?.data ||
        err.message
      );

      Alert.alert(
        "Error",
        "Delete failed"
      );

    }
  };

  /* ---------------------------------- */
  /* 🎯 ON PRESS ITEM */
  /* ---------------------------------- */
  const handlePress = (item) => {

    Alert.alert(
      "Manage Subscription",
      "Choose an action",
      [
        {
          text: "Edit ✏️",

          onPress: () =>
            navigation.navigate(
              "EditSubscriptionScreen",
              {
                subscription: item,
              }
            ),
        },

        {
          text: "Delete 🗑️",

          style: "destructive",

          onPress: () =>
            deleteSubscription(
              item._id
            ),
        },

        {
          text: "Cancel",

          style: "cancel",
        },
      ]
    );
  };

  /* ---------------------------------- */
  /* 🌅 FORMAT DELIVERY TIME */
  /* ---------------------------------- */
  const formatDeliveryTime = (
    time
  ) => {

    if (time === "morning") {
      return "🌅 Morning";
    }

    if (time === "evening") {
      return "🌙 Evening";
    }

    return "Not Selected";
  };

  /* ---------------------------------- */
  /* 🧾 RENDER ITEM */
  /* ---------------------------------- */
  const renderItem = ({
    item,
  }) => {

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          handlePress(item)
        }
      >

        {/* PRODUCT NAME */}
        <Text style={styles.name}>
          {item.product?.name ||
            item.name}
        </Text>

        {/* TYPE */}
        <Text style={styles.meta}>
          Type: {item.type}
        </Text>

        {/* DAYS */}
        {item.type === "days" && (
          <Text style={styles.meta}>
            Days:
            {" "}
            {item.days.join(", ")}
          </Text>
        )}

        {/* DATES */}
        {item.type === "dates" && (
          <Text style={styles.meta}>
            Dates:
            {" "}
            {item.dates.join(", ")}
          </Text>
        )}

        {/* QUANTITY */}
        <Text style={styles.meta}>
          Qty: {item.quantity}
        </Text>

        {/* 🌅 DELIVERY TIME */}
        <Text style={styles.meta}>
          Delivery:
          {" "}
          {formatDeliveryTime(
            item.deliveryTime
          )}
        </Text>

        {/* ADDRESS */}
        <Text style={styles.meta}>
          📍 {item.address?.text}
        </Text>

        {/* STATUS */}
        <Text
          style={[
            styles.meta,
            {
              color:
                item.status ===
                "active"
                  ? "green"
                  : "orange",

              fontWeight: "700",
            },
          ]}
        >
          Status:
          {" "}
          {item.status}
        </Text>

      </TouchableOpacity>
    );
  };

  /* ---------------------------------- */
  /* ⏳ LOADING */
  /* ---------------------------------- */
  if (loading) {

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  /* ---------------------------------- */
  /* 😴 EMPTY */
  /* ---------------------------------- */
  if (subs.length === 0) {

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text>
            No subscriptions yet 😴
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ---------------------------------- */
  /* 📱 SCREEN */
  /* ---------------------------------- */
  return (
    <SafeAreaView
      style={styles.safeArea}
    >

      <View style={styles.container}>

        <Text style={styles.heading}>
          My Subscriptions 🔁
        </Text>

        <FlatList
          data={subs}
          keyExtractor={(item) =>
            item._id
          }
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 40,
            paddingTop: 5,
          }}
          showsVerticalScrollIndicator={false}
        />

      </View>

    </SafeAreaView>
  );
};

export default SubscriptionListScreen;

/* ---------------------------------- */
/* 🎨 STYLES */
/* ---------------------------------- */
const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },

  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: "#f9f9f9",
  },

  heading: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 15,
    marginTop: 5,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
  },

  meta: {
    marginTop: 5,
    color: "#555",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

});