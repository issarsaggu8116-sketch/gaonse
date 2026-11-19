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

  /* BALANCE */
  balanceCard: {
    backgroundColor: "#FFFDF8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E8DDD0",
    elevation: 2,
  },

  balanceLabel: {
    fontSize: 14,
    color: "#444",
  },

  balanceAmount: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },

  /* RECHARGE */
  rechargeCard: {
    backgroundColor: "#6D4C41",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },

  rechargeTitle: {
    color: "#fff",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  quickBtn: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 8,
  },

  addBtn: {
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  /* PROMO */
  promoCard: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  /* TRANSACTIONS */
  transactionCard: {
    backgroundColor: "#FFFDF8",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E8DDD0",
    elevation: 2,
  },

  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  transactionBox: {
    height: 150,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },
});