import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  KeyboardAvoidingView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HelpSupport = ({ navigation }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      q: "🌾 How do I manage or pause my subscription?",
      a: "You can temporarily pause, edit, or cancel active subscriptions easily by navigating to the 'My Subscription' screen from your profile dashboard."
    },
    {
      q: "💰 How does the GAON SE Wallet work?",
      a: "Your wallet holds credits used for automatic daily subscription renewals. You can easily recharge it via UPI, Card, or Netbanking under the 'Wallet' tab."
    },
    {
      q: "📍 Where are the products sourced from?",
      a: "All GAON SE milk, vegetables, and grains are sourced directly from verified cooperative village farms and delivered fresh within 12-24 hours of harvest."
    },
    {
      q: "🚚 What are the delivery timings?",
      a: "Standard subscription deliveries are completed early morning between 5:30 AM and 8:30 AM to ensure you get the absolute freshest supplies."
    }
  ];

  const handleFAQPress = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleContactMethod = (type) => {
    if (type === "call") {
      Linking.openURL("tel:+919876543210");
    } else if (type === "whatsapp") {
      Linking.openURL("https://wa.me/919876543210?text=Hello%20GAON%20SE%20Support");
    } else if (type === "email") {
      Linking.openURL("mailto:support@gaonse.com?subject=Customer%20Support%20Inquiry");
    }
  };

  const handleSubmitQuery = () => {
    if (!subject.trim() || !message.trim()) {
      Toast.show({
        type: "error",
        text1: "Please fill in all fields"
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Query submitted!",
      text2: "Our care executives will reach out shortly."
    });
    setSubject("");
    setMessage("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* CUSTOMER CARE CONTACT CHANNELS */}
          <Text style={styles.sectionTitle}>Direct Assistance</Text>
          <View style={styles.contactContainer}>
            <TouchableOpacity 
              style={[styles.contactCard, { borderColor: "#0cbb69" }]} 
              onPress={() => handleContactMethod("whatsapp")}
            >
              <Text style={styles.contactIcon}>💬</Text>
              <Text style={styles.contactName}>WhatsApp</Text>
              <Text style={styles.contactSub}>Chat instantly</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactCard, { borderColor: "#6D4C41" }]} 
              onPress={() => handleContactMethod("call")}
            >
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactName}>Call Support</Text>
              <Text style={styles.contactSub}>Talk to expert</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactCard, { borderColor: "#8D6E63" }]} 
              onPress={() => handleContactMethod("email")}
            >
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactName}>Email Care</Text>
              <Text style={styles.contactSub}>Get reply in hrs</Text>
            </TouchableOpacity>
          </View>

          {/* INTERACTIVE FAQ SECTION */}
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => {
            const isExpanded = expandedFAQ === index;
            return (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity 
                  style={styles.faqHeader} 
                  onPress={() => handleFAQPress(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Text style={[styles.faqArrow, isExpanded && styles.faqArrowRotated]}>
                    {isExpanded ? "▲" : "▼"}
                  </Text>
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{faq.a}</Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* FEEDBACK FORM */}
          <Text style={styles.sectionTitle}>Write to Us</Text>
          <View style={styles.formCard}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              placeholder="What do you need help with?"
              placeholderTextColor="#9e9e9e"
              value={subject}
              onChangeText={setSubject}
              style={styles.input}
            />

            <Text style={styles.label}>Message Details</Text>
            <TextInput
              placeholder="Describe your issue or request..."
              placeholderTextColor="#9e9e9e"
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              style={[styles.input, styles.textArea]}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitQuery}>
              <Text style={styles.submitButtonText}>Submit Inquiry</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HelpSupport;

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6D4C41",
    marginTop: 24,
    marginBottom: 12,
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactCard: {
    flex: 1,
    backgroundColor: "#FFFDF8",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    marginHorizontal: 4,
    elevation: 2,
  },
  contactIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  contactName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4E342E",
    textAlign: "center",
  },
  contactSub: {
    fontSize: 10,
    color: "#757575",
    marginTop: 4,
    textAlign: "center",
  },
  faqCard: {
    backgroundColor: "#FFFDF8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8DDD0",
    marginBottom: 10,
    overflow: "hidden",
    elevation: 1,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4E342E",
    flex: 0.95,
  },
  faqArrow: {
    fontSize: 10,
    color: "#8D6E63",
  },
  faqArrowRotated: {
    color: "#6D4C41",
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#E8DDD0",
    backgroundColor: "#FAF6F0",
  },
  faqAnswer: {
    fontSize: 13,
    color: "#5D4037",
    lineHeight: 18,
    marginTop: 10,
  },
  formCard: {
    backgroundColor: "#FFFDF8",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8DDD0",
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6D4C41",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FAF6F0",
    borderWidth: 1,
    borderColor: "#E8DDD0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: "#4E342E",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#6D4C41",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonText: {
    color: "#FFF8E1",
    fontWeight: "bold",
    fontSize: 15,
  },
});
