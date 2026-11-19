import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LegalAbout = ({ navigation }) => {
  const [expandedDoc, setExpandedDoc] = useState(null);

  const docs = [
    {
      title: "📋 Terms of Service",
      content: "Welcome to GAON SE! By placing subscriptions or orders, you agree to follow our service terms. Deliveries are processed daily between 5:30 AM and 8:30 AM. Any modifications or holiday pauses to active subscriptions must be submitted by 10:00 PM the previous evening to guarantee next-day execution. Payments are processed securely via our integration partners, and credits remain in the wallet until used or requested for refund."
    },
    {
      title: "🔒 Privacy Policy",
      content: "Your privacy is paramount to GAON SE. We gather and securely process essential info (name, delivery address, phone, email, and wallet transactions) to ensure high-fidelity logistics and custom subscriptions. Your data is encrypted in transit and at rest. We never sell or share your personal information with external marketers. Location services are only used to pin delivery addresses accurately."
    },
    {
      title: "💰 Refund & Return Policy",
      content: "We stand behind our quality. If your organic milk, fruits, or vegetables arrive damaged or do not meet your freshness expectations, please report it within 12 hours of delivery. Upon verified report, we will issue a full, instant refund back to your GAON SE Wallet. Subscription pauses do not lose credit; any pre-paid amounts remain securely saved in your wallet balance."
    }
  ];

  const handleDocPress = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDoc(expandedDoc === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal & About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* GAON SE BRAND BANNER */}
        <View style={styles.brandCard}>
          <Text style={styles.brandEmoji}>🌾</Text>
          <Text style={styles.brandName}>GAON SE</Text>
          <Text style={styles.brandSlogan}>Bridging Farms to Families</Text>
          <Text style={styles.brandDescription}>
            GAON SE is born with the vision of sourcing pure, natural, and preservative-free dairy and agricultural produce directly from native village farmers. We eliminate middle-men, ensuring fair compensation for farmers and fresh, nutrient-dense harvest for your family.
          </Text>
        </View>

        {/* PILLARS / CORE VALUES */}
        <Text style={styles.sectionTitle}>Our Three Pillars</Text>
        <View style={styles.pillarsContainer}>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>🌱</Text>
            <Text style={styles.pillarTitle}>100% Pure</Text>
            <Text style={styles.pillarText}>No preservatives, no dilution, pure farm nature.</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>🤝</Text>
            <Text style={styles.pillarTitle}>Fair Trade</Text>
            <Text style={styles.pillarText}>Direct-to-farmer payouts, uplifting rural lives.</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>⚡</Text>
            <Text style={styles.pillarTitle}>Express Direct</Text>
            <Text style={styles.pillarText}>Harvest to breakfast table in less than 24 hours.</Text>
          </View>
        </View>

        {/* INTERACTIVE LEGAL DOCUMENTS */}
        <Text style={styles.sectionTitle}>Policies & Agreements</Text>
        {docs.map((doc, index) => {
          const isExpanded = expandedDoc === index;
          return (
            <View key={index} style={styles.docCard}>
              <TouchableOpacity 
                style={styles.docHeader} 
                onPress={() => handleDocPress(index)}
                activeOpacity={0.8}
              >
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={[styles.docArrow, isExpanded && styles.docArrowRotated]}>
                  {isExpanded ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.docBody}>
                  <Text style={styles.docContent}>{doc.content}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* VERSION */}
        <Text style={styles.versionText}>GAON SE App v1.0.0 • Made with ❤️ for Farmers</Text>

      </ScrollView>
    </SafeAreaView>
  );
};

export default LegalAbout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fae8c3",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#E8DDD0",
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 18,
    color: "#6D4C41",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4E342E",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  brandCard: {
    backgroundColor: "#FFFDF8",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8DDD0",
    elevation: 3,
  },
  brandEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4E342E",
  },
  brandSlogan: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#0cbb69",
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 16,
  },
  brandDescription: {
    fontSize: 13,
    color: "#5D4037",
    lineHeight: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6D4C41",
    marginTop: 28,
    marginBottom: 12,
  },
  pillarsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pillar: {
    flex: 1,
    backgroundColor: "#FAF6F0",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8DDD0",
    marginHorizontal: 3,
    alignItems: "center",
  },
  pillarIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  pillarTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4E342E",
    marginBottom: 4,
    textAlign: "center",
  },
  pillarText: {
    fontSize: 10,
    color: "#757575",
    textAlign: "center",
    lineHeight: 13,
  },
  docCard: {
    backgroundColor: "#FFFDF8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8DDD0",
    marginBottom: 10,
    overflow: "hidden",
    elevation: 1,
  },
  docHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4E342E",
  },
  docArrow: {
    fontSize: 10,
    color: "#8D6E63",
  },
  docArrowRotated: {
    color: "#6D4C41",
  },
  docBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#E8DDD0",
    backgroundColor: "#FAF6F0",
  },
  docContent: {
    fontSize: 13,
    color: "#5D4037",
    lineHeight: 18,
    marginTop: 10,
  },
  versionText: {
    fontSize: 11,
    color: "#8D6E63",
    textAlign: "center",
    marginTop: 36,
  },
});
