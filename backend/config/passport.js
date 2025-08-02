// config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
      accessType: "offline",
    },
    async (accessToken, refreshToken, profile, done) => {
      // المستخدم الحالي عامل login، بنربط حساب جوجل
      try {
        const userId = profile._json.sub;
        const email = profile._json.email;

        // ❗ هنا: انتِ لازم توصلي الـ user اللي عامل login، مثلًا من session أو jwt
        // بشكل مبسط نعمل تحديث لبيانات المستخدم:
        const user = await User.findOneAndUpdate(
          { email },
          {
            google: {
              accessToken,
              refreshToken,
              googleId: userId,
            },
          },
          { new: true }
        );

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
