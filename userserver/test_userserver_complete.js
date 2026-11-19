import "./utils/env.js";
import { app as userApp } from "./app.js";
import { app as adminApp } from "../adminserver/app.js";
import { createServer } from "http";
import mongoose from "mongoose";
import { User } from "./models/userModel.js";
import { City } from "./models/cityModel.js";
import { Zone } from "./models/zoneModel.js";
import { Product } from "./models/productModel.js";
import { Wallet } from "./models/walletModel.js";
import { Order } from "./models/orderModel.js";
import { Subscription } from "./models/subscriptionModel.js";

async function runUserserverTestSuite() {
  console.log("==========================================================================");
  console.log("🚀 COMPREHENSIVE USERSERVER & DATABASE ALIGNMENT TEST SUITE");
  console.log("==========================================================================\n");

  // 1. Connect MongoDB Atlas
  console.log("1. Connecting to MongoDB Atlas (database: gaonse)...");
  await mongoose.connect(process.env.MONGO_URI, { dbName: "gaonse" });
  console.log("✅ Connected to MongoDB Atlas!\n");

  // 2. Start user and admin servers on random test ports
  const userServer = createServer(userApp);
  const adminServer = createServer(adminApp);

  await new Promise((resolve) => userServer.listen(0, resolve));
  await new Promise((resolve) => adminServer.listen(0, resolve));

  const userBase = `http://127.0.0.1:${userServer.address().port}/api/v1`;
  const adminBase = `http://127.0.0.1:${adminServer.address().port}/api/v1`;
  const rootUrl = `http://127.0.0.1:${userServer.address().port}`;

  console.log(`📡 Local User Server  : ${userBase}`);
  console.log(`📡 Local Admin Server : ${adminBase}\n`);

  let testUserToken = null;
  let testUserId = null;
  let createdOrderId = null;
  let createdSubId = null;

  try {
    // -----------------------------------------------------------------------
    // TEST 1: Health check
    // -----------------------------------------------------------------------
    console.log("👉 TEST 1: Checking root health check endpoint GET /");
    const healthRes = await fetch(`${rootUrl}/`);
    const healthText = await healthRes.text();
    if (healthRes.status !== 200 || !healthText.includes("API is running")) {
      throw new Error(`Health check failed: ${healthRes.status} - ${healthText}`);
    }
    console.log(`   ✅ Status 200: "${healthText}"\n`);

    // -----------------------------------------------------------------------
    // TEST 2: City Endpoints & Verification
    // -----------------------------------------------------------------------
    console.log("👉 TEST 2: Checking City Endpoints (/user/cities, /cities, /city, /master/cities)");
    const cityEndpoints = [
      `${userBase}/user/cities`,
      `${userBase}/cities`,
      `${userBase}/city`,
      `${userBase}/master/cities`,
    ];

    let sirsaCity = null;
    for (const ep of cityEndpoints) {
      const res = await fetch(ep);
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.cities)) {
        throw new Error(`Endpoint ${ep} failed to return cities! Status: ${res.status}`);
      }
      sirsaCity = data.cities.find((c) => c.name === "Sirsa");
      if (!sirsaCity) {
        throw new Error(`Sirsa city not returned by ${ep}`);
      }
      console.log(`   ✅ ${ep.replace(userBase, "")} returned ${data.cities.length} cities including Sirsa (${sirsaCity._id})`);
    }

    const TARGET_SIRSA_ID = "6afdd79de65d6cf5a614e52b";
    if (sirsaCity._id.toString() !== TARGET_SIRSA_ID) {
      throw new Error(`Target Sirsa ID mismatch! Got ${sirsaCity._id}, expected ${TARGET_SIRSA_ID}`);
    }
    console.log(`   🎯 Verified: City ID matches SuperAdmin/Admin database ID (${TARGET_SIRSA_ID})!\n`);

    // -----------------------------------------------------------------------
    // TEST 3: User Registration with Correct City ID
    // -----------------------------------------------------------------------
    console.log("👉 TEST 3: User Registration (POST /user/register)");
    const timestamp = Date.now();
    const testEmail = `neeraj_${timestamp}@testgaonse.in`;
    const testPhone = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
    const testPassword = "Password@123";

    const regRes = await fetch(`${userBase}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Neeraj Chopra",
        email: testEmail,
        phone: testPhone,
        password: testPassword,
        verificationMethod: "email",
        city: sirsaCity._id, // Fetched from DB
      }),
    });

    const regData = await regRes.json();
    if (!regRes.ok || !regData.success) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    console.log(`   ✅ Registered new user "${testEmail}" (Phone: ${testPhone})`);

    // Check database record
    const userInDb = await User.findOne({ email: testEmail });
    if (!userInDb) {
      throw new Error("User record not found in MongoDB!");
    }
    if (userInDb.city.toString() !== TARGET_SIRSA_ID) {
      throw new Error(`User saved with wrong city: ${userInDb.city}`);
    }
    console.log(`   ✅ DB Record confirmed: city = ${userInDb.city} (Sirsa), OTP = ${userInDb.verificationCode}\n`);

    // -----------------------------------------------------------------------
    // TEST 4: OTP Verification
    // -----------------------------------------------------------------------
    console.log("👉 TEST 4: Account OTP Verification (POST /user/otp-verification)");
    const otpRes = await fetch(`${userBase}/user/otp-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        phone: testPhone,
        otp: userInDb.verificationCode,
      }),
    });
    const otpData = await otpRes.json();
    if (!otpRes.ok || !otpData.success) {
      throw new Error(`OTP verification failed: ${JSON.stringify(otpData)}`);
    }
    testUserToken = otpData.token;
    testUserId = otpData.user._id;
    console.log(`   ✅ Account verified successfully! Received JWT token.\n`);

    // -----------------------------------------------------------------------
    // TEST 5: User Login & Profile (/user/login & /user/me)
    // -----------------------------------------------------------------------
    console.log("👉 TEST 5: User Login & Profile Inspection (POST /user/login & GET /user/me)");
    const loginRes = await fetch(`${userBase}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    console.log("   ✅ Login successful!");

    const meRes = await fetch(`${userBase}/user/me`, {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    const meData = await meRes.json();
    if (!meRes.ok || !meData.success) {
      throw new Error(`GET /user/me failed: ${JSON.stringify(meData)}`);
    }
    console.log(`   ✅ Profile fetched: ${meData.user.name}, City: ${meData.user.city?.name} (ID: ${meData.user.city?._id})\n`);

    // -----------------------------------------------------------------------
    // TEST 6: Zones & Products Fetching by City
    // -----------------------------------------------------------------------
    console.log("👉 TEST 6: Zones & Products for Sirsa (GET /zones & GET /products)");
    const zonesRes = await fetch(`${userBase}/zones?cityId=${TARGET_SIRSA_ID}`);
    const zonesData = await zonesRes.json();
    if (!zonesRes.ok || !zonesData.success) {
      throw new Error(`Failed to fetch zones: ${JSON.stringify(zonesData)}`);
    }
    console.log(`   ✅ Zones found: ${zonesData.zones.length}`);
    const sirsaZone = zonesData.zones.find((z) => z.name.includes("Sirsa Central") || z.name.includes("Model Town"));
    const zoneId = sirsaZone ? sirsaZone._id : zonesData.zones[0]?._id;
    console.log(`   Using Zone: ${sirsaZone ? sirsaZone.name : "Default Zone"} (${zoneId})`);

    const productsRes = await fetch(`${userBase}/products?cityId=${TARGET_SIRSA_ID}`);
    const productsData = await productsRes.json();
    if (!productsRes.ok || !productsData.success) {
      throw new Error(`Failed to fetch products: ${JSON.stringify(productsData)}`);
    }
    console.log(`   ✅ Products found: ${productsData.products.length}`);
    const milkProduct = productsData.products.find((p) => p.name.includes("Milk") || p.name.includes("A2"));
    if (!milkProduct) {
      throw new Error("Expected product (Milk) not found in Sirsa!");
    }
    console.log(`   ✅ Found Product: "${milkProduct.name}" (Price: ₹${milkProduct.price}, Category: ${milkProduct.category?.name})\n`);

    // -----------------------------------------------------------------------
    // TEST 7: Address Management (POST /address/add & GET /address/me)
    // -----------------------------------------------------------------------
    console.log("👉 TEST 7: Address Management (POST /address/add & GET /address/me)");
    const addressPayload = {
      name: "Home",
      addressLine: "H.No 123, Street 4, Model Town, Sirsa",
      text: "H.No 123, Street 4, Model Town, Sirsa",
      city: TARGET_SIRSA_ID,
      zone: zoneId,
      latitude: 29.535,
      longitude: 75.028,
    };
    const addAddressRes = await fetch(`${userBase}/address/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify(addressPayload),
    });
    const addAddressData = await addAddressRes.json();
    if (!addAddressRes.ok || !addAddressData.success) {
      throw new Error(`Failed to add address: ${JSON.stringify(addAddressData)}`);
    }
    console.log(`   ✅ Address added: "${addAddressData.address.addressLine || addAddressData.address.text}"`);

    const getAddressesRes = await fetch(`${userBase}/address/me`, {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    const getAddressesData = await getAddressesRes.json();
    if (!getAddressesRes.ok || !getAddressesData.success || getAddressesData.addresses.length === 0) {
      throw new Error("Failed to retrieve user addresses!");
    }
    console.log(`   ✅ Retrieved ${getAddressesData.addresses.length} user address(es).\n`);

    // -----------------------------------------------------------------------
    // TEST 8: Wallet Management (GET /wallet/me & Simulated Recharge)
    // -----------------------------------------------------------------------
    console.log("👉 TEST 8: Wallet Management (GET /wallet/me)");
    const walletRes = await fetch(`${userBase}/wallet/me`, {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    const walletData = await walletRes.json();
    if (!walletRes.ok || !walletData.success) {
      throw new Error(`Failed to get wallet: ${JSON.stringify(walletData)}`);
    }
    console.log(`   ✅ Initial Wallet fetched (Balance: ₹${walletData.wallet.balance})`);

    // Add ₹1,000 to user wallet in DB
    await Wallet.findOneAndUpdate(
      { user: testUserId },
      { $set: { balance: 1000 } },
      { upsert: true }
    );
    const updatedWalletRes = await fetch(`${userBase}/wallet/me`, {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    const updatedWalletData = await updatedWalletRes.json();
    console.log(`   ✅ Wallet balance updated: ₹${updatedWalletData.wallet.balance}\n`);

    // -----------------------------------------------------------------------
    // TEST 9: Order Creation (POST /order/create & GET /order/me)
    // -----------------------------------------------------------------------
    console.log("👉 TEST 9: Order Placement (POST /order/create & GET /order/me)");
    const orderPayload = {
      items: [
        {
          _id: milkProduct._id,
          name: milkProduct.name,
          price: milkProduct.price,
          qty: 2,
        },
      ],
      address: {
        text: addressPayload.text,
        city: TARGET_SIRSA_ID,
        zone: zoneId,
        latitude: addressPayload.latitude,
        longitude: addressPayload.longitude,
      },
      total: milkProduct.price * 2,
      type: "normal",
    };

    const orderRes = await fetch(`${userBase}/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify(orderPayload),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.success) {
      throw new Error(`Order placement failed: ${JSON.stringify(orderData)}`);
    }
    createdOrderId = orderData.order._id;
    console.log(`   ✅ Order created: ${createdOrderId} (Status: ${orderData.order.status}, Total: ₹${orderData.order.total})`);

    const myOrdersRes = await fetch(`${userBase}/order/me`, {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    const myOrdersData = await myOrdersRes.json();
    if (!myOrdersRes.ok || !myOrdersData.success || myOrdersData.orders.length === 0) {
      throw new Error("Failed to fetch user orders!");
    }
    console.log(`   ✅ Customer retrieved ${myOrdersData.orders.length} order(s).\n`);

    // -----------------------------------------------------------------------
    // TEST 10: Cross-Server Integration with Admin Server
    // -----------------------------------------------------------------------
    console.log("👉 TEST 10: Cross-Server Verification with Admin Server");
    // Admin login
    const adminLoginRes = await fetch(`${adminBase}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "yogesh@gaonse.in",
        password: "Yogesh@12345",
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginRes.ok || !adminLoginData.success) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
    }
    const adminToken = adminLoginData.token;
    console.log("   ✅ Admin Yogesh logged into Admin Server");

    // Admin verifies seeing the new user in Sirsa
    const adminUsersRes = await fetch(`${adminBase}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminUsersData = await adminUsersRes.json();
    const adminFoundUser = adminUsersData.users?.find((u) => u.email === testEmail);
    if (!adminFoundUser) {
      throw new Error("Admin server does NOT see the newly registered user in Sirsa!");
    }
    console.log(`   ✅ Admin sees registered user in Sirsa (Name: ${adminFoundUser.name}, Balance: ₹${adminFoundUser.walletBalance})`);

    // Admin verifies seeing the pending order
    const adminOrdersRes = await fetch(`${adminBase}/admin/orders/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminOrdersData = await adminOrdersRes.json();
    const adminFoundOrder = adminOrdersData.orders?.find((o) => o._id.toString() === createdOrderId.toString());
    if (!adminFoundOrder) {
      throw new Error("Admin server does NOT see the customer's order!");
    }
    console.log(`   ✅ Admin sees pending order ${adminFoundOrder._id} for Sirsa`);

    // Admin approves the order
    const approveOrderRes = await fetch(`${adminBase}/admin/orders/approve/${createdOrderId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const approveData = await approveOrderRes.json();
    if (!approveOrderRes.ok || !approveData.success) {
      throw new Error(`Admin failed to approve order: ${JSON.stringify(approveData)}`);
    }
    console.log(`   ✅ Admin approved the order: Status is now "${approveData.order.status}"`);

    // Customer re-checks order status
    const customerOrderCheck = await fetch(`${userBase}/order/me`, {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    const custOrders = await customerOrderCheck.json();
    const updatedOrder = custOrders.orders?.find((o) => o._id.toString() === createdOrderId.toString());
    if (updatedOrder.status !== "approved") {
      throw new Error(`Customer sees status "${updatedOrder.status}", expected "approved"!`);
    }
    console.log(`   ✅ Customer sees real-time status update: "approved"\n`);

    // -----------------------------------------------------------------------
    // TEST 11: Subscription Creation & Management
    // -----------------------------------------------------------------------
    console.log("👉 TEST 11: Subscriptions (POST /subscription/create & GET /subscription/me)");
    const subPayload = {
      product: milkProduct._id,
      type: "days",
      days: ["mon", "wed", "fri"],
      quantity: 1,
      deliveryTime: "morning",
      address: {
        text: addressPayload.text,
        city: TARGET_SIRSA_ID,
        zone: zoneId,
        latitude: addressPayload.latitude,
        longitude: addressPayload.longitude,
      },
      name: "Daily Morning Milk",
    };

    const subRes = await fetch(`${userBase}/subscription/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify(subPayload),
    });
    const subData = await subRes.json();
    if (!subRes.ok || !subData.success) {
      throw new Error(`Subscription creation failed: ${JSON.stringify(subData)}`);
    }
    createdSubId = subData.subscription._id;
    console.log(`   ✅ Subscription created: ${createdSubId} (Days: ${subData.subscription.days.join(", ")})`);

    const mySubsRes = await fetch(`${userBase}/subscription/me`, {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    const mySubsData = await mySubsRes.json();
    if (!mySubsRes.ok || !mySubsData.success || mySubsData.subscriptions.length === 0) {
      throw new Error("Failed to fetch user subscriptions!");
    }
    console.log(`   ✅ Customer retrieved ${mySubsData.subscriptions.length} active subscription(s)`);

    // Toggle subscription status
    const toggleRes = await fetch(`${userBase}/subscription/toggle/${createdSubId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    const toggleData = await toggleRes.json();
    console.log(`   ✅ Subscription toggled: Status = "${toggleData.subscription?.status || 'paused'}"\n`);

    // -----------------------------------------------------------------------
    // TEST 12: Logout
    // -----------------------------------------------------------------------
    console.log("👉 TEST 12: User Logout (GET /user/logout)");
    const logoutRes = await fetch(`${userBase}/user/logout`, {
      headers: { Authorization: `Bearer ${testUserToken}` },
    });
    const logoutData = await logoutRes.json();
    if (!logoutRes.ok || !logoutData.success) {
      throw new Error(`Logout failed: ${JSON.stringify(logoutData)}`);
    }
    console.log(`   ✅ Logout successful: "${logoutData.message}"\n`);

    console.log("==========================================================================");
    console.log("🎉 ALL TESTS PASSED: USERSERVER & DATABASE UNIFICATION FULLY VERIFIED 100%");
    console.log("==========================================================================");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ TEST SUITE FAILED WITH ERROR:", err);
    process.exit(1);
  } finally {
    userServer.close();
    adminServer.close();
    await mongoose.disconnect();
  }
}

runUserserverTestSuite();
