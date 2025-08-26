
const express = require('express');
const passport = require('passport');
const User = require('../models/user'); // لازم تتأكد إن المسار ده صح
const router = express.Router();

/* ------------------------- SIGN UP WITH GOOGLE ------------------------- */
// تسجيل جديد بحساب جوجل
router.get('/google/signup',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/signup/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/sign-up?google=failed' }),
  async (req, res) => {
    try {
      // لو المستخدم موجود مسبقاً → رجعه على طول
      let user = await User.findOne({ email: req.user.email });

      if (!user) {
        // لو مش موجود → أنشئ مستخدم جديد
        user = new User({
          fullName: req.user.displayName || 'Google User',
          email: req.user.email,
          googleId: req.user.googleId,
          google: {
            accessToken: req.user.google.accessToken,
            refreshToken: req.user.google.refreshToken,
          },
          isVerified: true // اعتبره verified لأنه من Google
        });
        await user.save();
      }

      // رجع للفرونت
      res.redirect('http://localhost:3000/sign-up?google=connected');
    } catch (err) {
      console.error(err);
      res.redirect('http://localhost:3000/sign-up?google=error');
    }
  }
);

/* ------------------------- CONNECT GOOGLE (UPDATE) ------------------------- */
// ربط حساب موجود بجوجل (لـ Calendar مثلاً)
// router.get('/google/connect',
//   passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'] })
// );
router.get('/google/connect',
  (req, res, next) => {
    console.log("Redirecting to Google with callback:", 
      "http://localhost:3000/api/auth/google/connect/callback");
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'] })
);

router.get('/google/connect/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:4200/about-us?google=failed' }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.redirect('http://localhost:4200/about-us?google=nouser');

      user.googleId = req.user.googleId;
      user.google = {
        accessToken: req.user.google.accessToken,
        refreshToken: req.user.google.refreshToken,
      };

      await user.save();

      res.redirect('http://localhost:4200/about-us?google=connected');
    } catch (err) {
      console.error(err);
      res.redirect('http://localhost:4200/about-us?google=error');
    }
  }
);



/* ------------------------- DISCONNECT ------------------------- */
// API لإلغاء الربط
router.post('/disconnect', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    req.user.google = undefined;
    req.user.googleId = undefined;
    await req.user.save();
    res.json({ message: 'Google disconnected' });
  } catch (err) {
    res.status(500).json({ message: 'Error disconnecting Google', error: err });
  }
});

module.exports = router;
