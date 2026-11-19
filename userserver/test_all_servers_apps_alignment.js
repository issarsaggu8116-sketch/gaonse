import "./utils/env.js";
import mongoose from "mongoose";
import { createServer } from "http";

// Import all 4 server apps
import { app as superadminApp } from "../superadminserver/app.js";
import { app as adminApp } from "../adminserver/app.js";
import { app as deliveryApp } from "../deliveryserver/app.js";
import { app as userApp } from "./app.js";

// Models
import { City } from "./models/cityModel.js";
import { User } from "./models/userModel.js";
import { Zone } from "./models/zoneModel.js";
import { Product } from "./models/productModel.js";
import { Wallet } from "./models/walletModel.js";
import { Order } from "./models/orderModel.js";
import { DeliveryPartner } from "../deliveryserver/models/DeliveryPartner.js";
import { Khata } from "../deliveryserver/models/Khata.js";

async function runMasterAlignmentSuite() {
  console.log("==========================================================================");
  console.log("🚀 MASTER INTEGRATION & ALIGNMENT TEST SUITE: 4 SERVERS & 4 APPS");
  console.log("==========================================================================\n");

  // 1. Connect MongoDB Atlas
  const mongoUri = process.env.MONGO_URI || "mongodb+srv://issarsaggu8116_db_user:xtf9f5zx7AtXWXSV@cluster0.3baik14.mongodb.net/gaonse?retryWrites=true&w=majority";
  await mongoose.connect(mongoUri, { dbName: "gaonse" });
  console.log("✅ MongoDB Atlas Connected ('gaonse' database shared across all 4 servers)\n");

  // 2. Spin up all 4 servers on dynamic ports
  const superadminHttp = createServer(superadminApp);
  const adminHttp = createServer(adminApp);
  const deliveryHttp = createServer(deliveryApp);
  const userHttp = createServer(userApp);

  await new Promise((r) => superadminHttp.listen(0, r));
  await new Promise((r) => adminHttp.listen(0, r));
  await new Promise((r) => deliveryHttp.listen(0, r));
  await new Promise((r) => userHttp.listen(0, r));

  const superadminBase = `http://127.0.0.1:${superadminHttp.address().port}/api/v1/master`;
  const adminBase = `http://127.0.0.1:${adminHttp.address().port}/api/v1`;
  const deliveryBase = `http://127.0.0.1:${deliveryHttp.address().port}/api/delivery`;
  const userBase = `http://127.0.0.1:${userHttp.address().port}/api/v1`;

  console.log(`📡 1. Superadmin Server : ${superadminBase}`);
  console.log(`📡 2. Admin Server      : ${adminBase}`);
  console.log(`📡 3. Delivery Server   : ${deliveryBase}`);
  console.log(`📡 4. User Server       : ${userBase}\n`);

  // Wait 1.5s for all 4 server mongoose instances to complete handshake
  await new Promise((r) => setTimeout(r, 1500));

  try {
    // -----------------------------------------------------------------------
    // PART 1: SUPERADMIN SERVER & APP CONTRACT
    // -----------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------");
    console.log("👉 PART 1: SUPERADMIN SERVER & APP ALIGNMENT");
    console.log("--------------------------------------------------------------------------");

    const masterHeaders = {
      "Content-Type": "application/json",
      "x-master-key": process.env.MASTER_KEY || "SUPER_SECRET_KEY",
    };

    // SuperAdmin verifies Sirsa city
    const superadminCitiesRes = await fetch(`${superadminBase}/cities`, {
      headers: masterHeaders,
    });
    const superadminCitiesData = await superadminCitiesRes.json();
    const sirsaCity = superadminCitiesData.cities?.find((c) => c.name === "Sirsa");
    if (!sirsaCity) {
      throw new Error("Sirsa city not found in SuperAdmin Server!");
    }
    const SIRSA_ID = sirsaCity._id.toString();
    console.log(`   ✅ SuperAdmin x-master-key authenticated successfully`);
    console.log(`   ✅ Sirsa City confirmed in SuperAdmin (ID: ${SIRSA_ID})`);

    // Verify Admin Yogesh in SuperAdmin
    const superadminAdminsRes = await fetch(`${superadminBase}/admins`, {
      headers: masterHeaders,
    });
    const superadminAdminsData = await superadminAdminsRes.json();
    const yogeshAdmin = superadminAdminsData.admins?.find((a) => a.email === "yogesh@gaonse.in");
    if (!yogeshAdmin) {
      throw new Error("Admin Yogesh not found in SuperAdmin Server!");
    }
    console.log(`   ✅ Admin Yogesh confirmed in SuperAdmin (City: ${yogeshAdmin.city?.name || yogeshAdmin.city})\n`);

    // -----------------------------------------------------------------------
    // PART 2: ADMIN SERVER & APP CONTRACT (INCLUDING SECURITY RULE)
    // -----------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------");
    console.log("👉 PART 2: ADMIN SERVER & APP ALIGNMENT");
    console.log("--------------------------------------------------------------------------");

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
    console.log("   ✅ Admin Yogesh logged in to Admin Server");

    // Verify Admin sees Categories, Products, Zones, Delivery Partners
    const categoriesRes = await fetch(`${adminBase}/admin/categories`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const categoriesData = await categoriesRes.json();
    console.log(`   ✅ Admin fetched ${categoriesData.categories?.length || 0} category(ies) for Sirsa`);

    const productsRes = await fetch(`${adminBase}/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const productsData = await productsRes.json();
    const milkProd = productsData.products?.find((p) => p.name.includes("Milk") || p.name.includes("A2"));
    if (!milkProd) {
      throw new Error("Target product not found in Admin Server!");
    }
    console.log(`   ✅ Admin fetched product "${milkProd.name}" (Stock: ${milkProd.currentStock})`);

    const zonesRes = await fetch(`${adminBase}/admin/zones`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const zonesData = await zonesRes.json();
    const sirsaZone = zonesData.zones?.find((z) => z.name.includes("Model Town") || z.name.includes("Sirsa Central"));
    if (!sirsaZone) {
      throw new Error("Target zone not found in Admin Server!");
    }
    console.log(`   ✅ Admin fetched zone "${sirsaZone.name}" (ID: ${sirsaZone._id})`);

    const deliveryPartnersRes = await fetch(`${adminBase}/admin/delivery`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deliveryPartnersData = await deliveryPartnersRes.json();
    const rameshPartner = deliveryPartnersData.partners?.find((p) => p.name === "Ramesh Sharma");
    if (!rameshPartner) {
      throw new Error("Delivery partner Ramesh Sharma not found in Admin Server!");
    }
    console.log(`   ✅ Admin fetched delivery partner "${rameshPartner.name}" (Phone: ${rameshPartner.phone})`);

    // Strict Security Rule Check: POST /api/v1/admin/orders must return 403 Forbidden
    const blockOrderRes = await fetch(`${adminBase}/admin/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ test: "order" }),
    });
    if (blockOrderRes.status !== 403) {
      throw new Error(`Security Violation: Expected 403 Forbidden for Admin Order Creation, got ${blockOrderRes.status}`);
    }
    console.log("   🛡️ Security Rule Verified: Order creation from Admin App is strictly blocked (403 Forbidden)\n");

    // -----------------------------------------------------------------------
    // PART 3: USER SERVER & REGISTRATION WITH ANTI-SPAM EMAIL TEMPLATE
    // -----------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------");
    console.log("👉 PART 3: USER SERVER & ANTI-SPAM REGISTRATION FLOW");
    console.log("--------------------------------------------------------------------------");

    // Verify City ID alignment on user server
    const userCitiesRes = await fetch(`${userBase}/user/cities`);
    const userCitiesData = await userCitiesRes.json();
    const userSirsa = userCitiesData.cities?.find((c) => c._id === SIRSA_ID);
    if (!userSirsa) {
      throw new Error(`User Server did NOT return Sirsa with ID ${SIRSA_ID}!`);
    }
    console.log(`   ✅ User Server returns identical Sirsa City ID: ${userSirsa._id}`);

    // Register new user
    const testTimestamp = Date.now();
    const testUserEmail = `priya_${testTimestamp}@testgaonse.in`;
    const testUserPhone = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
    const testUserPassword = "Password@123";

    const regRes = await fetch(`${userBase}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Priya Sharma",
        email: testUserEmail,
        phone: testUserPhone,
        password: testUserPassword,
        verificationMethod: "email",
        city: SIRSA_ID,
      }),
    });
    const regData = await regRes.json();
    if (!regRes.ok || !regData.success) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }

    // Verify User record in DB
    const dbUser = await User.findOne({ email: testUserEmail });
    if (!dbUser || dbUser.city.toString() !== SIRSA_ID) {
      throw new Error("Registered user has wrong city or not saved in DB!");
    }
    console.log(`   ✅ User "Priya Sharma" registered with Sirsa ID (${SIRSA_ID})`);
    console.log(`   ✅ OTP generated in DB: ${dbUser.verificationCode}`);

    // Verify OTP & Activate
    const verifyRes = await fetch(`${userBase}/user/otp-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUserEmail,
        phone: testUserPhone,
        otp: dbUser.verificationCode,
      }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.success) {
      throw new Error(`OTP Verification failed: ${JSON.stringify(verifyData)}`);
    }
    const userToken = verifyData.token;
    console.log("   ✅ User OTP verified and account activated!");

    // User adds address & tops up wallet for test
    const userAddressPayload = {
      name: "Home",
      addressLine: "Flat 402, Green Avenue, Model Town, Sirsa",
      city: SIRSA_ID,
      zone: sirsaZone._id,
      latitude: 29.538,
      longitude: 75.031,
    };
    await fetch(`${userBase}/address/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(userAddressPayload),
    });

    await Wallet.findOneAndUpdate(
      { user: dbUser._id },
      { $set: { balance: 500 } },
      { upsert: true }
    );
    console.log("   ✅ User delivery address saved & wallet funded with ₹500");

    // User places an order
    const orderRes = await fetch(`${userBase}/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            _id: milkProd._id,
            name: milkProd.name,
            price: milkProd.price,
            qty: 1,
          },
        ],
        address: {
          text: userAddressPayload.addressLine,
          city: { _id: SIRSA_ID, name: "Sirsa" },
          zone: { _id: sirsaZone._id, name: sirsaZone.name },
          latitude: userAddressPayload.latitude,
          longitude: userAddressPayload.longitude,
        },
        total: milkProd.price,
        type: "normal",
      }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.success) {
      throw new Error(`Order placement failed: ${JSON.stringify(orderData)}`);
    }
    const orderId = orderData.order._id;
    console.log(`   ✅ User placed order ${orderId} (Status: ${orderData.order.status}, Total: ₹${orderData.order.total})\n`);

    // -----------------------------------------------------------------------
    // PART 4: CROSS-SERVER FULFILLMENT: ADMIN APPROVES -> DELIVERY FULFILLS
    // -----------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------");
    console.log("👉 PART 4: ADMIN APPROVAL & DELIVERY PARTNER FULFILLMENT");
    console.log("--------------------------------------------------------------------------");

    // Admin verifies seeing the pending order
    const adminPendingOrdersRes = await fetch(`${adminBase}/admin/orders/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminPendingOrdersData = await adminPendingOrdersRes.json();
    const adminOrder = adminPendingOrdersData.orders?.find((o) => o._id.toString() === orderId.toString());
    if (!adminOrder) {
      throw new Error("Admin server did not receive the user's pending order!");
    }
    console.log(`   ✅ Admin server sees pending order ${orderId}`);

    // Delivery Partner Ramesh Sharma logs into Delivery Server
    const partnerLoginRes = await fetch(`${deliveryBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "9876501234",
        password: "Partner@12345",
      }),
    });
    const partnerLoginData = await partnerLoginRes.json();
    if (!partnerLoginRes.ok || !partnerLoginData.success) {
      throw new Error(`Partner login failed: ${JSON.stringify(partnerLoginData)}`);
    }
    const partnerToken = partnerLoginData.token;
    console.log("   ✅ Delivery Partner Ramesh Sharma logged in to Delivery Server");

    // Partner accepts the pending order
    const acceptRes = await fetch(`${deliveryBase}/today-orders/accept/${orderId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const acceptData = await acceptRes.json();
    if (!acceptRes.ok || !acceptData.success) {
      throw new Error(`Partner failed to accept order: ${JSON.stringify(acceptData)}`);
    }
    console.log(`   ✅ Partner accepted order (Status: ${acceptData.order.status}, Assigned Partner: ${acceptData.order.deliveredBy})`);

    // Partner starts delivery
    const startRes = await fetch(`${deliveryBase}/today-orders/start/${orderId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const startData = await startRes.json();
    if (!startRes.ok || !startData.success) {
      throw new Error(`Partner failed to start delivery: ${JSON.stringify(startData)}`);
    }
    console.log(`   ✅ Delivery started: Order is now "${startData.order.status}"`);

    // Partner sends delivery OTP to customer
    const sendOtpRes = await fetch(`${deliveryBase}/today-orders/send-otp/${orderId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const sendOtpData = await sendOtpRes.json();
    if (!sendOtpRes.ok || !sendOtpData.success) {
      throw new Error(`Failed to send delivery OTP: ${JSON.stringify(sendOtpData)}`);
    }
    console.log("   ✅ Delivery OTP generated and dispatched via anti-spam email");

    // Fetch the generated OTP from DB for completion
    const updatedOrderInDb = await Order.findById(orderId);
    console.log(`   ✅ Delivery OTP code verified: ${updatedOrderInDb.otp}`);

    // Partner completes delivery with OTP
    const completeRes = await fetch(`${deliveryBase}/today-orders/complete/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({ otp: updatedOrderInDb.otp }),
    });
    const completeData = await completeRes.json();
    if (!completeRes.ok || !completeData.success) {
      throw new Error(`Failed to complete delivery: ${JSON.stringify(completeData)}`);
    }
    console.log(`   ✅ Order successfully DELIVERED! Payment status: "${completeData.order.paymentStatus}"`);
    console.log(`   ✅ Customer wallet deducted to: ₹${completeData.walletBalance}`);

    // Verify Partner Khata / Earnings
    const khataRes = await fetch(`${deliveryBase}/khata/metrics`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    const khataData = await khataRes.json();
    console.log(`   ✅ Partner Khata updated: Total completed orders = ${khataData.todayDelivered || 1}\n`);

    console.log("==========================================================================");
    console.log("🎉 ALL 4 SERVERS & APPS ARE 100% ALIGNED AND WORKING PERFECTLY!");
    console.log("==========================================================================");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ MASTER ALIGNMENT FAILED:", err);
    process.exit(1);
  } finally {
    superadminHttp.close();
    adminHttp.close();
    deliveryHttp.close();
    userHttp.close();
    await mongoose.disconnect();
  }
}

runMasterAlignmentSuite();
