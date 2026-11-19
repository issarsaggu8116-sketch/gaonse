import { NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  createContext,
  useState,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Toast from "react-native-toast-message";

import {
  SafeAreaProvider,
} from "react-native-safe-area-context";

import Auth from "./src/screens/Auth";
import ForgotPassword from "./src/screens/ForgotPassword";
import Home from "./src/screens/Home";
import OtpVerification from "./src/screens/OtpVerification";
import ResetPassword from "./src/screens/ResetPassword";
import HelpSupport from "./src/screens/HelpSupport";
import LegalAbout from "./src/screens/LegalAbout";

import BottomTabs from "./BottomTabs";

import CartScreen from "./src/screens/CartScreen.js";

import AddressScreen from "./src/screens/AddressScreen.js";

import OrderScreen from "./src/screens/OrderScreen.js";

import SubscriptionScreen from "./src/screens/Subscription.js";
import RazorpayWebScreen from "./src/screens/RazorpayWebScreen.js"
import PaymentSuccess from "./src/screens/PaymentSuccessScreen.js"

import SubscriptionListScreen from "./src/screens/EditSubscription.js";
import MapPickerScreen from "./src/screens/MapPickerScreen.js";
import EditSubscriptionScreen from "./src/screens/EditSubscriptionScreen.js";
import { Context } from "./src/context/AppContext";

const Stack =
  createNativeStackNavigator();

const linking = {
  prefixes: [Linking.createURL("/"), "client://"],
  config: {
    screens: {
      ResetPassword: "password/reset/:token",
    },
  },
};

export default function App() {
  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem("isAuthenticated");
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");

        if (storedAuth === "true" && storedUser) {
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser));
          if (storedToken && typeof global !== "undefined") {
            global.userToken = storedToken;
          }
        }
      } catch (err) {
        console.log("Failed to load auth state", err);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Context.Provider
        value={{
          isAuthenticated,
          setIsAuthenticated,
          user,
          setUser,
        }}
      >
        <>
          <NavigationContainer linking={linking}>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen
                name="Auth"
                component={Auth}
              />

              <Stack.Screen
                name="Home"
                component={BottomTabs}
              />

              <Stack.Screen
                name="ForgotPassword"
                component={
                  ForgotPassword
                }
              />

              <Stack.Screen
                name="OtpVerification"
                component={
                  OtpVerification
                }
              />

              <Stack.Screen
                name="ResetPassword"
                component={
                  ResetPassword
                }
              />

              <Stack.Screen
                name="HelpSupport"
                component={
                  HelpSupport
                }
              />

              <Stack.Screen
                name="LegalAbout"
                component={
                  LegalAbout
                }
              />

              <Stack.Screen
                name="Cart"
                component={CartScreen}
              />

              <Stack.Screen
                name="Address"
                component={
                  AddressScreen
                }
              />

              <Stack.Screen
                name="Order"
                component={OrderScreen}
              />

              <Stack.Screen
                name="Subscription"
                component={
                  SubscriptionScreen
                }
              />

              <Stack.Screen
  name="RazorpayWebScreen"
  component={RazorpayWebScreen}
/>

<Stack.Screen
  name="PaymentSuccess"
  component={PaymentSuccess}
/>  

              <Stack.Screen
                name="EditSubscription"
                component={
                  SubscriptionListScreen
                }
              />

              <Stack.Screen
  name="MapPicker"
  component={MapPickerScreen}
/>

              <Stack.Screen
                name="EditSubscriptionScreen"
                component={
                  EditSubscriptionScreen
                }
              />
            </Stack.Navigator>
          </NavigationContainer>

          {/* 📣 GLOBAL TOAST */}
          <Toast />
        </>
      </Context.Provider>
    </SafeAreaProvider>
  );
}