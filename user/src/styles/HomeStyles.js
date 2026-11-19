import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#e6ddc6",
  paddingTop: 10, // slight breathing space
},

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },

  logo: {
    fontSize: 20,
    fontWeight: "bold",
  },

  headerIcons: {
    flexDirection: "row",
    gap: 15,
  },

  icon: {
    fontSize: 18,
  },

  banner: {
    height: 150,
    backgroundColor: "#bdbdbd",
    borderRadius: 12,
    margin: 16,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 10,
  },

  imagePlaceholder: {
    width: 90,
    height: 90,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },

  cardContent: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontWeight: "bold",
    fontSize: 14,
  },

  desc: {
    fontSize: 12,
    color: "#555",
    marginBottom: 8,
  },

  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 5,
  },

  logoutButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#000",
    padding: 8,
    borderRadius: 8,
  },

  logoutText: {
    color: "#fff",
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "#7a4b00",
  },
});