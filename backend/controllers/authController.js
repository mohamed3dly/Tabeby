const User = require('../models/user');
const Doctor = require('../models/doctor');
const Nurse = require('../models/nurse');
const Patient = require('../models/patient');
const jwt = require('jsonwebtoken');
const { google } = require("googleapis");

// Helper: Create OAuth2 Client
const createOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

// Helper: Generate JWT
const generateToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

// ==============================
// 1. Get Google Auth URL
// ==============================
const getGoogleAuthUrl = (req, res) => {
  const oauth2Client = createOAuthClient();

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/calendar",
    ],
  });

  res.json({ url });
};

// ==============================
// 2. Google OAuth Callback
// ==============================
const googleOAuthCallback = async (req, res) => {
  const { code } = req.query;
  console.log("🔑 Received code:", code);

  const oauth2Client = createOAuthClient();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();
    console.log("👤 User info:", profile);

    const user = await User.findOneAndUpdate(
      { email: profile.email },
      {
        "google.accessToken": tokens.access_token,
        "google.refreshToken": tokens.refresh_token,
        "google.email": profile.email,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    res.json({ message: "✅ User connected to Google", user });
  } catch (err) {
    console.error("❌ Google OAuth error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to connect to Google" });
  }
};

// ==============================
// 3. Check if Email Exists
// ==============================
const checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    res.status(200).json({ exists: !!user, role: user?.role || null });
  } catch (error) {
    console.error("Check Email Error:", error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ==============================
// 4. Google Login / Register
// ==============================
const googleLogin = async (req, res) => {
  const { email, fullName, phone, gender, location, birthDate, role, googleId, accessToken, refreshToken, extraData } = req.body;

  try {
    let user = await User.findOne({ email });

    // New user
    if (!user) {
      user = await User.create({
        fullName,
        email,
        phone,
        gender,
        location,
        birthDate,
        role,
        isVerified: true,
        google: { googleId, accessToken, refreshToken }
      });

      // Create role-specific data
      if (role === 'doctor') {
        await Doctor.create({
          userId: user._id,
          title: extraData?.title,
          specialty: extraData?.specialty,
          description: extraData?.description,
          phone,
          price: extraData?.price,
          location,
          certificate: extraData?.certificate || {},
          google: { accessToken, refreshToken }
        });
      } else if (role === 'nurse') {
        await Nurse.create({
          userId: user._id,
          specialty: extraData?.specialty,
          description: extraData?.description,
          phone,
          price: extraData?.price,
          location,
          certificate: extraData?.certificate || {}
        });
      } else if (role === 'patient') {
        await Patient.create({ userId: user._id });
      }

      return res.status(201).json({ message: 'Account registered, waiting for approval if required' });
    }

    // Existing but not verified
    if ((user.role === 'doctor' || user.role === 'nurse') && !user.isVerified) {
      return res.status(403).json({ message: 'Account is waiting for admin approval' });
    }

    // Successful login
    const token = generateToken(user);
    return res.status(200).json({ message: 'Login successful', token });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// 5. Complete Google Register
// ==============================
const completeGoogleRegister = async (req, res) => {
  const { fullName, email, phone, gender, location, birthDate, role, googleId, accessToken, refreshToken, extraData } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const newUser = await User.create({
      fullName,
      email,
      phone,
      gender,
      location,
      birthDate,
      isVerified: true,
      role,
      google: { googleId, accessToken, refreshToken }
    });

    if (role === 'doctor') {
      await Doctor.create({
        userId: newUser._id,
        title: extraData?.title,
        specialty: extraData?.specialty,
        description: extraData?.description,
        phone,
        price: extraData?.price,
        location,
        certificate: extraData?.certificate || {},
        google: { accessToken, refreshToken }
      });
    } else if (role === 'nurse') {
      await Nurse.create({
        userId: newUser._id,
        specialty: extraData?.specialty,
        description: extraData?.description,
        phone,
        price: extraData?.price,
        location,
        certificate: extraData?.certificate || {}
      });
    } else if (role === 'patient') {
      await Patient.create({ userId: newUser._id });
    }

    const token = generateToken(newUser);
    res.status(201).json({ message: 'Google registration complete', token });

  } catch (err) {
    console.error("Complete Google Register Error:", err);
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
