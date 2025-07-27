const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const { uploadCertificate } = require('../controllers/doctorController');

router.post('/certificate', upload.single('file'), uploadCertificate);

module.exports = router;
