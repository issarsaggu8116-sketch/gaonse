import axios from "axios";
import React, { useState, useCallback } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";


import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import styles from "../styles/WalletStyles";
import { BASE_URL } from "../config";

const Wallet = ({ navigation }) => {
  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("100");
  const [payLoading, setPayLoading] = useState(false);

  /* =========================
     FETCH WALLET
  ========================= */
  const fetchWallet = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/v1/wallet/me`,
        { withCredentials: true }
      );
      setWallet(data.wallet);
    } catch {
      Toast.show({
        type: "error",
        text1: "Wallet fetch failed",
      });
    }
  }, []);

  /* =========================
     FETCH ORDERS
  ========================= */
  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/v1/order/me`,
        { withCredentials: true }
      );
      setOrders(data.orders || []);
    } catch (err) {
      console.log(err.message);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchWallet(), fetchOrders()]);
    setLoading(false);
  }, [fetchWallet, fetchOrders]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  /* =========================
     BALANCE LOGIC
  ========================= */
  const blockedAmount = orders
    .filter(
      (o) => o.status === "pending" || o.status === "approved"
    )
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const availableBalance =
    Number(wallet?.balance || 0) - blockedAmount;

  /* =========================
     PAYMENT FLOW (FIXED)
  ========================= */
  const handleAddMoney = async () => {
    try {
      const parsedAmount = Number(amount);
      if (!parsedAmount || parsedAmount < 10) {
        Toast.show({
          type: "error",
          text1: "Enter valid amount (minimum ₹10)",
        });
        return;
      }

      setPayLoading(true);

      // 1. Create Razorpay order
      const { data } = await axios.post(
        `${BASE_URL}/api/v1/wallet/create-order`,
        { amount: parsedAmount },
        { withCredentials: true }
      );

      const { orderId, key } = data;

      if (!orderId) {
        throw new Error("Order not created");
      }

      // 2. Navigate to RazorpayWebScreen for secure checkout WebView
      navigation.navigate("RazorpayWebScreen", {
        order: {
          id: orderId,
          amount: parsedAmount * 100, // in paise
        },
        amount: parsedAmount,
        razorpayKey: key,
      });
    } catch (err) {
      console.log("PAY ERROR:", err);
      Toast.show({
        type: "error",
        text1: "Payment failed",
      });
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Wallet</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        {/* BALANCE */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>

          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.balanceAmount}>
              ₹{availableBalance}
            </Text>
          )}

          {blockedAmount > 0 && (
            <Text style={{ marginTop: 8, color: "#777" }}>
              ₹{blockedAmount} reserved for orders
            </Text>
          )}
        </View>

        {/* RECHARGE SECTION */}
        <View style={styles.rechargeCard}>
          <Text style={styles.rechargeTitle}>
            💰 Add Money
          </Text>

          {/* QUICK AMOUNTS */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 15,
            }}
          >
            {[100, 200, 500, 1000].map((amt) => {
              const active = Number(amount) === amt;
              return (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setAmount(String(amt))}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderColor: active ? "#8D6E63" : "#E8DDD0",
                    backgroundColor: active ? "#8D6E63" : "#FFFDF8",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: active ? "#FFF8E1" : "#6D4C41", fontWeight: "600" }}>
                    ₹{amt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* INPUT */}
          <TextInput
            value={amount}
            keyboardType="numeric"
            onChangeText={(t) => setAmount(t)}
            style={{
              backgroundColor: "#FFFDF8",
              borderWidth: 1,
              borderColor: "#E8DDD0",
              color: "#4E342E",
              marginTop: 15,
              padding: 12,
              borderRadius: 8,
            }}
          />

          {/* BUTTON */}
          <TouchableOpacity
            style={[
              styles.addBtn,
              { marginTop: 15, opacity: payLoading ? 0.6 : 1 },
            ]}
            onPress={handleAddMoney}
            disabled={payLoading}
          >
            <Text style={{ fontWeight: "bold", color: "#5D4037" }}>
              {payLoading ? "Processing..." : `Pay ₹${amount}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TRANSACTIONS */}
        <View style={styles.transactionCard}>
          <Text style={{ fontWeight: "bold" }}>
            Transactions
          </Text>

          {wallet?.transactions?.length === 0 ? (
            <Text style={{ marginTop: 10 }}>
              No transactions yet
            </Text>
          ) : (
            wallet?.transactions?.map((tx, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 8,
                }}
              >
                <Text>
                  {tx.type === "credit"
                    ? "Added"
                    : "Deducted"}
                </Text>
                <Text>₹{tx.amount}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
     </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Wallet;