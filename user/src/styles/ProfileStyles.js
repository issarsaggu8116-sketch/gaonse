import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fae8c3",
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  back: {
    fontSize: 18,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  logoutIcon: {
    fontSize: 18,
  },

  card: {
    backgroundColor: "#FFFDF8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8DDD0",
    elevation: 2,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  cardSub: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },

  arrow: {
    fontSize: 18,
    color: "#888",
  },
});