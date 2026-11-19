import { Admin } from "./models/Admin.js";
import { Product } from "./models/Product.js";
import { Category } from "./models/Category.js";
import { Zone } from "./models/Zone.js";
import { Order } from "./models/Order.js";
import { Setting } from "./models/Setting.js";
import { DeliveryPartner } from "./models/DeliveryPartner.js";
import { Inventory } from "./models/Inventory.js";
import { User } from "./models/User.js";
import { Khata } from "./models/Khata.js";
import { Subscription } from "./models/Subscription.js";
import { app } from "./app.js";
import { createServer } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

async function runTests() {
  const adminId = "6afdd79ee65d6cf5a614e52e";
  const cityId = "6afdd79de65d6cf5a614e52b";
  const hashedPassword = await bcrypt.hash("Yogesh@12345", 10);

  // 1. Mock Admin
  Admin.findOne = function(query) {
    return {
      select: function(sel) {
        return {
          populate: function(pop) {
            if (query.email === "yogesh@gaonse.in") {
              return Promise.resolve({
                _id: adminId,
                name: "Yogesh",
                email: "yogesh@gaonse.in",
                password: hashedPassword,
                role: "admin",
                city: { _id: cityId, name: "Sirsa" },
                isActive: true,
              });
            }
            return Promise.resolve(null);
          }
        };
      }
    };
  };

  Admin.findById = function(id) {
    return Promise.resolve({
      _id: adminId,
      name: "Yogesh",
      email: "yogesh@gaonse.in",
      role: "admin",
      city: cityId,
      isActive: true,
    });
  };

  // 2. Mock Category
  Category.create = function(data) {
    return Promise.resolve({ _id: "cat123", ...data });
  };
  Category.find = function(filter) {
    return Promise.resolve([{ _id: "cat123", name: "Dairy", city: cityId, isActive: true }]);
  };
  Category.findById = function(id) {
    return Promise.resolve({
      _id: id,
      name: "Dairy",
      city: cityId,
      isActive: true,
      save: async function() { return this; },
      deleteOne: async function() { return true; },
    });
  };

  // 3. Mock Zone
  Zone.create = function(data) {
    return Promise.resolve({ _id: "zone123", ...data });
  };
  Zone.find = function(filter) {
    return Promise.resolve([{ _id: "zone123", name: "Model Town", city: cityId, radius: 5, isActive: true }]);
  };
  Zone.findById = function(id) {
    return Promise.resolve({
      _id: id,
      name: "Model Town",
      city: cityId,
      radius: 5,
      isActive: true,
      save: async function() { return this; },
      deleteOne: async function() { return true; },
    });
  };
  Zone.findByIdAndUpdate = function(id, data) {
    return Promise.resolve({ _id: id, ...data });
  };

  // 4. Mock Product
  Product.create = function(data) {
    return Promise.resolve({ _id: "prod123", ...data });
  };
  Product.find = function(filter) {
    return {
      populate: function() {
        return Promise.resolve([{ _id: "prod123", name: "Fresh Milk 1L", price: 60, city: cityId, currentStock: 50, stockLimit: 100 }]);
      },
      select: function() {
        return Promise.resolve([{ _id: "prod123", name: "Fresh Milk 1L", currentStock: 50, stockLimit: 100 }]);
      },
    };
  };
  Product.findById = function(id) {
    return Promise.resolve({
      _id: id,
      name: "Fresh Milk 1L",
      city: cityId,
      price: 60,
      stockLimit: 100,
      currentStock: 50,
      isActive: true,
      save: async function() { return this; },
    });
  };
  Product.findByIdAndUpdate = function(id, data) {
    return Promise.resolve({ _id: id, ...data });
  };
  Product.findOneAndUpdate = function(filter, update) {
    return Promise.resolve({ _id: "prod123", currentStock: 48 });
  };
  Product.findByIdAndDelete = function(id) {
    return Promise.resolve({ _id: id });
  };

  // 5. Mock Subscription
  Subscription.deleteMany = function() {
    return Promise.resolve({ deletedCount: 0 });
  };

  // 6. Mock Setting
  Setting.findOne = function(filter) {
    return Promise.resolve({
      city: cityId,
      morningDeadline: "00:00",
      eveningDeadline: "14:00",
      rupeesPerKm: 10,
      save: async function() { return this; },
    });
  };
  Setting.create = function(data) {
    return Promise.resolve({ city: cityId, ...data });
  };

  const partnerId = "6afdd79ee65d6cf5a614e52f";
  const zoneId = "6afdd79ee65d6cf5a614e530";

  // 7. Mock DeliveryPartner
  DeliveryPartner.findOne = function(query) {
    return {
      select: function() {
        if (query.phone === "9876543210") {
          return Promise.resolve({
            _id: partnerId,
            name: "Ravi",
            phone: "9876543210",
            city: cityId,
            zone: zoneId,
            isActive: true,
            comparePassword: async () => true,
          });
        }
        return Promise.resolve(null);
      },
      then: function(resolve) {
        // For existing phone check in createDeliveryPartner
        if (query.phone === "9123456789") {
          resolve(null);
        } else if (query.phone === "9876543210") {
          resolve({
            _id: partnerId,
            name: "Ravi",
            phone: "9876543210",
            city: cityId,
            zone: zoneId,
            isActive: true,
          });
        } else {
          resolve(null);
        }
      }
    };
  };
  DeliveryPartner.create = function(data) {
    return Promise.resolve({ _id: partnerId, ...data });
  };
  DeliveryPartner.find = function() {
    return {
      populate: function() {
        return Promise.resolve([{
          _id: partnerId,
          name: "Ravi",
          phone: "9876543210",
          city: cityId,
          isActive: true,
          createdAt: new Date(),
          toObject: function() { return { _id: partnerId, name: "Ravi", phone: "9876543210" }; },
        }]);
      },
    };
  };
  DeliveryPartner.findById = function(id) {
    return Promise.resolve({
      _id: id,
      name: "Ravi",
      phone: "9876543210",
      city: cityId,
      isActive: true,
      createdAt: new Date(),
      save: async function() { return this; },
      deleteOne: async function() { return true; },
    });
  };

  // 8. Mock Order
  Order.find = function() {
    const list = [{
      _id: "order123",
      status: "delivered",
      deliveredBy: partnerId,
      earning: 20,
      total: 120,
      items: [],
      createdAt: new Date(),
      deliveredAt: new Date()
    }];
    return {
      populate: function() {
        return {
          populate: function() {
            return {
              sort: function() {
                return Promise.resolve(list);
              },
            };
          },
          sort: function() {
            return Promise.resolve(list);
          },
        };
      },
      then: function(resolve) {
        resolve(list);
      }
    };
  };
  Order.findOne = function() {
    return {
      populate: function() {
        return Promise.resolve({
          _id: "order123",
          status: "pending",
          items: [{ _id: "prod123", name: "Fresh Milk 1L", qty: 2 }],
          save: async function() { return this; },
        });
      },
      then: function(resolve) {
        resolve({
          _id: "order123",
          status: "pending",
          items: [{ _id: "prod123", name: "Fresh Milk 1L", qty: 2 }],
          save: async function() { return this; },
        });
      },
    };
  };

  // 9. Mock Inventory
  Inventory.find = function() {
    return {
      sort: function() {
        return Promise.resolve([{ productId: "prod123", productName: "Fresh Milk 1L", todayDemand: 5 }]);
      },
    };
  };
  Inventory.updateMany = function() {
    return Promise.resolve({ modifiedCount: 1 });
  };

  // 10. Mock User aggregate
  User.aggregate = function() {
    return Promise.resolve([{ _id: "user123", name: "Aman", phone: "9999999999", walletBalance: 150 }]);
  };

  // 11. Mock Khata aggregate
  Khata.aggregate = function() {
    return Promise.resolve([{ _id: null, total: 500, items: 10 }]);
  };

  const server = createServer(app);
  server.listen(0, async () => {
    const base = "http://127.0.0.1:" + server.address().port;

    console.log("=================================================");
    console.log("STEP 1: Testing Admin Login via SuperAdmin Admin");
    console.log("=================================================");
    const loginRes = await fetch(base + "/api/v1/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "yogesh@gaonse.in", password: "Yogesh@12345" }),
    });
    const loginData = await loginRes.json();
    console.log("Login Status:", loginRes.status);
    console.log("Login Response:", JSON.stringify(loginData, null, 2));

    if (!loginData.success || !loginData.token) {
      console.error("FAILED LOGIN!");
      server.close();
      process.exit(1);
    }

    const token = loginData.token;
    const authHeaders = {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    };

    console.log("\n=================================================");
    console.log("STEP 2: Testing All Protected Routes with JWT");
    console.log("=================================================");

    const testCases = [
      // 1. Dashboard Routes
      { name: "GET Dashboard", method: "GET", path: "/api/v1/admin/dashboard" },
      { name: "PUT Reset Product Stock", method: "PUT", path: "/api/v1/admin/reset-stock/prod123" },

      // 2. Zone Routes
      { name: "GET Zones", method: "GET", path: "/api/v1/admin/zone" },
      { name: "POST Create Zone", method: "POST", path: "/api/v1/admin/zone/create", body: { name: "Sector 20", center: { lat: 29.53, lng: 75.02 }, radius: 4 } },
      { name: "PUT Update Zone", method: "PUT", path: "/api/v1/admin/zone/zone123", body: { name: "Sector 20 Updated" } },
      { name: "PUT Toggle Zone Status", method: "PUT", path: "/api/v1/admin/zone/toggle/zone123" },
      { name: "DELETE Zone", method: "DELETE", path: "/api/v1/admin/zone/zone123" },

      // 3. Category Routes
      { name: "GET Categories", method: "GET", path: "/api/v1/admin/category" },
      { name: "POST Create Category", method: "POST", path: "/api/v1/admin/category/create", body: { name: "Ghee", isSubscriptionAllowed: true } },
      { name: "PUT Update Category", method: "PUT", path: "/api/v1/admin/category/cat123", body: { name: "Pure Ghee" } },
      { name: "PUT Toggle Category Status", method: "PUT", path: "/api/v1/admin/category/toggle/cat123" },
      { name: "DELETE Category", method: "DELETE", path: "/api/v1/admin/category/cat123" },

      // 4. Product Routes
      { name: "GET Products", method: "GET", path: "/api/v1/admin/product" },
      { name: "POST Create Product", method: "POST", path: "/api/v1/admin/product/create", body: { name: "Curd 500g", price: 40, stock: 30 } },
      { name: "PUT Update Product", method: "PUT", path: "/api/v1/admin/product/prod123", body: { name: "Fresh Milk 1L (Updated)" } },
      { name: "PUT Toggle Product Status", method: "PUT", path: "/api/v1/admin/product/toggle/prod123" },
      { name: "DELETE Product", method: "DELETE", path: "/api/v1/admin/product/prod123" },

      // 5. Orders Routes
      { name: "GET Orders Test", method: "GET", path: "/api/v1/admin/orders/test", noAuth: true },
      { name: "GET Pending Orders", method: "GET", path: "/api/v1/admin/orders/pending" },
      { name: "GET All Orders", method: "GET", path: "/api/v1/admin/orders/all" },
      { name: "PUT Approve Order", method: "PUT", path: "/api/v1/admin/orders/approve/order123" },
      { name: "PUT Cancel Order", method: "PUT", path: "/api/v1/admin/orders/cancel/order123" },
      { name: "PUT Unassign Order", method: "PUT", path: "/api/v1/admin/orders/unassign/order123" },
      { name: "BLOCK POST Order Create", method: "POST", path: "/api/v1/admin/orders/create", body: { total: 100 }, expectStatus: 403 },
      { name: "BLOCK POST Orders Root", method: "POST", path: "/api/v1/admin/orders", body: { total: 100 }, expectStatus: 403 },
      { name: "BLOCK POST Order Singular", method: "POST", path: "/api/v1/admin/order/create", body: { total: 100 }, expectStatus: 403 },

      // 6. Settings Routes
      { name: "GET Settings", method: "GET", path: "/api/v1/admin/setting" },
      { name: "PUT Update Settings", method: "PUT", path: "/api/v1/admin/setting", body: { morningDeadline: "05:00", eveningDeadline: "16:00", rupeesPerKm: 12 } },

      // 7. Delivery Partner Routes
      { name: "GET Delivery Partners", method: "GET", path: "/api/v1/admin/delivery" },
      { name: "POST Create Delivery Partner", method: "POST", path: "/api/v1/admin/delivery/create", body: { name: "Deepak", phone: "9123456789", password: "Pass@123", zone: zoneId } },
      { name: "POST Delivery Partner Login", method: "POST", path: "/api/v1/admin/delivery/login", noAuth: true, body: { phone: "9876543210", password: "password" } },
      { name: "GET Delivery Partner Sales", method: "GET", path: "/api/v1/admin/delivery/sales/" + partnerId },
      { name: "GET Delivery Partner Salary Weeks", method: "GET", path: "/api/v1/admin/delivery/salary/" + partnerId },
      { name: "PUT Toggle Delivery Partner Status", method: "PUT", path: "/api/v1/admin/delivery/toggle/" + partnerId },
      { name: "DELETE Delivery Partner", method: "DELETE", path: "/api/v1/admin/delivery/" + partnerId },

      // 8. Inventory Routes
      { name: "GET Inventory", method: "GET", path: "/api/v1/admin/inventory" },
      { name: "PUT Reset Inventory", method: "PUT", path: "/api/v1/admin/inventory/reset" },

      // 9. Users Routes
      { name: "GET Users (Default Sort)", method: "GET", path: "/api/v1/admin/users" },
      { name: "GET Users (Sorted by Balance)", method: "GET", path: "/api/v1/admin/users?sortBy=balance_desc" },
    ];

    let passed = 0;
    let failed = 0;

    for (const tc of testCases) {
      const opts = {
        method: tc.method,
        headers: tc.noAuth ? { "Content-Type": "application/json" } : { ...authHeaders },
      };
      if (tc.body) opts.body = JSON.stringify(tc.body);

      try {
        const res = await fetch(base + tc.path, opts);
        const data = await res.json();
        const ok = tc.expectStatus ? res.status === tc.expectStatus : (res.status >= 200 && res.status < 300);
        if (ok) {
          console.log(`✅ [PASS] ${tc.method.padEnd(6)} ${tc.path.padEnd(42)} -> Status: ${res.status}`);
          passed++;
        } else {
          console.log(`❌ [FAIL] ${tc.method.padEnd(6)} ${tc.path.padEnd(42)} -> Status: ${res.status}:`, JSON.stringify(data));
          failed++;
        }
      } catch (err) {
        console.log(`❌ [ERR ] ${tc.method.padEnd(6)} ${tc.path.padEnd(42)} -> ${err.message}`);
        failed++;
      }
    }

    console.log("\n=================================================");
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${testCases.length} routes.`);
    console.log("=================================================");

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  });
}

runTests();
