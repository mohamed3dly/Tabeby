// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/check-email', authController.checkEmail);
router.post('/google-login', authController.googleLogin);
router.post('/google-register', authController.completeGoogleRegister);
router.get("/google-auth-url", authController.getGoogleAuthUrl);
router.get("/callback", authController.googleOAuthCallback);


module.exports = router;
