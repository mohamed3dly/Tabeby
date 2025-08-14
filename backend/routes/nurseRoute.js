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
const getSortedData = require("../utils/sort");


// GET /nurses
router.get("/", authMiddleware, getAllNurses);

// GET /nurses/:id
router.get("/:id", authMiddleware, getNurseById);

// PATCH /nurses/:id
router.patch("/:id", authMiddleware, updateNurseProfile);

// POST /nurses/certificate
// router.post("/certificate", authMiddleware, upload.single("certificate"), uploadNurseCertificate);
router.get('/nurses', async (req, res) => {
  const sortBy = req.query.sortBy; // 'name' أو 'rating'
  try {
    const nurses = await getSortedData('nurse', sortBy);
    res.json(nurses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
