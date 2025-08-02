const express = require('express');
const router = express.Router();
const {
  getPatientById,
  updateMedicalHistory,
  uploadPatientFile
} = require('../controllers/patientController');
const protect = require('../middlewares/authMiddleware');
const upload = require('../utils/uploadMiddleware'); // multer config

router.get('/:id', protect, getPatientById);
router.put('/history', protect, updateMedicalHistory);
router.post('/upload', protect, upload.single('file'), uploadPatientFile);

module.exports = router;
