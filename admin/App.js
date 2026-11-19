import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";

import {
  SafeAreaProvider,
} from "react-native-safe-area-context";

import Tabs from "./src/navigation/Tabs";
import Login from "./src/screens/Login";

import {
  AuthProvider,
  AuthContext,
} from "./src/context/AuthContext";

import { ActivityIndicator, View } from "react-native";

const Main = () => {
  const { admin, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffac40",
        }}
      >
        <ActivityIndicator size="large" color="#6b3805" />
      </View>
    );
  }

  return admin ? <Tabs /> : <Login />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Main />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}