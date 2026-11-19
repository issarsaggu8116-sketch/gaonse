import express from "express";
import {
  createCity,
  getCities,
  updateCity,
  deleteCity,
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
} from "../controllers/masterController.js";
import { isMaster } from "../middleware/isMaster.js";

const router = express.Router();

// 🏙 Cities (supports both /cities and /city)
router.post("/cities/create", isMaster, createCity);
router.post("/city/create", isMaster, createCity);
router.post("/cities", isMaster, createCity);
router.post("/city", isMaster, createCity);

router.get("/cities", getCities);
router.get("/city", getCities);

router.put("/cities/:id", isMaster, updateCity);
router.put("/city/:id", isMaster, updateCity);

router.delete("/cities/:id", isMaster, deleteCity);
router.delete("/city/:id", isMaster, deleteCity);

// 👨‍💼 Admins (supports both /admins and /admin)
router.post("/admins/create", isMaster, createAdmin);
router.post("/admin/create", isMaster, createAdmin);
router.post("/admins", isMaster, createAdmin);
router.post("/admin", isMaster, createAdmin);

router.get("/admins", isMaster, getAdmins);
router.get("/admin", isMaster, getAdmins);

router.put("/admins/:id", isMaster, updateAdmin);
router.put("/admin/:id", isMaster, updateAdmin);

router.delete("/admins/:id", isMaster, deleteAdmin);
router.delete("/admin/:id", isMaster, deleteAdmin);

export default router;
