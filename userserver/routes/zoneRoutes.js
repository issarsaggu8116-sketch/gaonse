import express from "express";
import { getZones, createZone } from "../controllers/zoneController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getZones);
router.post("/", isAuthenticated, createZone);

export default router;