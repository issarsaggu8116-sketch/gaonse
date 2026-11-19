import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { useFocusEffect } from "@react-navigation/native";


import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";

import { Context } from "../context/AppContext";
import { BASE_URL } from "../config";


const AddressScreen = ({ navigation,route }) => {
const { user } = useContext(Context);

const [zones, setZones] = useState([]);
const [selectedZone, setSelectedZone] = useState(null);

const [addressText, setAddressText] = useState("");

const [latitude, setLatitude] = useState(null);
const [longitude, setLongitude] = useState(null);

const [loadingLocation, setLoadingLocation] =
  useState(false);


//------------distance calculator--------------



const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const R = 6371; // Earth radius in KM

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};

useFocusEffect(
  useCallback(() => {
    const loadLocation = async () => {
      const saved =
        await AsyncStorage.getItem(
          "TEMP_LOCATION"
        );

      if (!saved) return;

      const location =
        JSON.parse(saved);

      setLatitude(location.latitude);
      setLongitude(location.longitude);

      await AsyncStorage.removeItem(
        "TEMP_LOCATION"
      );
    };

    loadLocation();
  }, [])
);

  // ---------------- FETCH ZONES ----------------
const fetchZones = async () => {
  try {
    const cityId =
      user?.city?._id || user?.city;

    if (!cityId) return;

    const { data } = await axios.get(
      `${BASE_URL}/api/v1/zones?cityId=${cityId}`
    );

    setZones(data.zones || []);
  } catch (err) {
    console.log(
      "Zone error:",
      err.message
    );
  }
};

useEffect(() => {
  fetchZones();
}, [user]);



  // ---------------- FETCH CURRENT LOCATION ----------------
 const fetchCurrentLocation = async () => {
  if (!selectedZone) {
    Alert.alert(
      "Select Zone First",
      "Please select your delivery zone first"
    );
    return;
  }

  try {
    setLoadingLocation(true);

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location permission is required"
      );

      setLoadingLocation(false);
      return;
    }

    const location =
      await Location.getCurrentPositionAsync({
        accuracy:
          Location.Accuracy.High,
      });

    const currentLat =
  location.coords.latitude;

const currentLng =
  location.coords.longitude;

const distance = calculateDistance(
  currentLat,
  currentLng,
  selectedZone.center.lat,
  selectedZone.center.lng
);

if (distance > selectedZone.radius) {
  setLoadingLocation(false);

  Alert.alert(
    "Outside Delivery Area",
    `We only deliver within ${selectedZone.radius} KM radius of ${selectedZone.name}.`
  );

  return;
}

setLatitude(currentLat);
setLongitude(currentLng);

setLoadingLocation(false);

Alert.alert(
  "Location Accepted ✅",
  `You are ${distance.toFixed(
    2
  )} KM from ${selectedZone.name}`
);
  } catch (err) {
    console.log(err);

    setLoadingLocation(false);

    Alert.alert(
      "Error",
      "Unable to fetch location"
    );
  }
};

  // ---------------- SAVE ADDRESS ----------------
  const saveAddress = async () => {
  if (!selectedZone) {
    Alert.alert(
      "Select Zone",
      "Please select a zone"
    );
    return;
  }

  if (!latitude || !longitude) {
    Alert.alert(
      "Location Required",
      "Please fetch your location first"
    );
    return;
  }

  if (!addressText.trim()) {
    Alert.alert(
      "Address Required",
      "Please enter house number or landmark"
    );
    return;
  }

  const distance = calculateDistance(
    latitude,
    longitude,
    selectedZone.center.lat,
    selectedZone.center.lng
  );

  if (distance > selectedZone.radius) {
    Alert.alert(
      "Outside Delivery Area",
      `We only deliver within ${selectedZone.radius} KM radius of ${selectedZone.name}. The selected location is outside this area.`
    );
    return;
  }

  const address = {
    city: user?.city,
    zone: selectedZone,
    text: addressText,
    latitude,
    longitude,
  };


  await AsyncStorage.setItem(
    "SELECTED_ADDRESS",
    JSON.stringify(address)
  );

  Alert.alert(
    "Saved 🎉",
    "Address saved successfully"
  );

  navigation.goBack();
};

//---------open map picker---------

