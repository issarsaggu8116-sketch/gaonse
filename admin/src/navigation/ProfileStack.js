import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Profile from "../screens/Profile";
import Zones from "../screens/Zones";
import Products from "../screens/Products";
import Category from "../screens/Category";
import Settings from "../screens/Settings";
import DeliveryPartners from "../screens/DeliveryPartners";

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={Profile} />
      <Stack.Screen name="Zones" component={Zones} />
      <Stack.Screen name="Products" component={Products} />
      <Stack.Screen name="Category" component={Category} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Delivery" component={DeliveryPartners} />
    </Stack.Navigator>
  );
};

export default ProfileStack;