const express = require("express");
const router = express.Router();
const { 
  getAllNurses, 
  getNurseById, 
  updateNurseProfile, 
  uploadNurseCertificate,
  addNurse
} = require("../controllers/nurseController");

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

// GET /nurses (مع إمكانية الفرز)
router.get("/", authMiddleware, getAllNurses);

// GET /nurses/:id
router.get("/:id", authMiddleware, getNurseById);

// PATCH /nurses/:id
router.patch("/:id", authMiddleware, updateNurseProfile);

// POST /nurses/add
router.post(
  "/add",
  authMiddleware,
  upload.single("image"), // رفع صورة للممرض
  addNurse
);

module.exports = router;
