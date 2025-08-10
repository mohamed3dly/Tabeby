// // config/passport.js
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const User = require("../models/user");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//       scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
//       accessType: "offline",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       // المستخدم الحالي عامل login، بنربط حساب جوجل
//       try {
//         const userId = profile._json.sub;
//         const email = profile._json.email;

//         // ❗ هنا: انتِ لازم توصلي الـ user اللي عامل login، مثلًا من session أو jwt
//         // بشكل مبسط نعمل تحديث لبيانات المستخدم:
//         const user = await User.findOneAndUpdate(
//           { email },
//           {
//             google: {
//               accessToken,
//               refreshToken,
//               googleId: userId,
//             },
//           },
//           { new: true }
//         );

//         done(null, user);
//       } catch (err) {
//         done(err, null);
//       }
//     }
//   )
// );
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const passport = require('passport');

// const User = require("../models/user");
// const jwt = require("jsonwebtoken");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//       passReqToCallback: true,
//     },
//     async (req, accessToken, refreshToken, profile, done) => {
//       try {
//         const token = req.session.jwtToken;
//         if (!token) return done(new Error("Missing token"), null);

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const userId = decoded.id;

//         const user = await User.findById(userId);

//         if (!user || (user.role !== "doctor" && user.role !== "nurse")) {
//           return done(null, false);
//         }

//         user.google = {
//           googleId: profile.id,
//           accessToken,
//           refreshToken,
//         };

//         await user.save();

//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user"); // تأكدي ده المسار الصح

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            google: {
              accessToken,
              refreshToken,
            },
          });
        } else {
          user.google.accessToken = accessToken;
          user.google.refreshToken = refreshToken;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => done(null, user));
});
