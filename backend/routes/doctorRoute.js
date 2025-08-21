const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const authMiddleware = require("../middlewares/authMiddleware");
const getSortedData = require("../utils/sort");

const {
  getDoctorById,
  getAllDoctors,
  updateDoctorProfile,
} = require("../controllers/doctorController");

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
