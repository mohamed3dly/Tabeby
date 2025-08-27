const express = require('express');
const router = express.Router();
const multiUpload = require('../middlewares/multer');
const authMiddleware = require("../middlewares/authMiddleware");
const { 
  uploadCertificate,
  getDoctorById,
  getAllDoctors,
  updateDoctorProfile,
  filterDoctors,
  getSpecialties
} = require('../controllers/doctorController');

router.post('/certificate', multiUpload, uploadCertificate);

// ثابتة الأول
router.get("/filter", filterDoctors);
router.get("/specialties", getSpecialties); 

// بعد كده الديناميكية
router.get('/:id', getDoctorById);
router.get('/', getAllDoctors);
router.patch("/:id", authMiddleware, updateDoctorProfile);

module.exports = router;
