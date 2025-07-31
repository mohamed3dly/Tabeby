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
  updateUser
} = require("../controllers/userController");

const upload = require("../middlewares/multer");

router.post("/register", upload.single("certificate"), registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOtp);
router.post("/logout", logoutUser);
router.get("/getUser", authMiddleware, getUser);
router.patch("/updateUser", authMiddleware, updateUser);


module.exports = router;
