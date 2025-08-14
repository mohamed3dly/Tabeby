const express = require('express');
const router = express.Router();
const {
  getPatientById,
  updateMedicalHistory,
  uploadPatientFile
} = require('../controllers/patientController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../utils/uploadMiddleware'); // multer config

router.get('/:id', authMiddleware, getPatientById);
router.put('/history', authMiddleware, updateMedicalHistory);
router.post('/upload', authMiddleware, upload.single('file'), uploadPatientFile);

module.exports = router;
