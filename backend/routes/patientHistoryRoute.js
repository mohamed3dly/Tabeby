const express = require("express");
const router = express.Router();
const { updateHistoryByPatient } = require("../controllers/history.controller");

// PUT /api/history/patient/:patientId
router.put("/patient/:patientId", updateHistoryByPatient);

module.exports = router;
