import React, {
  useEffect,
} from "react";

import {
  View,
  Text,
} from "react-native";

import axios from "axios";

import Toast from "react-native-toast-message";

import { BASE_URL } from "../config";

const PaymentSuccess = ({
  route,
  navigation,
}) => {
  const {
    paymentData,
    amount,
  } = route.params;

  useEffect(() => {
    verify();
  }, []);

  const verify = async () => {
    try {
      const payload = {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        amount,
      };

      await axios.post(
        `${BASE_URL}/api/v1/wallet/verify-payment`,
        payload,
        {
          withCredentials: true,
        }
      );

      Toast.show({
        type: "success",
        text1: "Money Added Successfully",
      });

      navigation.navigate("Home", { screen: "Wallet" });
    } catch (error) {
      console.log("Payment verification error:", error?.message);

      Toast.show({
        type: "error",
        text1: "Verification Failed",
      });

      navigation.goBack();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent:
          "center",
        alignItems:
          "center",
      }}
    >
      <Text>
        Verifying Payment...
      </Text>
    </View>
  );
};

export default PaymentSuccess;