import React from "react";
import { Platform } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Ionicons } from "@expo/vector-icons";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Home from "./src/screens/Home";
import Wallet from "./src/screens/Wallet";
import Referrals from "./src/screens/Referrals";
import Calendar from "./src/screens/Calendar";
import Profile from "./src/screens/Profile";

const Tab =
  createBottomTabNavigator();

const BottomTabs = () => {
  const insets =
    useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        /* ======================
           TAB ICONS
        ====================== */
        tabBarIcon: ({
          focused,
          color,
          size,
        }) => {
          let iconName;

          if (
            route.name === "HomeTab"
          ) {
            iconName = focused
              ? "home"
              : "home-outline";
          } else if (
            route.name === "Wallet"
          ) {
            iconName = focused
              ? "wallet"
              : "wallet-outline";
          } else if (
            route.name === "Referrals"
          ) {
            iconName = focused
              ? "people"
              : "people-outline";
          } else if (
            route.name === "Calendar"
          ) {
            iconName = focused
              ? "calendar"
              : "calendar-outline";
          } else if (
            route.name === "Profile"
          ) {
            iconName = focused
              ? "person"
              : "person-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={24}
              color={color}
            />
          );
        },

        /* ======================
           COLORS
        ====================== */
        tabBarActiveTintColor:
          "#0cbb69",

        tabBarInactiveTintColor:
          "#888",

        /* ======================
           RESPONSIVE TAB BAR
        ====================== */
        tabBarStyle: {
          position: "absolute",

          height:
            Platform.OS === "ios"
              ? 70 + insets.bottom
              : 65 + insets.bottom,

          paddingTop: 8,

          paddingBottom:
            insets.bottom > 0
              ? insets.bottom
              : 8,

          borderTopWidth: 0,

          backgroundColor: "#fff",

          elevation: 10,

          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: {
            width: 0,
            height: -2,
          },
        },

        /* ======================
           LABELS
        ====================== */
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },

        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={Home}
        options={{
          title: "Home",
        }}
      />

      <Tab.Screen
        name="Wallet"
        component={Wallet}
      />

      {/* <Tab.Screen
        name="Referrals"
        component={Referrals}
      /> */}

      {/* <Tab.Screen
        name="Calendar"
        component={Calendar}
      /> */}

      <Tab.Screen
        name="Profile"
        component={Profile}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;