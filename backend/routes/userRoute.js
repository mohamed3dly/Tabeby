const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendOtp,
  logoutUser,
  getUser,
  updateUser,
  verifyOtpReset
} = require("../controllers/userController");

const upload = require("../middlewares/multer");
const authMiddleware = require("../middlewares/authMiddleware");


// routes/userRoute.js
router.get("/all", async (req, res) => {
  try {
    const users = await require("../models/user").find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/register", upload.single("certificate"), registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOtp);
router.post("/verify-otp-reset", verifyOtpReset);
router.post("/logout", logoutUser);
router.get("/getUser", authMiddleware, getUser);       
router.patch("/updateUser", authMiddleware, updateUser); 
// router.get("/getUser", authMiddleware, getUser);
// router.patch("/updateUser", authMiddleware, updateUser);
module.exports = router;
