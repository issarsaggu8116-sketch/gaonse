import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  authPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  authContainer: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 30,
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",

    // shadow (Android + iOS)
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  authToggle: {
    flexDirection: "row",
    marginBottom: 20,
    width: "100%",
  },

  toggleBtn: {
    width: "50%",
    paddingVertical: 10,
    backgroundColor: "#ddd",
    alignItems: "center",
  },

  activeToggle: {
    backgroundColor: "#0cbb69",
  },

  toggleText: {
    fontSize: 16,
  },

  activeText: {
    color: "#fff",
  },

  heading: {
    marginBottom: 20,
    fontSize: 22,
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },

  phoneContainer: {
    width: "100%",
    position: "relative",
    marginBottom: 15,
  },

  phonePrefix: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 50,
    height: 40,
    borderRightWidth: 1,
    borderColor: "gray",
    justifyContent: "center",
    alignItems: "center",
  },

  phoneInput: {
    paddingLeft: 55,
  },

  button: {
    width: "100%",
    padding: 12,
    backgroundColor: "#0cbb69",
    borderRadius: 5,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
  },

  verificationText: {
    fontWeight: "500",
    color: "gray",
    alignSelf: "flex-start",
  },

  verificationWrapper: {
    flexDirection: "row",
    gap: 30,
    marginVertical: 15,
  },

  label: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginVertical: 10,
  },

  forgotText: {
    color: "gray",
    textDecorationLine: "underline",
  },
});

export default styles;
