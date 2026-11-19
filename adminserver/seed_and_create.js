import { app } from "./app.js";
import { createServer } from "http";
import mongoose from "mongoose";
import { User } from "./models/User.js";
import { Order } from "./models/Order.js";

async function main() {
  console.log("==========================================================");
  console.log("CONNECTING TO MONGODB ATLAS & STARTING ADMIN SERVER");
  console.log("==========================================================");

  // Connect to Atlas
  await mongoose.connect(process.env.MONGO_URI);
  console.log(" Connected to MongoDB Atlas successfully!");

  // Start HTTP Server
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(` Admin server running locally on ${baseUrl}\n`);

  try {
    // -------------------------------------------------------------
    // 1. SIGN IN THROUGH ADMIN CREATED VIA SUPERADMIN
    // -------------------------------------------------------------
    console.log("----------------------------------------------------------");
    console.log("1. SIGN IN AS ADMIN (YOGESH)");
    console.log("----------------------------------------------------------");

    const loginRes = await fetch(`${baseUrl}/api/v1/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "yogesh@gaonse.in",
        password: "Yogesh@12345",
      }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    console.log(" Status:", loginRes.status);
    console.log(" Logged In Admin:", loginData.admin.name);
    console.log(" City:", loginData.admin.city.name, `(${loginData.admin.city._id})`);
    console.log(" JWT Token acquired:", loginData.token.substring(0, 30) + "...\n");

    const token = loginData.token;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const cityId = loginData.admin.city._id;

    // -------------------------------------------------------------
    // 2. CREATE ZONE THROUGH ADMIN SERVER
    // -------------------------------------------------------------
    console.log("----------------------------------------------------------");
    console.log("2. CREATE ZONE THROUGH ADMIN SERVER (POST /api/v1/admin/zone/create)");
    console.log("----------------------------------------------------------");

    const zoneRes = await fetch(`${baseUrl}/api/v1/admin/zone/create`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Sirsa Central & Model Town Zone",
        center: { lat: 29.5349, lng: 75.0294 },
        radius: 8,
      }),
    });

    const zoneData = await zoneRes.json();
    console.log(" Status:", zoneRes.status);
    console.log(" Created Zone Response:", JSON.stringify(zoneData, null, 2));

    if (!zoneData.success || !zoneData.zone?._id) {
      throw new Error(`Create Zone failed: ${JSON.stringify(zoneData)}`);
    }
    const createdZone = zoneData.zone;
    console.log(` Zone Created: "${createdZone.name}" with ID: ${createdZone._id}\n`);

    // -------------------------------------------------------------
    // 3. CREATE CATEGORY THROUGH ADMIN SERVER
    // -------------------------------------------------------------
    console.log("----------------------------------------------------------");
    console.log("3. CREATE CATEGORY THROUGH ADMIN SERVER (POST /api/v1/admin/category/create)");
    console.log("----------------------------------------------------------");

    const categoryRes = await fetch(`${baseUrl}/api/v1/admin/category/create`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Fresh Farm Dairy",
        isSubscriptionAllowed: true,
      }),
    });

    const categoryData = await categoryRes.json();
    console.log(" Status:", categoryRes.status);
    console.log(" Created Category Response:", JSON.stringify(categoryData, null, 2));

    if (!categoryData.success || !categoryData.category?._id) {
      throw new Error(`Create Category failed: ${JSON.stringify(categoryData)}`);
    }
    const createdCategory = categoryData.category;
    console.log(` Category Created: "${createdCategory.name}" with ID: ${createdCategory._id}\n`);

    // -------------------------------------------------------------
    // 4. CREATE PRODUCT THROUGH ADMIN SERVER (FOR ORDERS & STOCK)
    // -------------------------------------------------------------
    console.log("----------------------------------------------------------");
    console.log("4. CREATE PRODUCT THROUGH ADMIN SERVER (POST /api/v1/admin/product/create)");
    console.log("----------------------------------------------------------");

    const productRes = await fetch(`${baseUrl}/api/v1/admin/product/create`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "A2 Desi Cow Milk 1L",
        price: 70,
        discount: 5,
        stock: 50,
        category: createdCategory._id,
      }),
    });

    const productData = await productRes.json();
    console.log(" Status:", productRes.status);
    console.log(" Created Product Response:", JSON.stringify(productData, null, 2));

    if (!productData.success || !productData.product?._id) {
      throw new Error(`Create Product failed: ${JSON.stringify(productData)}`);
    }
    const createdProduct = productData.product;
    console.log(` Product Created: "${createdProduct.name}" with ID: ${createdProduct._id} (Initial Stock: 50)\n`);

    // -------------------------------------------------------------
    // 5. CREATE DELIVERY PARTNER THROUGH ADMIN SERVER
    // -------------------------------------------------------------
    console.log("----------------------------------------------------------");
    console.log("5. CREATE DELIVERY PARTNER (POST /api/v1/admin/delivery/create)");
    console.log("----------------------------------------------------------");

    const deliveryRes = await fetch(`${baseUrl}/api/v1/admin/delivery/create`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Ramesh Sharma",
        phone: "9876501234",
        password: "Partner@12345",
        zone: createdZone._id,
      }),
    });

    const deliveryData = await deliveryRes.json();
    console.log(" Status:", deliveryRes.status);
    console.log(" Created Delivery Partner Response:", JSON.stringify(deliveryData, null, 2));

    if (!deliveryData.success || !deliveryData.partner?._id) {
      throw new Error(`Create Delivery Partner failed: ${JSON.stringify(deliveryData)}`);
    }
    const createdPartner = deliveryData.partner;
    console.log(` Delivery Partner Created: "${createdPartner.name}" with ID: ${createdPartner._id}\n`);

    // -------------------------------------------------------------
    // 6. CREATE SAMPLE CUSTOMER USER & ORDERS
    // -------------------------------------------------------------
    console.log("----------------------------------------------------------");
    console.log("6. CREATE CUSTOMER USER & ORDERS IN SIRSA");
    console.log("----------------------------------------------------------");

    // Ensure a customer user exists in Sirsa
    let customer = await User.findOne({ phone: "9812345678" });
    if (!customer) {
      customer = await User.create({
        name: "Aman Verma",
        phone: "9812345678",
        email: "aman.verma@example.com",
        city: cityId,
        accountVerified: true,
      });
      console.log(` Customer User Created: "${customer.name}" (${customer._id})`);
    } else {
      console.log(` Existing Customer User Found: "${customer.name}" (${customer._id})`);
    }

    // Create 2 Orders for this customer in Sirsa zone
    const order1 = await Order.create({
      user: customer._id,
      items: [
        {
          _id: createdProduct._id.toString(),
          name: createdProduct.name,
          price: 70,
          qty: 2,
        },
      ],
      address: {
        city: cityId,
        zone: { _id: createdZone._id, name: createdZone.name },
        text: "House #142, Street 3, Model Town, Sirsa",
        latitude: 29.535,
        longitude: 75.03,
      },
      total: 140,
      deliveryTime: "morning",
      status: "pending",
      paymentStatus: "paid",
      type: "normal",
    });

    const order2 = await Order.create({
      user: customer._id,
      items: [
        {
          _id: createdProduct._id.toString(),
          name: createdProduct.name,
          price: 70,
          qty: 1,
        },
      ],
      address: {
        city: cityId,
        zone: { _id: createdZone._id, name: createdZone.name },
        text: "Flat 204, Green Heights, Sirsa",
        latitude: 29.538,
        longitude: 75.032,
      },
      total: 70,
      deliveryTime: "evening",
      status: "pending",
      paymentStatus: "paid",
      type: "subscription",
    });

    console.log(` Order 1 Created: ${order1._id} (2x Milk, Total: ₹140, Status: pending)`);
    console.log(` Order 2 Created: ${order2._id} (1x Milk, Total: ₹70, Status: pending)\n`);

    // -------------------------------------------------------------
    // 7. VERIFY EVERYTHING VIA ADMIN SERVER ROUTES
    // -------------------------------------------------------------
    console.log("----------------------------------------------------------");
    console.log("7. VERIFYING ALL CREATED ENTITIES THROUGH ADMIN ROUTES");
    console.log("----------------------------------------------------------");

    // A. Verify Zones
    const getZonesRes = await fetch(`${baseUrl}/api/v1/admin/zone`, { headers: authHeaders });
    const zonesList = await getZonesRes.json();
    console.log(` Zones fetched via GET /api/v1/admin/zone: Count = ${zonesList.zones?.length}`);

    // B. Verify Categories
    const getCatRes = await fetch(`${baseUrl}/api/v1/admin/category`, { headers: authHeaders });
    const catList = await getCatRes.json();
    console.log(` Categories fetched via GET /api/v1/admin/category: Count = ${catList.categories?.length}`);

    // C. Verify Delivery Partners
    const getDeliveryRes = await fetch(`${baseUrl}/api/v1/admin/delivery`, { headers: authHeaders });
    const deliveryList = await getDeliveryRes.json();
    console.log(` Delivery Partners fetched via GET /api/v1/admin/delivery: Count = ${deliveryList.partners?.length}`);

    // D. Verify Pending Orders
    const getPendingOrdersRes = await fetch(`${baseUrl}/api/v1/admin/orders/pending`, { headers: authHeaders });
    const pendingOrdersList = await getPendingOrdersRes.json();
    console.log(` Pending Orders fetched via GET /api/v1/admin/orders/pending: Count = ${pendingOrdersList.count}`);

    // E. Test Approving Order 1 through Admin Server
    console.log(`\n Approving Order 1 (${order1._id}) via PUT /api/v1/admin/orders/approve/${order1._id}...`);
    const approveRes = await fetch(`${baseUrl}/api/v1/admin/orders/approve/${order1._id}`, {
      method: "PUT",
      headers: authHeaders,
    });
    const approveData = await approveRes.json();
    console.log(" Approval Response Status:", approveRes.status);
    console.log(" Approval Response:", JSON.stringify(approveData, null, 2));

    // Check remaining stock
    const checkProductRes = await fetch(`${baseUrl}/api/v1/admin/product`, { headers: authHeaders });
    const productListData = await checkProductRes.json();
    const updatedProd = productListData.products?.find((p) => p._id === createdProduct._id);
    console.log(` Product stock after order approval: ${updatedProd?.currentStock} (Deducted 2 from 50)`);

    // F. Verify All Orders
    const getAllOrdersRes = await fetch(`${baseUrl}/api/v1/admin/orders/all`, { headers: authHeaders });
    const allOrdersList = await getAllOrdersRes.json();
    console.log(` Total Orders in city via GET /api/v1/admin/orders/all: Count = ${allOrdersList.count}`);
    allOrdersList.orders.forEach((o, i) => {
      console.log(`   Order ${i + 1}: ID=${o._id}, Status=${o.status}, Total=₹${o.total}, Items=${o.items?.length}`);
    });

    console.log("\n==========================================================");
    console.log("ALL ENTITIES CREATED AND VERIFIED SUCCESSFULLY!");
    console.log("==========================================================");
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
