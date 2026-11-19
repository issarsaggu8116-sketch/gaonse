import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";

import { expirePendingOrders } from "./jobs/expireOrder.js";
import { generateTodaySubscriptionOrders } from "./jobs/subscriptionOrder.js";

dotenv.config();

const server = createServer(app);

// 🔌 SOCKET.IO Setup
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("⚡ Partner connected:", socket.id);

  socket.on("joinZone", (zoneId) => {
    socket.join(zoneId);
    console.log(`📍 Partner joined zone: ${zoneId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Partner disconnected:", socket.id);
  });
});

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, { dbName: "gaonse" })
  .then(() => {
    console.log("✅ DB Connected (Delivery)");

    expirePendingOrders();
    generateTodaySubscriptionOrders();
  })
  .catch((err) => console.log("DB ERROR:", err));

const PORT = process.env.PORT || 4001;

server.listen(PORT, () => {
  console.log(`🚚 Delivery Server running on port ${PORT}`);
});

export { server };
