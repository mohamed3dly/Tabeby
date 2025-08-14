const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const authMiddleware = require("../middlewares/authMiddleware");
const getSortedData = require("../utils/sort");

const {
  uploadCertificate,
  getDoctorById,
  getAllDoctors,
  updateDoctorProfile,
} = require("../controllers/doctorController");

router.post("/certificate", upload.single("file"), uploadCertificate);
router.get("/:id", getDoctorById);
router.get("/", getAllDoctors);
router.patch("/:id", authMiddleware, updateDoctorProfile);

router.get("/doctors", async (req, res) => {
  const sortBy = req.query.sortBy; // 'name' أو 'rating'
  try {
    const doctors = await getSortedData("doctor", sortBy);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
