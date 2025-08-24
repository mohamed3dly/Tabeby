// routes/doctors.js
const express = require("express");
const router = express.Router();

const { getFilteredDoctors ,getAllDoctors} = require("../controllers/filter");

router.get("/filter", getFilteredDoctors); // /api/doctors
router.get("/doctors-filter", getAllDoctors);

module.exports = router;
