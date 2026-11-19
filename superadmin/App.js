import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import Cities from "./src/screens/Cities";
import Admins from "./src/screens/Admins";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#ffffff",
            borderBottomWidth: 1,
            borderBottomColor: "#e2e8f0",
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontWeight: "800",
            color: "#0f172a",
            fontSize: 18,
          },
          tabBarStyle: {
            height: 80,
            paddingBottom: 24,
            paddingTop: 8,
            backgroundColor: "#ffffff",
            borderTopColor: "#e2e8f0",
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: "#6366f1",
          tabBarInactiveTintColor: "#64748b",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tab.Screen
          name="Cities"
          component={Cities}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏙️</Text>,
            headerTitle: "GAON SE - City Hub",
          }}
        />

        <Tab.Screen
          name="Admins"
          component={Admins}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👨‍💼</Text>,
            headerTitle: "GAON SE - Admin Control",
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}