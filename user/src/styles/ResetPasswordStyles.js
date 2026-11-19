import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  container: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 30,
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",

    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  heading: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
  },

  subText: {
    fontSize: 14,
    marginBottom: 20,
    color: "#666",
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
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
});

export default styles;