import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Context } from "../context/AppContext";
import { BASE_URL } from "../config";

import logo from "../../assets/images/icon.png"

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_KEY = "CART_ITEMS";

const Home = ({ navigation }) => {
  const { user } = useContext(Context);

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [cartCount, setCartCount] = useState(0);

const [categories, setCategories] = useState([]);
const [selectedCategory, setSelectedCategory] =
  useState("all");



// ---------------- CART ----------------

const getCart = async () => {
  try {
    const data = await AsyncStorage.getItem(
      CART_KEY
    );

    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log(
      "getCart error:",
      e.message
    );
    return [];
  }
};

const loadCartCount = async () => {
  const cart = await getCart();

  const total = cart.reduce(
    (sum, item) =>
      sum + (item.qty || 1),
    0
  );

  setCartCount(total);
};

// ---------------- PRODUCTS ----------------

const fetchProducts = async () => {
  try {
    if (!user?.city) {
      setLoading(false);
      return;
    }

    const cityId =
      user.city?._id || user.city;

    const { data } = await axios.get(
      `${BASE_URL}/api/v1/products?cityId=${cityId}`
    );

    const fetchedProducts =
      data.products || [];

    setProducts(fetchedProducts);

    const uniqueCategories = [];

    fetchedProducts.forEach(
      (product) => {
        if (
          product.category &&
          !uniqueCategories.find(
            (c) =>
              c._id ===
              product.category._id
          )
        ) {
          uniqueCategories.push(
            product.category
          );
        }
      }
    );

    setCategories(uniqueCategories);
  } catch (err) {
    console.log(
      "Fetch Error:",
      err.message
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

useEffect(() => {
  fetchProducts();
  loadCartCount();
}, [user]);

useEffect(() => {
  const unsub =
    navigation.addListener(
      "focus",
      () => {
        loadCartCount();
      }
    );

  return unsub;
}, [navigation]);

const onRefresh = () => {
  setRefreshing(true);

  fetchProducts();
  loadCartCount();
};

// ---------------- FILTER ----------------

const filteredProducts =
  selectedCategory === "all"
    ? products
    : products.filter(
        (product) =>
          product.category?._id ===
          selectedCategory
      );

// ---------------- ADD TO CART ----------------

const handleAddToCart = async (
  item
) => {
  try {
    let cart = await getCart();

    const discount =
      item.discount || 0;

    const finalPrice =
      discount > 0
        ? item.price -
          (item.price *
            discount) /
            100
        : item.price;

    const index =
      cart.findIndex(
        (p) =>
          String(p._id) ===
          String(item._id)
      );

    if (index >= 0) {
      cart[index].qty =
        (cart[index].qty || 1) +
        1;
    } else {
      cart.push({
        _id: item._id,
        name: item.name,
        price: finalPrice,
        originalPrice:
          item.price,
        discount,
        img_url:
          item.img_url || "",
        qty: 1,
      });
    }

    await AsyncStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );

    loadCartCount();
  } catch (err) {
    console.log(
      "Cart error:",
      err.message
    );
  }
};
  // ---------------- UI ----------------

  return (
  <SafeAreaView
    style={{
      flex: 1,
      backgroundColor: "#fae8c3",
    }}
  >
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingTop:
            Platform.OS === "android"
              ? 50
              : 30,
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {/* LOGO */}

      

      {/* TOP BAR */}

      <View style={styles.topBar}>

        <View
        style={
          styles.brandContainer
        }
      >
        <Image
          source={logo}
          style={styles.logo}
        />

        <Text
          style={
            styles.brandName
          }
        >
          GAONSE
        </Text>
      </View>

        <TouchableOpacity
          style={
            styles.cartIcon
          }
          onPress={() =>
            navigation.navigate(
              "Cart"
            )
          }
        >
          <Text
            style={{
              fontSize: 18,
            }}
          >
            🛒
          </Text>

          {cartCount > 0 && (
            <View
              style={
                styles.badge
              }
            >
              <Text
                style={
                  styles.badgeText
                }
              >
                {cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* CATEGORY FILTER */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        style={{
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            setSelectedCategory(
              "all"
            )
          }
          style={[
            styles.categoryChip,
            selectedCategory ===
              "all" &&
              styles.activeChip,
          ]}
        >
          <Text
            style={
              selectedCategory ===
              "all"
                ? styles.activeChipText
                : styles.chipText
            }
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat._id}
            onPress={() =>
              setSelectedCategory(
                cat._id
              )
            }
            style={[
              styles.categoryChip,
              selectedCategory ===
                cat._id &&
                styles.activeChip,
            ]}
          >
            <Text
              style={
                selectedCategory ===
                cat._id
                  ? styles.activeChipText
                  : styles.chipText
              }
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PRODUCTS */}

      {loading ? (
        <Text
          style={styles.message}
        >
          Loading...
        </Text>
      ) : filteredProducts.length ===
        0 ? (
        <Text
          style={styles.message}
        >
          No products available
        </Text>
      ) : (
        filteredProducts.map(
          (item) => {
            const discount =
              item.discount ||
              0;

            const finalPrice =
              discount > 0
                ? (
                    item.price -
                    (item.price *
                      discount) /
                      100
                  ).toFixed(2)
                : item.price;

            return (
              
              <View key={item._id} style={styles.card}>

  <View style={styles.productRow}>

    {/* IMAGE */}

    <View style={styles.imageContainer}>
      {item.img_url ? (
        <Image
          source={{ uri: item.img_url }}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : null}

      {discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {discount}% OFF
          </Text>
        </View>
      )}
    </View>

    {/* DETAILS */}

    <View style={styles.detailsContainer}>
      <Text style={styles.title}>
        {item.name}
      </Text>

      <Text style={styles.categoryText}>
        {item.category?.name}
      </Text>

      {discount > 0 ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 }}>
          <Text style={styles.discountPrice}>
            ₹{finalPrice}
          </Text>
          <Text style={styles.oldPrice}>
            ₹{item.price}
          </Text>
        </View>
      ) : (
        <Text style={styles.price}>
          ₹{item.price}
        </Text>
      )}

      <Text style={styles.stockText}>
        Available: {item.currentStock || 0} Ltr
      </Text>
    </View>

  </View>

  {/* BUTTONS BELOW */}

  <View style={styles.buttonRow}>
    <TouchableOpacity
      style={styles.button}
      onPress={() =>
        handleAddToCart(item)
      }
    >
      <Text style={styles.buttonText}>
        Add to Cart
      </Text>
    </TouchableOpacity>

    {item.isSubscriptionAllowed && (
      <TouchableOpacity
        style={styles.subscribeBtn}
        onPress={() =>
          navigation.navigate(
            "Subscription",
            {
              product: item,
            }
          )
        }
      >
        <Text style={styles.subscribeText}>
          Subscribe
        </Text>
      </TouchableOpacity>
    )}
  </View>

</View>
            );
          }
        )
      )}
    </ScrollView>
  </SafeAreaView>
);
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fae8c3",
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 8,
  },

  brandName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#6D4C41",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  heading: {
    fontSize: 24,
    fontWeight: "800",
  },

  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#E8DDD0",
    marginRight: 10,
    height: 40,
    justifyContent: "center",
  },

  activeChip: {
    backgroundColor: "#8D6E63",
    borderColor: "#8D6E63",
  },

  chipText: {
    color: "#8D6E63",
    fontWeight: "600",
  },

  activeChipText: {
    color: "#FFF8E1",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFFDF8",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8DDD0",
  },

  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#D32F2F",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 5,
  },

  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4E342E",
  },

  oldPrice: {
    color: "#9E9E9E",
    textDecorationLine: "line-through",
    fontSize: 13,
  },

  discountPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6D4C41",
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6D4C41",
    marginTop: 4,
  },

  button: {
    flex: 1,
    backgroundColor: "#6D4C41",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },

  subscribeBtn: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#8D6E63",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFF8E1",
    fontWeight: "750",
  },

  subscribeText: {
    color: "#8D6E63",
    fontWeight: "750",
  },

  cartIcon: {
    position: "relative",
    padding: 10,
    backgroundColor: "#FFF8E1",
    borderRadius: 50,
    elevation: 3,
  },

  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#795548",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  categoryText: {
    color: "#8D6E63",
    fontSize: 12,
    marginTop: 2,
  },

  stockText: {
    marginTop: 6,
    color: "#8D6E63",
    fontSize: 12,
  },

  message: {
    textAlign: "center",
    marginTop: 30,
    color: "#666",
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  imageContainer: {
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },

  detailsContainer: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "center",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },
});