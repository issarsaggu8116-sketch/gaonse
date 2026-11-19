import React, {
  useState,
  useEffect,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import axios from "axios";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { BASE_URL } from "../config";

const ADDRESS_KEY =
  "SELECTED_ADDRESS";

const SubscriptionScreen = ({
  route,
  navigation,
}) => {
  const { product } =
    route.params;

  const [type, setType] =
    useState("days");

  const [
    selectedDays,
    setSelectedDays,
  ] = useState([]);

  const [
    selectedDates,
    setSelectedDates,
  ] = useState([]);

  const [qty, setQty] =
    useState(1);

  /* 🌅 DELIVERY TIME */
  const [
    deliveryTime,
    setDeliveryTime,
  ] = useState("morning");

  const [address, setAddress] =
    useState(null);

  const daysList = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  // ✅ LOAD ADDRESS
  const loadAddress =
    async () => {
      const data =
        await AsyncStorage.getItem(
          ADDRESS_KEY
        );

      const parsed = data
        ? JSON.parse(data)
        : null;

      setAddress(parsed);
    };

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        "focus",
        loadAddress
      );

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadAddress();
  }, []);

  // 🔁 TOGGLE DAY
  const toggleDay = (day) => {
    const formattedDay =
      day.toLowerCase();

    setSelectedDays((prev) =>
      prev.includes(
        formattedDay
      )
        ? prev.filter(
            (d) =>
              d !== formattedDay
          )
        : [
            ...prev,
            formattedDay,
          ]
    );
  };

  // 📆 TOGGLE DATE
  const toggleDate = (date) => {
    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter(
            (d) => d !== date
          )
        : [...prev, date]
    );
  };

  // 🚀 SUBMIT
  const handleSubscribe =
    async () => {
      if (!address)
        return alert(
          "Please select address 📍"
        );

      if (
        !address.zone ||
        !address.city
      ) {
        return alert(
          "Address missing zone/city ❌"
        );
      }

      if (
        type === "days" &&
        selectedDays.length === 0
      ) {
        return alert(
          "Select at least one day"
        );
      }

      if (
        type === "dates" &&
        selectedDates.length === 0
      ) {
        return alert(
          "Select at least one date"
        );
      }

      try {
        const payload = {
          product: product._id,

          name: product.name,

          type,

          days:
            type === "days"
              ? selectedDays
              : [],

          dates:
            type === "dates"
              ? selectedDates
              : [],

          quantity: qty,

          deliveryTime,

          address,
        };

        await axios.post(
          `${BASE_URL}/api/v1/subscription/create`,
          payload,
          {
            withCredentials: true,
          }
        );

        alert(
          "Subscription started 🎉"
        );

        navigation.goBack();
      } catch (err) {
        console.log(
          "ERROR:",
          err.response?.data ||
            err.message
        );

        alert(
          err.response?.data
            ?.message ||
            "Failed to subscribe ❌"
        );
      }
    };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View style={styles.main}>
        <ScrollView
          contentContainerStyle={
            styles.container
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <Text style={styles.title}>
            Subscribe 🔁
          </Text>

          {/* PRODUCT */}
          <View style={styles.card}>
            <Text
              style={styles.product}
            >
              {product.name}
            </Text>

            <Text
              style={styles.price}
            >
              ₹{product.price}
            </Text>
          </View>

          {/* TYPE SWITCH */}
          <View
            style={styles.switchRow}
          >
            <TouchableOpacity
              style={[
                styles.switchBtn,
                type === "days" &&
                  styles.active,
              ]}
              onPress={() =>
                setType("days")
              }
            >
              <Text
                style={
                  type === "days" &&
                  styles.activeText
                }
              >
                By Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.switchBtn,
                type === "dates" &&
                  styles.active,
              ]}
              onPress={() =>
                setType("dates")
              }
            >
              <Text
                style={
                  type === "dates" &&
                  styles.activeText
                }
              >
                By Dates
              </Text>
            </TouchableOpacity>
          </View>

          {/* 🌅 DELIVERY TIME */}
          <Text style={styles.label}>
            Delivery Time
          </Text>

          <View
            style={styles.switchRow}
          >
            <TouchableOpacity
              style={[
                styles.switchBtn,
                deliveryTime ===
                  "morning" &&
                  styles.active,
              ]}
              onPress={() =>
                setDeliveryTime(
                  "morning"
                )
              }
            >
              <Text
                style={
                  deliveryTime ===
                    "morning" &&
                  styles.activeText
                }
              >
                🌅 Morning
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.switchBtn,
                deliveryTime ===
                  "evening" &&
                  styles.active,
              ]}
              onPress={() =>
                setDeliveryTime(
                  "evening"
                )
              }
            >
              <Text
                style={
                  deliveryTime ===
                    "evening" &&
                  styles.activeText
                }
              >
                🌙 Evening
              </Text>
            </TouchableOpacity>
          </View>

          {/* DAYS UI */}
          {type === "days" && (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              data={daysList}
              keyExtractor={(
                item
              ) => item}
              style={{
                marginBottom: 10,
              }}
              renderItem={({
                item,
              }) => {
                const selected =
                  selectedDays.includes(
                    item.toLowerCase()
                  );

                return (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      selected &&
                        styles.chipActive,
                    ]}
                    onPress={() =>
                      toggleDay(item)
                    }
                  >
                    <Text
                      style={{
                        color:
                          selected
                            ? "#fff"
                            : "#000",
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* DATES UI */}
          {type === "dates" && (
            <View style={styles.grid}>
              {[
                ...Array(31),
              ].map((_, i) => {
                const date =
                  i + 1;

                const selected =
                  selectedDates.includes(
                    date
                  );

                return (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateBox,
                      selected &&
                        styles.chipActive,
                    ]}
                    onPress={() =>
                      toggleDate(
                        date
                      )
                    }
                  >
                    <Text
                      style={{
                        color:
                          selected
                            ? "#fff"
                            : "#000",
                      }}
                    >
                      {date}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* QUANTITY */}
          <View style={styles.qtyRow}>
            <Text
              style={styles.label}
            >
              Quantity
            </Text>

            <View
              style={styles.qtyBox}
            >
              <TouchableOpacity
                onPress={() =>
                  setQty(
                    qty > 1
                      ? qty - 1
                      : 1
                  )
                }
              >
                <Text
                  style={styles.qtyBtn}
                >
                  -
                </Text>
              </TouchableOpacity>

              <Text
                style={styles.qtyText}
              >
                {qty}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setQty(qty + 1)
                }
              >
                <Text
                  style={styles.qtyBtn}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ADDRESS */}
          <View
            style={styles.addressBox}
          >
            <Text
              style={styles.label}
            >
              Delivery Address
            </Text>

            <Text
              style={{
                marginTop: 5,
              }}
            >
              {address?.text ||
                "No address selected"}
            </Text>

            <TouchableOpacity
              style={
                styles.changeBtn
              }
              onPress={() =>
                navigation.navigate(
                  "Address"
                )
              }
            >
              <Text
                style={{
                  color: "#2196f3",
                  fontWeight:
                    "600",
                }}
              >
                Change Address
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* BUTTON */}
        <View
          style={styles.bottomBar}
        >
          <TouchableOpacity
            style={styles.btn}
            onPress={
              handleSubscribe
            }
          >
            <Text
              style={styles.btnText}
            >
              Start Subscription
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionScreen;

// 🎨 STYLES
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAE8C3",
  },

  main: {
    flex: 1,
  },

  container: {
    padding: 15,
    paddingTop: 10,
    paddingBottom: 120,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 14,
    color: "#4E342E",
  },

  card: {
    backgroundColor: "#FFFDF8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8DDD0",
  },

  product: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4E342E",
  },

  price: {
    marginTop: 5,
    color: "#6D4C41",
    fontWeight: "600",
  },

  switchRow: {
    flexDirection: "row",
    marginBottom: 15,
  },

  switchBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#E8DDD0",
    marginRight: 5,
    borderRadius: 10,
    alignItems: "center",
  },

  active: {
    backgroundColor: "#8D6E63",
  },

  activeText: {
    color: "#FFF8E1",
    fontWeight: "700",
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#E8DDD0",
    borderRadius: 20,
    marginRight: 10,
  },

  chipActive: {
    backgroundColor: "#8D6E63",
  },

  chipText: {
    color: "#5D4037",
    fontWeight: "600",
  },

  chipActiveText: {
    color: "#FFF8E1",
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  dateBox: {
    width: "13%",
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#E8DDD0",
    borderRadius: 8,
    alignItems: "center",
  },

  dateBoxActive: {
    backgroundColor: "#8D6E63",
  },

  dateText: {
    color: "#5D4037",
    fontWeight: "600",
  },

  dateTextActive: {
    color: "#FFF8E1",
  },

  qtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },

  label: {
    fontWeight: "700",
    marginBottom: 10,
    color: "#4E342E",
  },

  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },

  qtyBtn: {
    backgroundColor: "#A1887F",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  qtyBtnText: {
    color: "#FFF8E1",
    fontWeight: "700",
    fontSize: 18,
  },

  qtyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4E342E",
  },

  addressBox: {
    backgroundColor: "#FFFDF8",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E8DDD0",
  },

  changeBtn: {
    marginTop: 10,
  },

  changeBtnText: {
    color: "#8D6E63",
    fontWeight: "700",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFFDF8",
    padding: 12,
    paddingBottom: 18,
    elevation: 10,
    borderTopWidth: 1,
    borderColor: "#E8DDD0",
  },

  btn: {
    backgroundColor: "#8D6E63",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#FFF8E1",
    fontWeight: "700",
    fontSize: 16,
  },
});