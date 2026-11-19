import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";

const MapPickerScreen = ({
  navigation,
  route,
}) => {
  const zone = route?.params?.zone;

  const [marker, setMarker] = useState(
    zone?.center?.lat && zone?.center?.lng
      ? {
          latitude: zone.center.lat,
          longitude: zone.center.lng,
        }
      : null
  );

  const html = useMemo(() => {
    const initialLat = zone?.center?.lat || 28.6139;
    const initialLng = zone?.center?.lng || 77.209;
    const initialMarkerLat = zone?.center?.lat || "null";
    const initialMarkerLng = zone?.center?.lng || "null";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      height: 100%;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var initialLat = ${initialLat};
    var initialLng = ${initialLng};
    var markerLat = ${initialMarkerLat};
    var markerLng = ${initialMarkerLng};

    var map = L.map('map', {
      zoomControl: false
    }).setView([initialLat, initialLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    var currentMarker = null;

    if (markerLat !== null && markerLng !== null) {
      currentMarker = L.marker([markerLat, markerLng]).addTo(map);
    }

    map.on('click', function(e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;

      if (currentMarker) {
        currentMarker.setLatLng(e.latlng);
      } else {
        currentMarker = L.marker(e.latlng).addTo(map);
      }

      var msg = JSON.stringify({
        type: 'select_location',
        latitude: lat,
        longitude: lng
      });

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(msg);
      } else {
        window.parent.postMessage(msg, "*");
      }
    });
  </script>
</body>
</html>
    `;
  }, [zone]);

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleWebMessage = (event) => {
        let result;
        try {
          result = JSON.parse(event.data);
        } catch {
          return;
        }

        if (result.type === "select_location") {
          setMarker({
            latitude: result.latitude,
            longitude: result.longitude,
          });
        }
      };

      window.addEventListener("message", handleWebMessage);
      return () => window.removeEventListener("message", handleWebMessage);
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const confirmLocation = async () => {
    if (!marker) {
      Alert.alert(
        "Select Location",
        "Tap on map to select location"
      );
      return;
    }

    if (zone && zone.center?.lat && zone.center?.lng && zone.radius) {
      const distance = calculateDistance(
        marker.latitude,
        marker.longitude,
        zone.center.lat,
        zone.center.lng
      );

      if (distance > zone.radius) {
        Alert.alert(
          "Outside Delivery Area",
          `We only deliver within ${zone.radius} KM of ${zone.name}. Selected location is ${distance.toFixed(2)} KM away.`
        );
        return;
      }
    }

    await AsyncStorage.setItem(
      "TEMP_LOCATION",
      JSON.stringify(marker)
    );

    navigation.goBack();
  };

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1 }}>
        <iframe
          srcDoc={html}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={confirmLocation}
        >
          <Text style={styles.confirmText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "select_location") {
              setMarker({
                latitude: data.latitude,
                longitude: data.longitude,
              });
            }
          } catch {}
        }}
      />
      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={confirmLocation}
      >
        <Text style={styles.confirmText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MapPickerScreen;

const styles = StyleSheet.create({
  confirmBtn: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#0cbb69",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});