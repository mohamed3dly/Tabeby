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
  addDoctor
} = require("../controllers/doctorController");

router.post("/add",upload.fields([{ name: "certificate", maxCount: 1 },{ name: "image", maxCount: 1 }]),addDoctor);

router.get("/doctors", async (req, res) => {
  const sortBy = req.query.sortBy;
  try {
    const doctors = await getSortedData("Doctor", sortBy);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", getDoctorById);
router.patch("/:id", authMiddleware, updateDoctorProfile);
router.get("/", getAllDoctors);

module.exports = router;
