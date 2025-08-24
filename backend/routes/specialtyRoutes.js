const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctor");
const Nurse = require("../models/nurse");

// Get doctor specialties from schema enum
router.get("/doctors", (req, res) => {
  const specialties = Doctor.schema.path("specialty").enumValues;
  res.json(specialties);
});

// Get nurse specialties from schema enum
router.get("/nurses", (req, res) => {
  const specialties = Nurse.schema.path("specialty").enumValues;
  res.json(specialties);
});

module.exports = router;
