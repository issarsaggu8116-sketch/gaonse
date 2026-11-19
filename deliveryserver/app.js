import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import subOrderRoutes from "./routes/deliverySubscriptionOrderRoutes.js";
import deliveryAuthRoutes from "./routes/deliveryAuthRoutes.js";
import deliveryOrderRoutes from "./routes/deliveryOrderRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import khataRoutes from "./routes/khataRoutes.js";

import { expirePendingOrders } from "./jobs/expireOrder.js";
import { generateTodaySubscriptionOrders } from "./jobs/subscriptionOrder.js";

dotenv.config();

export const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Middleware to attach socket.io to req if available
app.use((req, res, next) => {
  if (global.io) {
    req.io = global.io;
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI, { dbName: "gaonse" })
    .then(() => console.log("✅ DB Connected (Delivery)"))
    .catch((err) => console.log("Delivery DB Error:", err.message));
}

// Health Check
app.get("/", (req, res) => {
  res.send("🚚 Delivery API is running");
});

// 🚦 ROUTES
app.use("/api/delivery/auth", deliveryAuthRoutes);
app.use("/api/delivery/today-orders", deliveryOrderRoutes);
app.use("/api/delivery/subscribe-orders", subOrderRoutes);
app.use("/api/delivery/cities", cityRoutes);
app.use("/api/delivery/users", userRoutes);
app.use("/api/delivery/khata", khataRoutes);

export default app;
