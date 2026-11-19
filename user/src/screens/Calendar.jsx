import axios from "axios";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import styles from "../styles/CalendarStyles";
import { BASE_URL } from "../config";

const Calendar = ({ route, navigation }) => {
  const { product } = route.params;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [selectedDates, setSelectedDates] = useState([]);

  const days = ["M", "T", "W", "T", "F", "S", "S"];

  // 📅 Generate real dates of current month
  const getDaysInMonth = () => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    let blanks = firstDay === 0 ? 6 : firstDay - 1; // adjust Monday start

    const datesArray = [];

    for (let i = 0; i < blanks; i++) {
      datesArray.push("");
    }

    for (let d = 1; d <= totalDays; d++) {
      datesArray.push(d.toString());
    }

    return datesArray;
  };

  const dates = getDaysInMonth();

  // 📌 Select / Unselect date
  const toggleDate = (day) => {
    const formattedDate = `${day}-${currentMonth + 1}-${currentYear}`;

    if (selectedDates.includes(formattedDate)) {
      setSelectedDates(selectedDates.filter((d) => d !== formattedDate));
    } else {
      setSelectedDates([...selectedDates, formattedDate]);
    }
  };

  // 🚀 Create Subscription
  const handleSubscribe = async () => {
    if (selectedDates.length === 0) {
      return Alert.alert("Select at least one date");
    }

    try {
      await axios.post(
        `${BASE_URL}/api/v1/subscription/create`,
        {
          product: product._id,
          selectedDates,
        },
        {
          withCredentials: true,
        }
      );

      Toast.show({
        type: "success",
        text1: "Subscription created",
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message || "Subscription failed",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{product.name}</Text>
      </View>

      {/* MONTH */}
      <View style={styles.monthRow}>
        <Text style={styles.month}>
          {today.toLocaleString("default", { month: "long" })} {currentYear}
        </Text>
      </View>

      {/* DAYS */}
      <View style={styles.daysRow}>
        {days.map((d, i) => (
          <Text key={i} style={styles.dayText}>{d}</Text>
        ))}
      </View>

      {/* GRID */}
      <View style={styles.grid}>
        {dates.map((d, i) => {
          const formattedDate = `${d}-${currentMonth + 1}-${currentYear}`;
          const isSelected = selectedDates.includes(formattedDate);

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.dateBox,
                isSelected && { backgroundColor: "#7a4b00" },
              ]}
              onPress={() => d && toggleDate(d)}
            >
              <Text
                style={[
                  styles.dateText,
                  isSelected && { color: "#fff" },
                ]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* SELECTED COUNT */}
      <View style={styles.dateCard}>
        <Text style={styles.dateCardText}>
          Selected: {selectedDates.length} days
        </Text>
      </View>

      {/* SUBMIT BUTTON */}
      <TouchableOpacity
        style={{
          backgroundColor: "#7a4b00",
          margin: 20,
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
        }}
        onPress={handleSubscribe}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Subscribe Now
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

export default Calendar;