const openMapPicker = () => {
  if (!selectedZone) {
    Alert.alert(
      "Select Zone First",
      "Please select your delivery zone first"
    );
    return;
  }

  navigation.navigate("MapPicker", {
    zone: selectedZone,
  });
};

  // ---------------- UI ----------------
  return(<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
>
  <StatusBar barStyle="dark-content" />

  <ScrollView
    keyboardShouldPersistTaps="handled"
    contentContainerStyle={styles.container}
  >
    {/* HEADER */}
    <Text style={styles.title}>
      
    </Text>

    {/* CITY */}
    <View style={styles.cityBox}>
      <Text style={styles.cityLabel}>
        Delivering To
      </Text>

      <Text style={styles.cityName}>
        {user?.city?.name || "Your Door Steps"}
      </Text>
    </View>

    {/* ZONES */}
    <Text style={styles.sectionTitle}>
      Select Zone
    </Text>

    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={zones}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{
        paddingVertical: 8,
      }}
      renderItem={({ item }) => {
        const active =
          selectedZone?._id === item._id;

        return (
          <TouchableOpacity
            onPress={() =>
              setSelectedZone(item)
            }
            style={[
              styles.zoneChip,
              active &&
                styles.zoneChipActive,
            ]}
          >
            <Text
              style={[
                styles.zoneText,
                active && {
                  color: "#fff",
                },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      }}
    />

    {/* LOCATION */}
    <Text style={styles.sectionTitle}>
  Delivery Location
</Text>

<View style={styles.locationCard}>

  <TouchableOpacity
    style={styles.locationOption}
    onPress={fetchCurrentLocation}
    disabled={loadingLocation}
  >
    {loadingLocation ? (
      <ActivityIndicator />
    ) : (
      <>
        <Text style={styles.locationIcon}>
          📡
        </Text>

        <Text style={styles.locationOptionText}>
          Current Location
        </Text>
      </>
    )}
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.locationOption}
    onPress={openMapPicker}
  >
    <Text style={styles.locationIcon}>
      🗺️
    </Text>

    <Text style={styles.locationOptionText}>
      Select On Map
    </Text>
  </TouchableOpacity>

</View>

    {/* ADDRESS TEXT */}
    <Text style={styles.sectionTitle}>
      Landmark / Full Address
    </Text>

    <TextInput
      value={addressText}
      onChangeText={setAddressText}
      placeholder="House No, Street, Landmark..."
      style={styles.input}
      multiline
    />

    {/* PREVIEW */}
    <View style={styles.preview}>
      <Text style={styles.previewTitle}>
        Address Preview
      </Text>

      <Text style={styles.previewText}>
        Zone:{" "}
        {selectedZone?.name || "-"}
      </Text>

      <Text style={styles.previewText}>
        Latitude:{" "}
        {latitude
          ? latitude.toFixed(6)
          : "-"}
      </Text>

      <Text style={styles.previewText}>
        Longitude:{" "}
        {longitude
          ? longitude.toFixed(6)
          : "-"}
      </Text>

      <Text style={styles.previewText}>
        Address:{" "}
        {addressText || "-"}
      </Text>
    </View>

    {/* SAVE */}
    <TouchableOpacity
      style={styles.saveBtn}
      onPress={saveAddress}
    >
      <Text style={styles.saveText}>
        Save Address
      </Text>
    </TouchableOpacity>
  </ScrollView>
</KeyboardAvoidingView>
);
};

export default AddressScreen;

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 55 : 25,
    paddingBottom: 120, // bottom tab spacing
    backgroundColor: "#F8F3EB",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#5C3D2E",
    marginBottom: 16,
  },

  locationCard: {
    backgroundColor: "#FFFDF8",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  locationOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    marginHorizontal: 5,
    backgroundColor: "#EFE5D8",
    borderRadius: 14,
  },

  locationIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  locationOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5C3D2E",
    textAlign: "center",
  },

  cityBox: {
    backgroundColor: "#FFFDF8",
    padding: 18,
    borderRadius: 18,
    marginBottom: 10,
    elevation: 3,
  },

  cityLabel: {
    fontSize: 12,
    color: "#8B7355",
  },

  cityName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5C3D2E",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5C3D2E",
    marginTop: 18,
    marginBottom: 8,
  },

  zoneChip: {
    backgroundColor: "#E8DCCB",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    marginRight: 8,
  },

  zoneChipActive: {
    backgroundColor: "#8B5E3C",
  },

  zoneText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5C3D2E",
  },

  locationBtn: {
    backgroundColor: "#8B5E3C",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },

  locationBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  locationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5C3D2E",
    marginBottom: 8,
  },

  locationText: {
    fontSize: 14,
    color: "#6D5844",
    marginTop: 4,
  },

  input: {
    backgroundColor: "#FFFDF8",
    minHeight: 60,
    borderRadius: 18,
    padding: 14,
    fontSize: 14,
    textAlignVertical: "top",
    elevation: 3,
    color: "#5C3D2E",
  },

  preview: {
    backgroundColor: "#FFFDF8",
    padding: 18,
    borderRadius: 18,
    marginTop: 18,
    elevation: 3,
  },

  previewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5C3D2E",
    marginBottom: 8,
  },

  previewText: {
    fontSize: 14,
    color: "#6D5844",
    marginTop: 4,
    lineHeight: 22,
  },

  saveBtn: {
    backgroundColor: "#8B5E3C",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 22,
    marginBottom: 20,
    elevation: 3,
  },

  saveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});