import { Zone } from "../models/zoneModel.js";

export const getZones = async (req, res) => {
  const query = req.query.cityId ? { city: req.query.cityId } : {};
  const zones = await Zone.find(query);
  res.json({ success: true, zones });
};

export const createZone = async (req, res) => {
  const zone = await Zone.create(req.body);
  res.json({ success: true, zone });
};