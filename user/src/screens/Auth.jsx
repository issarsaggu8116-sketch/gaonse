import { useContext, useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Context } from "../context/AppContext";
import Login from "../components/Login";
import Register from "../components/Register";
import styles from "../styles/Auth";

const Auth = ({ navigation }) => {
  const { isAuthenticated } = useContext(Context);
  const [isLogin, setIsLogin] = useState(true);

  // ✅ Redirect after login
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace("Home");
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* 🔥 MAIN CONTAINER WITH TOP SPACE */}
          <View
            style={[
              styles.authPage,
              {
                paddingTop: Platform.OS === "android" ? 50 : 30,
              },
            ]}
          >
            <View style={styles.authContainer}>
              
              {/* 🔁 TOGGLE */}
              <View style={styles.authToggle}>
                <TouchableOpacity
                  onPress={() => setIsLogin(true)}
                  style={[
                    styles.toggleBtn,
                    isLogin && styles.activeToggle,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      isLogin && styles.activeText,
                    ]}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
    
                <TouchableOpacity
                  onPress={() => setIsLogin(false)}
                  style={[
                    styles.toggleBtn,
                    !isLogin && styles.activeToggle,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      !isLogin && styles.activeText,
                    ]}
                  >
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
    
              {/* 📦 FORMS */}
              {isLogin ? <Login /> : <Register />}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Auth;