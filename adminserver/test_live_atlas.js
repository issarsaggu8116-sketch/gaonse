import { app } from "./app.js";
import { createServer } from "http";
import mongoose from "mongoose";

async function testLive() {
  console.log("Checking MongoDB Atlas connection...");
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB Connected successfully to Atlas!\n");
  } catch (err) {
    console.error("❌ MongoDB Atlas Connection Failed:", err.message);
    console.log("\n👉 Please whitelist your current public IP in MongoDB Atlas:");
    console.log("   Current Public IP: 157.48.201.208 (or add 0.0.0.0/0 for all access)");
    console.log("   Atlas Dashboard -> Security -> Network Access -> Add IP Address\n");
    process.exit(1);
  }

  const server = createServer(app);
  server.listen(0, async () => {
    const base = "http://127.0.0.1:" + server.address().port;

    console.log("Attempting sign-in for admin Yogesh created through SuperAdmin...");
    const loginRes = await fetch(base + "/api/v1/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "yogesh@gaonse.in", password: "Yogesh@12345" }),
    });

    const loginData = await loginRes.json();
    console.log("Status:", loginRes.status);
    console.log("Response:", JSON.stringify(loginData, null, 2));

    if (loginData.success && loginData.token) {
      console.log("\n✅ Successfully authenticated with admin Yogesh!");
      console.log("Token:", loginData.token.substring(0, 30) + "...");

      // Test a protected route live
      const testRes = await fetch(base + "/api/v1/admin/dashboard", {
        headers: { "Authorization": "Bearer " + loginData.token },
      });
      console.log("Dashboard Status:", testRes.status, await testRes.json());
    } else {
      console.error("❌ Login failed:", loginData);
    }

    server.close();
    process.exit(0);
  });
}

testLive();
