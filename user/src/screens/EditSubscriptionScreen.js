import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import axios from "axios";

import { BASE_URL } from "../config";

const EditSubscriptionScreen = ({
  route,
  navigation,
}) => {
  const { subscription } =
    route.params;

  const [type, setType] =
    useState(subscription.type);

  const [
    selectedDays,
    setSelectedDays,
  ] = useState(
    subscription.days || []
  );

  const [
    selectedDates,
    setSelectedDates,
  ] = useState(
    subscription.dates || []
  );

  const [qty, setQty] =
    useState(
      subscription.quantity || 1
    );

  const [address] = useState(
    subscription.address
  );

  /* 🌅 DELIVERY TIME */
  const [
    deliveryTime,
    setDeliveryTime,
  ] = useState(
    subscription.deliveryTime ||
      "morning"
  );

  const [loading, setLoading] =
    useState(false);

  const daysList = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  /* 🔁 TOGGLE DAY */
  const toggleDay = (day) => {
    const d = day.toLowerCase();

    setSelectedDays((prev) =>
      prev.includes(d)
        ? prev.filter(
            (i) => i !== d
          )
        : [...prev, d]
    );
  };

  /* 📆 TOGGLE DATE */
  const toggleDate = (date) => {
    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter(
            (d) => d !== date
          )
        : [...prev, date]
    );
  };

  /* 🚀 UPDATE */
  const handleUpdate =
    async () => {
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

      if (
        ![
          "morning",
          "evening",
        ].includes(
          deliveryTime
        )
      ) {
        return alert(
          "Select delivery time"
        );
      }

      try {
        setLoading(true);

        const payload = {
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

          address,

          deliveryTime,
        };

        await axios.put(
          `${BASE_URL}/api/v1/subscription/update/${subscription._id}`,
          payload,
          {
            withCredentials: true,
          }
        );

        alert(
          "Updated successfully ✅"
        );

        navigation.goBack();
      } catch (err) {
        console.log(
          err.response?.data ||
            err.message
        );

        alert("Update failed ❌");
      } finally {
        setLoading(false);
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
            Edit Subscription ✏️
          </Text>

          {/* TYPE */}
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

          {/* DAYS */}
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

          {/* DATES */}
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

          {/* 🌅 DELIVERY TIME */}
          <Text
            style={[
              styles.label,
              {
                marginTop: 25,
              },
            ]}
          >
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

          {/* QTY */}
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
                style={
                  styles.qtyText
                }
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
                color: "#555",
              }}
            >
              {address?.text}
            </Text>
          </View>
        </ScrollView>

        {/* BUTTON */}
        <View
          style={styles.bottomBar}
        >
          <TouchableOpacity
            style={styles.btn}
            onPress={
              handleUpdate
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={styles.btnText}
              >
                Update Subscription
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditSubscriptionScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
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
    marginBottom: 16,
  },

  switchRow: {
    flexDirection: "row",
    marginBottom: 15,
  },

  switchBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#eee",
    marginRight: 5,
    borderRadius: 10,
    alignItems: "center",
  },

  active: {
    backgroundColor: "#0cbb69",
  },

  activeText: {
    color: "#fff",
    fontWeight: "700",
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 10,
  },

  chipActive: {
    backgroundColor: "#0cbb69",
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
    backgroundColor: "#eee",
    borderRadius: 8,
    alignItems: "center",
  },

  qtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },

  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  qtyBtn: {
    backgroundColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 16,
  },

  qtyText: {
    fontWeight: "700",
    fontSize: 16,
  },

  label: {
    fontWeight: "700",
  },

  addressBox: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 12,
    paddingBottom: 18,
    backgroundColor: "#fff",
    elevation: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  btn: {
    backgroundColor: "#0cbb69",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});