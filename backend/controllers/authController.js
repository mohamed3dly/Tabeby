const User = require('../models/user');
const Doctor = require('../models/doctor');
const Nurse = require('../models/nurse');
const Patient = require('../models/patient');

const jwt = require('jsonwebtoken');
// authController.js
const { google } = require("googleapis");

const getGoogleAuthUrl = (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline", // عشان نرجّع refresh_token
    prompt: "consent", // يجبره يدي صلاحيات من جديد
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/calendar",
    ],
  });

  res.send({ url });
};

const googleOAuthCallback = async (req, res) => {
  const { code } = req.query;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // استخرج الـ userId من التوكن بتاعنا (اللي جاي من الفرونت)
    const decoded = jwt.verify(req.cookies.jwt || req.query.token, process.env.JWT_SECRET);

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        "google.accessToken": tokens.access_token,
        "google.refreshToken": tokens.refresh_token,
      },
      { new: true }
    );

    res.json({ message: "✅ Google Calendar connected successfully", user });
  } catch (err) {
    console.error("❌ Google OAuth error:", err.response?.data || err.message, err);
    res.status(500).json({ message: "Failed to connect to Google" });
  }
};

// const googleOAuthCallback = async (req, res) => {
//   const { code } = req.query;
//   console.log("🔑 Received code:", code);

//   const oauth2Client = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     process.env.GOOGLE_REDIRECT_URI
//   );

//   try {
//     const { tokens } = await oauth2Client.getToken(code);
//     console.log("📥 Tokens:", tokens);

//     oauth2Client.setCredentials(tokens);

//     const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
//     const { data: profile } = await oauth2.userinfo.get();
//     console.log("👤 User info:", profile);

//     const user = await User.findOneAndUpdate(
//       { email: profile.email },
//       {
//         "google.accessToken": tokens.access_token,
//         "google.refreshToken": tokens.refresh_token,
//         "google.email": profile.email,
//       },
//       { new: true }
//     );

//     res.json({ message: "✅ User connected to Google", user });
//   } catch (err) {
//     console.error("❌ Google OAuth error:", err.response?.data || err.message, err);
//     res.status(500).json({ message: "Failed to connect to Google" });
//   }
// };


// ==============================
// 1. Check if Email Exists
// ==============================
const checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) return res.status(200).json({ exists: true, role: user.role });
    return res.status(200).json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ==============================
// 2. Google Login (Step 1)
// ==============================
const googleLogin = async (req, res) => {
  const {
    email,
    fullName,
    phone,
    gender,
    location,
    birthDate,
    role,
    googleId,
    accessToken,
    refreshToken,
    extraData
  } = req.body;

  try {
    let user = await User.findOne({ email });

    // =============== CASE: New user, register now ===============
    if (!user) {
      user = await User.create({
        fullName,
        email,
        phone,
        gender,
        location,
        birthDate,
        role,
        isVerified: true, // جاي من جوجل
        google: {
          googleId,
          accessToken,
          refreshToken
        }
      });

      // إنشاء بيانات إضافية حسب الـ role
      if (role === 'doctor') {
        await Doctor.create({
          userId: user._id,
          title: extraData.title,
          specialty: extraData.specialty,
          description: extraData.description,
          phone: phone,
          price: extraData.price,
          location: location,
          certificate: {
            fileUrl: extraData.certificate.fileUrl,
            fileType: extraData.certificate.fileType,
          },
          google: {
            accessToken,
            refreshToken,
          }
        });
      } else if (role === 'nurse') {
        await Nurse.create({
          userId: user._id,
          specialty: extraData.specialty,
          description: extraData.description,
          phone: phone,
          price: extraData.price,
          location: location,
          certificate: {
            fileUrl: extraData.certificate.fileUrl,
            fileType: extraData.certificate.fileType,
          }
        });
      } else if (role === 'patient') {
        await Patient.create({ userId: user._id });
      }

      return res.status(201).json({ message: 'Account registered, waiting for approval if required' });
    }

    // =============== CASE: User already exists ===============
    if ((user.role === 'doctor' || user.role === 'nurse') && !user.isVerified) {
      return res.status(403).json({ message: 'Account is waiting for admin approval' });
    }

    // login success
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
   console.error("LOGIN ERROR:", error);
res.status(500).json({ message: error.message });

  }
};

// ==============================
// 3. Complete Google Register
// ==============================
const completeGoogleRegister = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
      location,
      birthDate,
      role,
      googleId,
      accessToken,
      refreshToken,
      extraData,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email is already registered' });

    const newUser = await User.create({
      fullName,
      email,
      phone,
      gender,
      location,
      birthDate,
      isVerified: true, // جاي من جوجل فمفترض موثوق
      role,
      google: {
        googleId,
        accessToken,
        refreshToken,
      }
    });

    // Add extra info by role
    if (role === 'doctor') {
      await Doctor.create({
        userId: newUser._id,
        title: extraData.title,
        specialty: extraData.specialty,
        description: extraData.description,
        phone: phone,
        price: extraData.price,
        location: location,
        certificate: {
          fileUrl: extraData.certificate.fileUrl,
          fileType: extraData.certificate.fileType,
        },
        google: {
          accessToken,
          refreshToken,
        }
      });
    } else if (role === 'nurse') {
      await Nurse.create({
        userId: newUser._id,
        specialty: extraData.specialty,
        description: extraData.description,
        phone: phone,
        price: extraData.price,
        location: location,
        certificate: {
          fileUrl: extraData.certificate.fileUrl,
          fileType: extraData.certificate.fileType,
        }
      });
    } else if (role === 'patient') {
      await Patient.create({
        userId: newUser._id,
      });
    }

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ message: 'Google registration complete', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during Google registration' });
  }
};
module.exports = {
  completeGoogleRegister,
  checkEmail,
  googleLogin,
  getGoogleAuthUrl,
  googleOAuthCallback
};
