import { City } from "../models/City.js";
import { Admin } from "../models/Admin.js";

// 🏙 CREATE CITY
export const createCity = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "City name is required" });
    }

    const city = await City.create({ name: name.trim() });
    res.status(201).json({ success: true, city });
  } catch (error) {
    console.error("Create City Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to create city" });
  }
};

// 📃 GET CITIES
export const getCities = async (req, res) => {
  try {
    const cities = await City.find();
    res.json({ success: true, cities });
  } catch (error) {
    console.error("Get Cities Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch cities" });
  }
};

// 🏙 UPDATE CITY
export const updateCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json({ success: true, city });
  } catch (error) {
    console.error("Update City Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to update city" });
  }
};

// 🏙 DELETE CITY
export const deleteCity = async (req, res) => {
  try {
    await City.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "City deleted" });
  } catch (error) {
    console.error("Delete City Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to delete city" });
  }
};

// 👨‍💼 CREATE ADMIN
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, city } = req.body;

    if (!name || !email || !password || !city) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin with this email already exists" });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      city,
      role: "admin",
    });

    res.status(201).json({ success: true, admin });
  } catch (error) {
    console.error("Create Admin Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to create admin" });
  }
};

// 📃 GET ADMINS
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate("city");
    res.json({ success: true, admins });
  } catch (error) {
    console.error("Get Admins Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch admins" });
  }
};

// 👨‍💼 UPDATE ADMIN
export const updateAdmin = async (req, res) => {
  try {
    const { name, email, city, isActive } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { name, email, city, isActive },
      { new: true }
    );

    res.json({ success: true, admin });
  } catch (error) {
    console.error("Update Admin Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to update admin" });
  }
};

// 👨‍💼 DELETE ADMIN
export const deleteAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Admin deleted" });
  } catch (error) {
    console.error("Delete Admin Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to delete admin" });
  }
};
