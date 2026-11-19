import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../screens/LoginScreen";
import Home from "../screens/HomeScreen";
import Orders from "../screens/OrderScreen";
import Subscriptions from "../screens/SubscriptionScreen";
import SummaryScreen from "../screens/SummeryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import KhataScreen from "../screens/KhataScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Orders" component={Orders} />
      <Stack.Screen name="Subscriptions" component={Subscriptions} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Khata" component={KhataScreen} />
    </Stack.Navigator>
  );
}