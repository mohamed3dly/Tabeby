const express = require("express");
const router = express.Router();
const { 
  getAllNurses, 
  getNurseById, 
  updateNurseProfile, 
  uploadNurseCertificate 
} = require("../controllers/nurseController");

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

// GET /nurses
router.get("/", authMiddleware, getAllNurses);

// GET /nurses/:id
router.get("/:id", authMiddleware, getNurseById);

// PATCH /nurses/:id
router.patch("/:id", authMiddleware, updateNurseProfile);

// POST /nurses/certificate
router.post("/certificate", authMiddleware, upload.single("certificate"), uploadNurseCertificate);

module.exports = router;
