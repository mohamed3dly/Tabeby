const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Step 1: Start Google Auth
router.get('/google', (req, res, next) => {
  const token = req.query.token;
  if (!token) return res.status(400).send("Token is required");

  req.session = req.session || {};
  req.session.jwtToken = token;

  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar'
    ],
    accessType: 'offline',
    prompt: 'consent',
  })(req, res, next);
});

// Step 2: Callback from Google
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/failed',
  }),
  (req, res) => {
    res.redirect("http://localhost:4200/profile?google=connected");
  }
);

// Step 3: Fail
router.get('/failed', (req, res) => {
  res.status(401).json({ message: "فشل ربط حساب Google" });
});

// Step 4: Success (اختياري)
router.get('/success', (req, res) => {
  res.send("تم ربط حسابك بجوجل بنجاح ✅");
});

module.exports = router;
