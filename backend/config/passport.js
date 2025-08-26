// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const User = require("../models/user"); // تأكدي ده المسار الصح

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ googleId: profile.id });

//         if (!user) {
//           user = await User.create({
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             googleId: profile.id,
//             google: {
//               accessToken,
//               refreshToken,
//             },
//           });
//         } else {
//           user.google.accessToken = accessToken;
//           user.google.refreshToken = refreshToken;
//           await user.save();
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/google/connect/callback",
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // دوري بالـ email الأول
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        // لو مش موجود أساساً → ما تعمليش create في CONNECT
        // ممكن تعمليه في SIGNUP بس
        return done(null, false, { message: 'No user found to connect' });
      }

      // اربطي حسابه بجوجل
      user.googleId = profile.id;
      user.google = { accessToken, refreshToken };
      await user.save();

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });
// passport.deserializeUser((id, done) => {
//   User.findById(id).then((user) => done(null, user));
// });
