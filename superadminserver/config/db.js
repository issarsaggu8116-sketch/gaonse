import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("👉 Please ensure your IP (or 0.0.0.0/0) is added in MongoDB Atlas -> Network Access.");
  }
};