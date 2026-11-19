import "./utils/env.js";
import { app } from "./app.js";
import { createServer } from "http";
import mongoose from "mongoose";
import { User } from "./models/userModel.js";
import { City } from "./models/cityModel.js";

// Also import admin app to test cross-server verification
import { app as adminApp } from "../adminserver/app.js";

async function testUserRegistration() {
  console.log("==========================================================================");
  console.log("TESTING USER SERVER LOCALLY & CITY ID ALIGNMENT ACROSS SERVERS");
  console.log("==========================================================================");

  // 1. Connect database
  await mongoose.connect(process.env.MONGO_URI, { dbName: "gaonse" });
  console.log("✅ MongoDB Atlas Connected to 'gaonse' database!\n");

  // 2. Start servers on random local ports
  const userHttp = createServer(app);
  const adminHttp = createServer(adminApp);

  await new Promise((r) => userHttp.listen(0, r));
  await new Promise((r) => adminHttp.listen(0, r));

  const userBase = `http://127.0.0.1:${userHttp.address().port}/api/v1`;
  const adminBase = `http://127.0.0.1:${adminHttp.address().port}/api/v1`;

  console.log(`📡 User Server URL  : ${userBase}`);
  console.log(`📡 Admin Server URL : ${adminBase}\n`);

  try {
    // -----------------------------------------------------------------------
    // STEP 1: Verify City Fetching on User Server
    // -----------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------");
    console.log("STEP 1: FETCHING CITIES VIA USER SERVER (GET /api/v1/user/cities & /api/v1/cities)");
    console.log("--------------------------------------------------------------------------");

    const citiesRes = await fetch(`${userBase}/user/cities`);
    const citiesData = await citiesRes.json();

    console.log("Status:", citiesRes.status);
    console.log("Cities returned:", JSON.stringify(citiesData, null, 2));

    if (!citiesData.success || !citiesData.cities || citiesData.cities.length === 0) {
      throw new Error("No cities returned by user server!");
    }

    const sirsaCity = citiesData.cities.find((c) => c.name === "Sirsa");
    if (!sirsaCity) {
      throw new Error("Sirsa city not found in cities list!");
    }

    console.log(`\n🎯 TARGET CITY IDENTIFIED: "${sirsaCity.name}"`);
    console.log(`   Database City _id: ${sirsaCity._id}`);
    console.log(`   Expected City ID in SuperAdmin & Admin: 6afdd79de65d6cf5a614e52b`);

    if (sirsaCity._id.toString() === "6afdd79de65d6cf5a614e52b") {
      console.log("   ✅ CITY ID MATCHES SUPERADMIN/ADMIN EXACTLY!\n");
    } else {
      console.log(`   ⚠️ Notice: City ID is ${sirsaCity._id}\n`);
    }

    // -----------------------------------------------------------------------
    // STEP 2: Register New User with this City ID
    // -----------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------");
    console.log("STEP 2: REGISTERING NEW USER WITH THIS CITY (POST /api/v1/user/register)");
    console.log("--------------------------------------------------------------------------");

    const testEmail = `kavita_${Date.now()}@testgaonse.in`;
    const testPhone = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;

    const regPayload = {
      name: "Kavita Rani",
      email: testEmail,
      phone: testPhone,
      password: "Password@123",
      verificationMethod: "email",
      city: sirsaCity._id, // uses the ID fetched from the server!
    };

    console.log("Sending registration payload:");
    console.log(JSON.stringify(regPayload, null, 2));

    const regRes = await fetch(`${userBase}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regPayload),
    });

    const regData = await regRes.json();
    console.log("\nRegistration Response Status:", regRes.status);
    console.log("Registration Response:", JSON.stringify(regData, null, 2));

    if (!regRes.ok || !regData.success) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }

    // -----------------------------------------------------------------------
    // STEP 3: Verify User Record in Database
    // -----------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------");
    console.log("STEP 3: VERIFYING USER RECORD IN DATABASE");
    console.log("--------------------------------------------------------------------------");

    const createdUser = await User.findOne({ email: testEmail });
    if (!createdUser) {
      throw new Error("Created user not found in database!");
    }

    console.log("User in Database:");
    console.log(`   _id             : ${createdUser._id}`);
    console.log(`   name            : ${createdUser.name}`);
    console.log(`   email           : ${createdUser.email}`);
    console.log(`   phone           : ${createdUser.phone}`);
    console.log(`   city            : ${createdUser.city} (matches Sirsa: ${createdUser.city.toString() === sirsaCity._id.toString()})`);
    console.log(`   accountVerified : ${createdUser.accountVerified}`);
    console.log(`   verificationCode: ${createdUser.verificationCode}`);

    if (createdUser.city.toString() !== sirsaCity._id.toString()) {
      throw new Error(`City ID mismatch: user has ${createdUser.city}, expected ${sirsaCity._id}`);
    }
    console.log("✅ Verified: User stored with the correct City ID in the shared database!\n");

    // -----------------------------------------------------------------------
    // STEP 4: Complete OTP Verification
    // -----------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------");
    console.log("STEP 4: OTP VERIFICATION (POST /api/v1/user/otp-verification)");
    console.log("--------------------------------------------------------------------------");

    const otpRes = await fetch(`${userBase}/user/otp-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        phone: testPhone,
        otp: createdUser.verificationCode,
      }),
    });

    const otpData = await otpRes.json();
    console.log("OTP Verification Status:", otpRes.status);
    console.log("OTP Verification Response:", JSON.stringify(otpData, null, 2));

    if (!otpRes.ok || !otpData.success) {
      throw new Error(`OTP Verification failed: ${JSON.stringify(otpData)}`);
    }
    console.log("✅ User account successfully verified!\n");

    // -----------------------------------------------------------------------
    // STEP 5: Cross-Verification via Admin Server
    // -----------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------");
    console.log("STEP 5: VERIFYING ADMIN SERVER SEES THIS USER IN SIRSA");
    console.log("--------------------------------------------------------------------------");

    // Admin Yogesh logs into Admin Server
    const adminLoginRes = await fetch(`${adminBase}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "yogesh@gaonse.in",
        password: "Yogesh@12345",
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;

    // Admin fetches users for Sirsa via GET /api/v1/admin/users
    const adminUsersRes = await fetch(`${adminBase}/admin/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const adminUsersData = await adminUsersRes.json();

    console.log("Admin Server Users Status:", adminUsersRes.status);
    console.log(`Total Users returned for Admin City (Sirsa): ${adminUsersData.users?.length}`);

    const foundKavita = adminUsersData.users?.find((u) => u.email === testEmail);
    if (!foundKavita) {
      throw new Error("Admin server could NOT find the newly registered user in Sirsa!");
    }

    console.log("✅ FOUND USER IN ADMIN SERVER:");
    console.log(`   Name : ${foundKavita.name}`);
    console.log(`   Email: ${foundKavita.email}`);
    console.log(`   Phone: ${foundKavita.phone}`);

    console.log("\n==========================================================================");
    console.log("SUCCESS: USER SERVER & REGISTRATION CITY ID ALIGNMENT VERIFIED 100%!");
    console.log("==========================================================================");
  } finally {
    userHttp.close();
    adminHttp.close();
    await mongoose.disconnect();
  }
}

testUserRegistration().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
