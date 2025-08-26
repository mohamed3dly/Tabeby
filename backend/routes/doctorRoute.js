const express = require('express');
const router = express.Router();
const multiUpload = require('../middlewares/multer');
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadCertificate ,getDoctorById,getAllDoctors,updateDoctorProfile,filterDoctors,getSpecialties} = require('../controllers/doctorController');

router.post('/certificate',multiUpload, uploadCertificate);
router.get('/:id', getDoctorById);
router.get('/', getAllDoctors);
router.patch("/:id", authMiddleware, updateDoctorProfile);
router.get("/filter", filterDoctors);
router.get("/specialties", getSpecialties); // API للتخصصات



module.exports = router;
