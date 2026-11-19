import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Admin server app
import { app as adminApp } from "./app.js";

// Ensure MASTER_KEY is set for superadmin
process.env.MASTER_KEY = process.env.MASTER_KEY || "SUPER_SECRET_KEY";

// Load SuperAdmin server app
// In superadminserver, server.js creates express app directly, let's load express and masterRoutes
import express from "express";
import cors from "cors";
import masterRoutes from "../superadminserver/routes/masterRoutes.js";

const superAdminApp = express();
superAdminApp.use(cors());
superAdminApp.use(express.json());
superAdminApp.use("/api/v1/master", masterRoutes);

dotenv.config();

async function runAlignmentCheck() {
  console.log("==========================================================================");
  console.log("GAON SE: VERIFYING FRONTEND APPS & BACKEND SERVERS ALIGNMENT");
  console.log("==========================================================================");

  await mongoose.connect(process.env.MONGO_URI);
  try {
    const superAdminMongoose = (await import("../superadminserver/node_modules/mongoose/index.js")).default;
    await superAdminMongoose.connect(process.env.MONGO_URI);
  } catch (e) {
    console.log("Superadmin mongoose connect:", e.message);
  }
  console.log("✅ MongoDB Connected to Atlas successfully for both servers!\n");

  const adminHttp = createServer(adminApp);
  const superAdminHttp = createServer(superAdminApp);

  await new Promise((r) => adminHttp.listen(0, r));
  await new Promise((r) => superAdminHttp.listen(0, r));

  const adminPort = adminHttp.address().port;
  const superAdminPort = superAdminHttp.address().port;

  const adminBaseUrl = `http://127.0.0.1:${adminPort}/api/v1`;
  const superAdminBaseUrl = `http://127.0.0.1:${superAdminPort}/api/v1/master`;

  console.log(`📡 Local Admin Server URL      : ${adminBaseUrl}`);
  console.log(`📡 Local SuperAdmin Server URL : ${superAdminBaseUrl}\n`);

  let totalChecked = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  function assert(name, condition, details = "") {
    totalChecked++;
    if (condition) {
      console.log(`  ✅ [ALIGNED] ${name}`);
      totalPassed++;
    } else {
      console.log(`  ❌ [MISMATCH] ${name} -> ${details}`);
      totalFailed++;
    }
  }

  try {
    // =========================================================================
    // PART 1: SUPERADMIN APP vs SUPERADMIN SERVER
    // =========================================================================
    console.log("--------------------------------------------------------------------------");
    console.log("PART 1: VERIFYING SUPERADMIN APP CONTRACTS (with x-master-key)");
    console.log("--------------------------------------------------------------------------");

    const masterHeaders = {
      "Content-Type": "application/json",
      "x-master-key": "SUPER_SECRET_KEY",
    };

    // 1. GET /cities (Cities.js: const { data } = await API.get("/cities"); setCities(data.cities))
    const citiesRes = await fetch(`${superAdminBaseUrl}/cities`, { headers: masterHeaders });
    const citiesData = await citiesRes.json();
    assert(
      "SuperAdmin App: GET /cities returns data.cities array",
      citiesRes.status === 200 && Array.isArray(citiesData.cities),
      JSON.stringify(citiesData)
    );
    const existingCity = citiesData.cities?.[0];

    // 2. POST /cities/create (Cities.js: await API.post("/cities/create", { name: name.trim() }))
    const createCityRes = await fetch(`${superAdminBaseUrl}/cities/create`, {
      method: "POST",
      headers: masterHeaders,
      body: JSON.stringify({ name: "Alignment Test City" }),
    });
    const createCityData = await createCityRes.json();
    assert(
      "SuperAdmin App: POST /cities/create returns data.city with _id and name",
      createCityRes.status === 201 && !!createCityData.city?._id && createCityData.city.name === "Alignment Test City",
      JSON.stringify(createCityData)
    );
    const testCityId = createCityData.city?._id;

    // 3. PUT /cities/:id (Cities.js: await API.put(`/cities/${editId}`, { name: name.trim() }))
    const updateCityRes = await fetch(`${superAdminBaseUrl}/cities/${testCityId}`, {
      method: "PUT",
      headers: masterHeaders,
      body: JSON.stringify({ name: "Alignment Test City (Updated)" }),
    });
    const updateCityData = await updateCityRes.json();
    assert(
      "SuperAdmin App: PUT /cities/:id returns updated data.city",
      updateCityRes.status === 200 && updateCityData.city?.name === "Alignment Test City (Updated)",
      JSON.stringify(updateCityData)
    );

    // 4. DELETE /cities/:id (Cities.js: await API.delete(`/cities/${id}`))
    const deleteCityRes = await fetch(`${superAdminBaseUrl}/cities/${testCityId}`, {
      method: "DELETE",
      headers: masterHeaders,
    });
    const deleteCityData = await deleteCityRes.json();
    assert(
      "SuperAdmin App: DELETE /cities/:id returns success: true",
      deleteCityRes.status === 200 && deleteCityData.success === true,
      JSON.stringify(deleteCityData)
    );

    // 5. GET /admins (Admins.js: const adminsRes = await API.get("/admins"); setAdmins(adminsRes.data.admins))
    const adminsRes = await fetch(`${superAdminBaseUrl}/admins`, { headers: masterHeaders });
    const adminsData = await adminsRes.json();
    assert(
      "SuperAdmin App: GET /admins returns data.admins with populated city",
      adminsRes.status === 200 && Array.isArray(adminsData.admins) && (!adminsData.admins[0] || !!adminsData.admins[0].city?.name),
      JSON.stringify(adminsData)
    );

    // 6. POST /admin/create (Admins.js: await API.post("/admin/create", form))
    const testEmail = `align_${Date.now()}@gaonse.in`;
    const createAdminRes = await fetch(`${superAdminBaseUrl}/admin/create`, {
      method: "POST",
      headers: masterHeaders,
      body: JSON.stringify({
        name: "Test Alignment Admin",
        email: testEmail,
        password: "TestPassword@123",
        city: existingCity?._id,
      }),
    });
    const createAdminData = await createAdminRes.json();
    assert(
      "SuperAdmin App: POST /admin/create returns data.admin with role: 'admin'",
      createAdminRes.status === 201 && createAdminData.admin?.role === "admin",
      JSON.stringify(createAdminData)
    );
    const testAdminId = createAdminData.admin?._id;

    // 7. PUT /admin/:id (Admins.js: await API.put(`/admin/${admin._id}`, { ...admin, isActive: !admin.isActive }))
    const updateAdminRes = await fetch(`${superAdminBaseUrl}/admin/${testAdminId}`, {
      method: "PUT",
      headers: masterHeaders,
      body: JSON.stringify({
        name: "Test Alignment Admin (Updated)",
        email: testEmail,
        city: existingCity?._id,
        isActive: false,
      }),
    });
    const updateAdminData = await updateAdminRes.json();
    assert(
      "SuperAdmin App: PUT /admin/:id updates isActive and name",
      updateAdminRes.status === 200 && updateAdminData.admin?.isActive === false,
      JSON.stringify(updateAdminData)
    );

    // 8. DELETE /admin/:id (Admins.js: await API.delete(`/admin/${id}`))
    const deleteAdminRes = await fetch(`${superAdminBaseUrl}/admin/${testAdminId}`, {
      method: "DELETE",
      headers: masterHeaders,
    });
    const deleteAdminData = await deleteAdminRes.json();
    assert(
      "SuperAdmin App: DELETE /admin/:id returns success: true",
      deleteAdminRes.status === 200 && deleteAdminData.success === true,
      JSON.stringify(deleteAdminData)
    );

    // =========================================================================
    // PART 2: ADMIN APP vs ADMIN SERVER
    // =========================================================================
    console.log("\n--------------------------------------------------------------------------");
    console.log("PART 2: VERIFYING ADMIN APP CONTRACTS (with JWT Bearer & City Scope)");
    console.log("--------------------------------------------------------------------------");

    // 1. LOGIN (Login.jsx: const res = await API.post("/admin/login", { email, password }))
    const loginRes = await fetch(`${adminBaseUrl}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "yogesh@gaonse.in",
        password: "Yogesh@12345",
      }),
    });
    const loginData = await loginRes.json();
    assert(
      "Admin App: POST /admin/login returns data.token and data.admin with city",
      loginRes.status === 200 && !!loginData.token && !!loginData.admin?.city?.name,
      JSON.stringify(loginData)
    );
    const adminToken = loginData.token;
    const adminHeaders = {
      "Content-Type": "application/json",
      Authorization: adminToken, // matches api.js interceptor: config.headers.Authorization = global.token
    };

    // 2. DASHBOARD (Dashboard.jsx: await API.get("/admin/dashboard"))
    const dashboardRes = await fetch(`${adminBaseUrl}/admin/dashboard`, { headers: adminHeaders });
    const dashboardData = await dashboardRes.json();
    assert(
      "Admin App: GET /admin/dashboard returns totalProducts and products array",
      dashboardRes.status === 200 && typeof dashboardData.totalProducts === "number" && Array.isArray(dashboardData.products),
      JSON.stringify(dashboardData)
    );

    // 3. INVENTORY (Dashboard.jsx: await API.get("/admin/inventory"))
    const inventoryRes = await fetch(`${adminBaseUrl}/admin/inventory`, { headers: adminHeaders });
    const inventoryData = await inventoryRes.json();
    assert(
      "Admin App: GET /admin/inventory returns data.inventory array",
      inventoryRes.status === 200 && Array.isArray(inventoryData.inventory),
      JSON.stringify(inventoryData)
    );

    // 4. RESET INVENTORY (Dashboard.jsx: await API.put("/admin/inventory/reset"))
    const resetInvRes = await fetch(`${adminBaseUrl}/admin/inventory/reset`, {
      method: "PUT",
      headers: adminHeaders,
    });
    const resetInvData = await resetInvRes.json();
    assert(
      "Admin App: PUT /admin/inventory/reset returns success: true",
      resetInvRes.status === 200 && resetInvData.success === true,
      JSON.stringify(resetInvData)
    );

    // 5. ZONES (Zones.jsx: const res = await API.get("/admin/zone"))
    const zonesRes = await fetch(`${adminBaseUrl}/admin/zone`, { headers: adminHeaders });
    const zonesData = await zonesRes.json();
    assert(
      "Admin App: GET /admin/zone returns data.zones array",
      zonesRes.status === 200 && Array.isArray(zonesData.zones),
      JSON.stringify(zonesData)
    );
    const sampleZone = zonesData.zones?.[0];

    // 6. CATEGORIES (Category.jsx: const { data } = await API.get("/admin/category"))
    const categoriesRes = await fetch(`${adminBaseUrl}/admin/category`, { headers: adminHeaders });
    const categoriesData = await categoriesRes.json();
    assert(
      "Admin App: GET /admin/category returns data.categories array",
      categoriesRes.status === 200 && Array.isArray(categoriesData.categories),
      JSON.stringify(categoriesData)
    );
    const sampleCategory = categoriesData.categories?.[0];

    // 7. PRODUCTS (Products.jsx: const p = await API.get("/admin/product"))
    const productsRes = await fetch(`${adminBaseUrl}/admin/product`, { headers: adminHeaders });
    const productsData = await productsRes.json();
    assert(
      "Admin App: GET /admin/product returns data.products array with category populated",
      productsRes.status === 200 && Array.isArray(productsData.products),
      JSON.stringify(productsData)
    );
    const sampleProduct = productsData.products?.[0];

    // 8. RESET PRODUCT STOCK (Dashboard.jsx: await API.put(`/admin/reset-stock/${productId}`))
    if (sampleProduct) {
      const resetStockRes = await fetch(`${adminBaseUrl}/admin/reset-stock/${sampleProduct._id}`, {
        method: "PUT",
        headers: adminHeaders,
      });
      const resetStockData = await resetStockRes.json();
      assert(
        "Admin App: PUT /admin/reset-stock/:id restores currentStock to stockLimit",
        resetStockRes.status === 200 && resetStockData.product?.currentStock === resetStockData.product?.stockLimit,
        JSON.stringify(resetStockData)
      );
    }

    // 9. DELIVERY PARTNERS (DeliveryPartners.jsx: const p = await API.get("/admin/delivery"))
    const deliveryRes = await fetch(`${adminBaseUrl}/admin/delivery`, { headers: adminHeaders });
    const deliveryData = await deliveryRes.json();
    assert(
      "Admin App: GET /admin/delivery returns data.partners array with zone populated",
      deliveryRes.status === 200 && Array.isArray(deliveryData.partners),
      JSON.stringify(deliveryData)
    );
    const samplePartner = deliveryData.partners?.[0];

    // 10. PARTNER SALES (DeliveryPartners.jsx: await API.get(`/admin/delivery/sales/${partner._id}`))
    if (samplePartner) {
      const salesRes = await fetch(`${adminBaseUrl}/admin/delivery/sales/${samplePartner._id}`, {
        headers: adminHeaders,
      });
      const salesData = await salesRes.json();
      assert(
        "Admin App: GET /admin/delivery/sales/:id returns todaySales and totalSales",
        salesRes.status === 200 && typeof salesData.todaySales === "number" && typeof salesData.totalSales === "number",
        JSON.stringify(salesData)
      );
    }

    // 11. SETTINGS (Settings.jsx: const { data } = await API.get("/admin/setting"))
    const settingsRes = await fetch(`${adminBaseUrl}/admin/setting`, { headers: adminHeaders });
    const settingsData = await settingsRes.json();
    assert(
      "Admin App: GET /admin/setting returns data.setting with morningDeadline & eveningDeadline",
      settingsRes.status === 200 && !!settingsData.setting?.morningDeadline && !!settingsData.setting?.eveningDeadline,
      JSON.stringify(settingsData)
    );

    // 12. UPDATE SETTINGS (Settings.jsx: await API.put("/admin/setting", { morningDeadline, eveningDeadline }))
    const updateSettingsRes = await fetch(`${adminBaseUrl}/admin/setting`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({
        morningDeadline: "06:00",
        eveningDeadline: "17:00",
      }),
    });
    const updateSettingsData = await updateSettingsRes.json();
    assert(
      "Admin App: PUT /admin/setting updates morningDeadline and eveningDeadline",
      updateSettingsRes.status === 200 && updateSettingsData.setting?.morningDeadline === "06:00",
      JSON.stringify(updateSettingsData)
    );

    // 13. PENDING ORDERS (Orders.jsx: const { data } = await API.get("/admin/orders/pending"))
    const ordersRes = await fetch(`${adminBaseUrl}/admin/orders/pending`, { headers: adminHeaders });
    const ordersData = await ordersRes.json();
    assert(
      "Admin App: GET /admin/orders/pending returns data.orders array with user & items",
      ordersRes.status === 200 && Array.isArray(ordersData.orders),
      JSON.stringify(ordersData)
    );
    const pendingOrder = ordersData.orders?.[0];

    // 14. ORDER ACTIONS (Orders.jsx: await API.put(`/admin/orders/approve/${id}`) or cancel)
    if (pendingOrder) {
      const cancelRes = await fetch(`${adminBaseUrl}/admin/orders/cancel/${pendingOrder._id}`, {
        method: "PUT",
        headers: adminHeaders,
      });
      const cancelData = await cancelRes.json();
      assert(
        "Admin App: PUT /admin/orders/cancel/:id updates status to 'cancelled'",
        cancelRes.status === 200 && cancelData.order?.status === "cancelled",
        JSON.stringify(cancelData)
      );
    }

    console.log("\n==========================================================================");
    console.log(`SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED out of ${totalChecked} CONTRACT CHECKS`);
    console.log("==========================================================================");
  } finally {
    adminHttp.close();
    superAdminHttp.close();
    await mongoose.disconnect();
  }
}

runAlignmentCheck().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
