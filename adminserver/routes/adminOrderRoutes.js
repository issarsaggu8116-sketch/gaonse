import express from "express";
import {
  getPendingOrders,
  approveOrder,
  cancelOrder,
  getAllOrders,
  unassignOrder,
} from "../controllers/adminOrderController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin Order route is working ",
    time: new Date(),
  });
});

router.get("/pending", isAuthenticated, getPendingOrders);
router.get("/all", isAuthenticated, getAllOrders);
router.put("/approve/:id", isAuthenticated, approveOrder);
router.put("/cancel/:id", isAuthenticated, cancelOrder);
router.put("/unassign/:id", isAuthenticated, unassignOrder);

// 🚫 STRICT SECURITY RULE: Order creation is strictly prohibited from the Admin App
router.post(/.*/, (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Access Denied: Orders cannot be created from the Admin app. Orders can only be placed by customers via the Gaonse customer app.",
  });
});

export default router;
