import React, {
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "../config";




const CART_KEY = "CART_ITEMS";
const ADDRESS_KEY = "SELECTED_ADDRESS";

const CartScreen = ({ navigation }) => {

  const [cart, setCart] = useState([]);
  const [selectedAddress, setSelectedAddress] =
    useState(null);

  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState([]);

  const [loadingWallet, setLoadingWallet] =
    useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  /* ===============================
     LOAD CART
  =============================== */
  const loadCart = async () => {
    const data = await AsyncStorage.getItem(
      CART_KEY
    );

    setCart(data ? JSON.parse(data) : []);
  };

  /* ===============================
     LOAD ADDRESS
  =============================== */
 const loadAddress = async () => {
  try {
    const data = await AsyncStorage.getItem(
      ADDRESS_KEY
    );

    setSelectedAddress(
      data ? JSON.parse(data) : null
    );

  } catch (err) {
    console.log(
      "ADDRESS LOAD ERROR:",
      err
    );
  }
};

  /* ===============================
     FETCH WALLET
  =============================== */
  const fetchWallet = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/v1/wallet/me`,
        { withCredentials: true }
      );

      setWallet(data.wallet);
    } catch (err) {
      console.log(
        "Wallet error:",
        err.message
      );
    }
  };

  /* ===============================
     FETCH ORDERS
  =============================== */
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/api/v1/order/me`,
        { withCredentials: true }
      );

      setOrders(data.orders || []);
    } catch (err) {
      console.log(
        "Order error:",
        err.message
      );
    }
  };

  /* ===============================
     LOAD ALL DATA
  =============================== */
  const loadData = async () => {
    try {
      setLoadingWallet(true);

      await Promise.all([
        loadCart(),
        loadAddress(),
        fetchWallet(),
        fetchOrders(),
      ]);
    } finally {
      setLoadingWallet(false);
    }
  };

  /* ===============================
     REFRESH ON FOCUS
  =============================== */
  useEffect(() => {
    const unsub =
      navigation.addListener(
        "focus",
        loadData
      );

    return unsub;
  }, [navigation]);

  useFocusEffect(
  useCallback(() => {

    loadAddress();

    loadData();

    return () => {};
  }, [])
);

  /* ===============================
     CART OPS
  =============================== */
  const saveCart = async (updated) => {
    await AsyncStorage.setItem(
      CART_KEY,
      JSON.stringify(updated)
    );

    setCart(updated);
  };

  const updateQty = (id, type) => {
    const updated = cart.map((item) => {
      if (item._id === id) {
        let qty = item.qty || 1;

        if (type === "inc") qty++;
        if (type === "dec")
          qty = Math.max(1, qty - 1);

        return { ...item, qty };
      }

      return item;
    });

    saveCart(updated);
  };

  const removeItem = (id) => {
    const updated = cart.filter(
      (i) => i._id !== id
    );

    saveCart(updated);
  };

  const getTotal = () =>
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
          (item.qty || 1),
      0
    );

  /* ===============================
     BLOCKED MONEY
     pending + approved
  =============================== */
  const blockedAmount = orders
    .filter(
      (item) =>
        item.status === "pending" ||
        item.status === "approved"
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.total || 0),
      0
    );

  const availableBalance =
    Number(wallet?.balance || 0) -
    blockedAmount;

  /* ===============================
     PLACE ORDER
  =============================== */
  const placeOrder = async () => {
    const total = getTotal();

    if (!selectedAddress) {
      return Alert.alert(
        "Error",
        "Please select address 📍"
      );
    }

    if (!wallet) {
      return Alert.alert(
        "Error",
        "Wallet not loaded"
      );
    }

    if (
      availableBalance < total
    ) {
      return Alert.alert(
        "Insufficient Balance",
        `Need ₹${total}, Available ₹${availableBalance}`
      );
    }

    try {
      setPlacingOrder(true);


      const payload = {
        items: cart,
        address:
          selectedAddress,
        total,
        type: "cart",
      };

      await axios.post(
        `${BASE_URL}/api/v1/order/create`,
        payload,
        {
          withCredentials: true,
        }
      );

      await AsyncStorage.removeItem(
        CART_KEY
      );

      setCart([]);

      Alert.alert(
        "Success 🎉",
        "Order placed successfully"
      );

      loadData();
    } catch (err) {
      console.log(
        "Order error:",
        err.response?.data ||
          err.message
      );

      Alert.alert(
        "Error",
        "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View style={styles.container}>
        
        <Text style={styles.heading}>
          Cart 🛒
        </Text>

        {/* ADDRESS */}
        <View style={styles.addressBox}>
          <Text>
            {selectedAddress
              ? `📍 ${selectedAddress.text}`
              : "No address selected"}
          </Text>
        </View>

        {/* WALLET */}
        <View style={styles.walletBox}>
          <Text>
            💰 Wallet:{" "}
            {loadingWallet
              ? "Loading..."
              : `₹${availableBalance}`}
          </Text>

          {blockedAmount > 0 && (
            <Text
              style={{
                marginTop: 5,
                color: "#666",
                fontSize: 12,
              }}
            >
              ₹{blockedAmount} reserved
              in pending orders
            </Text>
          )}
        </View>

        {/* CART */}
        {cart.length === 0 ? (
          <Text style={styles.empty}>
            Cart is empty
          </Text>
        ) : (
          <>
            <FlatList
              data={cart}
              keyExtractor={(i) =>
                i._id +
                (i.qty || 1)
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 120,
              }}
              renderItem={({
                item,
              }) => (
                <View
                  style={styles.card}
                >
                  <Text
                    style={
                      styles.name
                    }
                  >
                    {item.name}
                  </Text>

                  <Text>
                    ₹{item.price}
                  </Text>

                  <View
                    style={
                      styles.row
                    }
                  >
                    <View
                      style={
                        styles.qtyBox
                      }
                    >
                      <TouchableOpacity
                        onPress={() =>
                          updateQty(
                            item._id,
                            "dec"
                          )
                        }
                      >
                        <Text
                          style={
                            styles.qtyBtn
                          }
                        >
                          -
                        </Text>
                      </TouchableOpacity>

                      <Text>
                        {item.qty ||
                          1}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          updateQty(
                            item._id,
                            "inc"
                          )
                        }
                      >
                        <Text
                          style={
                            styles.qtyBtn
                          }
                        >
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={
                        styles.remove
                      }
                      onPress={() =>
                        removeItem(
                          item._id
                        )
                      }
                    >
                      <Text
                        style={{
                          color:
                            "#fff",
                        }}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            <Text style={styles.total}>
              Total: ₹{getTotal()}
            </Text>

            <TouchableOpacity
              style={
                styles.addressBtn
              }
              onPress={() =>
                navigation.navigate(
                  "Address"
                )
              }
            >
              <Text
                style={
                  styles.btnText
                }
              >
                Select Address
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.orderBtn,
                placingOrder && {
                  opacity: 0.6,
                },
              ]}
              disabled={
                placingOrder
              }
              onPress={
                placeOrder
              }
            >
              {placingOrder ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={
                    styles.btnText
                  }
                >
                  Place Order
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;

/* ===============================
   STYLES
=============================== */
const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#FAE8C3",
  },

  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 100,
    backgroundColor: "#FAE8C3",
  },

  heading: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 15,
    marginTop: 5,
    color: "#4E342E",
  },

  card: {
    backgroundColor: "#FFFDF8",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8DDD0",
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4E342E",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },

  qtyBox: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  qtyBtn: {
    backgroundColor: "#A1887F",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  qtyBtnText: {
    color: "#FFF8E1",
    fontWeight: "700",
    fontSize: 16,
  },

  qtyText: {
    color: "#4E342E",
    fontWeight: "700",
    fontSize: 16,
  },

  remove: {
    backgroundColor: "#8D6E63",
    padding: 8,
    borderRadius: 8,
  },

  removeText: {
    color: "#FFF8E1",
    fontWeight: "700",
  },

  total: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 10,
    color: "#4E342E",
  },

  addressBox: {
    padding: 12,
    backgroundColor: "#FFFDF8",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8DDD0",
  },

  walletBox: {
    padding: 12,
    backgroundColor: "#F5E6D3",
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D7CCC8",
  },

  addressBtn: {
    backgroundColor: "#A1887F",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },

  orderBtn: {
    backgroundColor: "#6D4C41",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#FFF8E1",
    fontWeight: "700",
    fontSize: 15,
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#6D4C41",
  },

});