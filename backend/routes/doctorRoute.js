const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadCertificate, getDoctorById, getAllDoctors, updateDoctorProfile } = require('../controllers/doctorController');

router.post('/certificate', upload.single('file'), uploadCertificate);

// خلي الـ route العام الأول
router.get('/', getAllDoctors);

// بعدين route بتاع الـ id
router.get('/:id', getDoctorById);

router.patch("/:id", authMiddleware, updateDoctorProfile);

module.exports = router;