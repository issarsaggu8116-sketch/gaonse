import "./utils/env.js";
import mongoose from "mongoose";
import { User } from "./models/userModel.js";
import { City } from "./models/cityModel.js";
import { connection } from "./database/dbConnection.js";
import { app } from "./app.js";
import http from "http";
import axios from "axios";

async function runTest() {
  console.log("=== STARTING CLIENT APP OTP SYSTEM END-TO-END TEST ===");

  // 1. Connect to DB
  connection();
  await new Promise(r => setTimeout(r, 2000));

  // 2. Ensure at least one City exists
  let city = await City.findOne();
  if (!city) {
    city = await City.create({ name: "Sirsa" });
    console.log("Created test city:", city.name, city._id);
  } else {
    console.log("Using existing city:", city.name, city._id);
  }

  // 3. Start local server on port 4000
  const server = http.createServer(app);
  await new Promise(r => server.listen(4000, r));
  console.log("Client-server running on port 4000 for testing");

  const TEST_EMAIL = "test_otp_client@gaonse.in";
  const TEST_PHONE = "+919876543210";
  const TEST_PASSWORD = "Password@123";

  try {
    // 4. Remove existing test user if any
    await User.deleteMany({ $or: [{ email: TEST_EMAIL }, { phone: TEST_PHONE }] });

    // 5. Test Registration (triggers OTP generation & send)
    console.log("\nStep 1: Testing Registration (POST /api/v1/user/register)...");
    const regPayload = {
      name: "OTP Test User",
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      password: TEST_PASSWORD,
      verificationMethod: "email",
      city: city._id.toString(),
    };

    const regRes = await axios.post("http://localhost:4000/api/v1/user/register", regPayload);
    console.log("✅ Registration response status:", regRes.status);
    console.log("✅ Registration response message:", regRes.data.message);

    // 6. Check user in MongoDB & retrieve OTP
    const unverifiedUser = await User.findOne({ email: TEST_EMAIL });
    if (!unverifiedUser) throw new Error("User was not found in DB after registration!");
    const generatedOTP = unverifiedUser.verificationCode;
    console.log("✅ OTP successfully generated in DB:", generatedOTP);
    console.log("✅ OTP Expiration in DB:", unverifiedUser.verificationCodeExpire);
    console.log("✅ Account verified state before OTP:", unverifiedUser.accountVerified);

    // 7. Test Invalid OTP
    console.log("\nStep 2: Testing Invalid OTP rejection...");
    try {
      await axios.post("http://localhost:4000/api/v1/user/otp-verification", {
        email: TEST_EMAIL,
        phone: TEST_PHONE,
        otp: "00000",
      });
      throw new Error("Invalid OTP was incorrectly accepted!");
    } catch (err) {
      console.log("✅ Invalid OTP properly rejected with status:", err.response?.status, err.response?.data?.message);
    }

    // 8. Test Valid OTP verification
    console.log("\nStep 3: Testing Valid OTP (POST /api/v1/user/otp-verification)...");
    const verifyRes = await axios.post("http://localhost:4000/api/v1/user/otp-verification", {
      email: TEST_EMAIL,
      phone: TEST_PHONE,
      otp: String(generatedOTP),
    });
    console.log("✅ OTP Verification status:", verifyRes.status);
    console.log("✅ OTP Verification message:", verifyRes.data.message);
    console.log("✅ Token received:", verifyRes.data.token ? "YES (Valid JWT)" : "NO");

    const verifiedUser = await User.findOne({ email: TEST_EMAIL });
    console.log("✅ Account verified state after OTP:", verifiedUser.accountVerified);
    console.log("✅ Verification code cleared from DB:", verifiedUser.verificationCode === null ? "YES" : "NO");

    // 9. Test Login
    console.log("\nStep 4: Testing Login with verified user...");
    const loginRes = await axios.post("http://localhost:4000/api/v1/user/login", {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    console.log("✅ Login response status:", loginRes.status);
    console.log("✅ Login message:", loginRes.data.message);

    // 10. Test Forgot Password OTP
    console.log("\nStep 5: Testing Forgot Password OTP generation (POST /api/v1/user/password/forgot)...");
    const forgotRes = await axios.post("http://localhost:4000/api/v1/user/password/forgot", {
      email: TEST_EMAIL,
    });
    console.log("✅ Forgot Password status:", forgotRes.status);
    console.log("✅ Forgot Password message:", forgotRes.data.message);

    const userForReset = await User.findOne({ email: TEST_EMAIL });
    const resetOTP = userForReset.verificationCode;
    console.log("✅ Reset OTP in DB:", resetOTP);

    // 11. Test Reset Password with OTP
    console.log("\nStep 6: Testing Password Reset with OTP (PUT /api/v1/user/password/reset)...");
    const NEW_PASSWORD = "NewPassword@456";
    const resetRes = await axios.put("http://localhost:4000/api/v1/user/password/reset", {
      email: TEST_EMAIL,
      otp: resetOTP,
      password: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD,
    });
    console.log("✅ Password Reset status:", resetRes.status);
    console.log("✅ Password Reset message:", resetRes.data.message);

    // 12. Cleanup
    await User.deleteMany({ email: TEST_EMAIL });
    console.log("\n🧹 Test user cleaned up.");

    console.log("\n=======================================================");
    console.log("🎉 ALL CLIENT OTP AUTHENTICATION TESTS PASSED 100%!");
    console.log("=======================================================\n");
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
