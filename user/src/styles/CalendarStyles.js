import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6ddc6",
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  back: {
    fontSize: 18,
    marginRight: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },

  arrow: {
    fontSize: 20,
  },

  month: {
    fontSize: 16,
    fontWeight: "600",
  },

  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  dayText: {
    width: "14%",
    textAlign: "center",
    color: "#444",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dateBox: {
    width: "14%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  dateText: {
    color: "#333",
  },

  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  legendItem: {
    fontSize: 12,
  },

  dateCard: {
    marginTop: 20,
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
  },

  dateCardText: {
    fontSize: 14,
  },
});