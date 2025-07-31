const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  }
});

module.exports = mongoose.model("OTP", otpSchema);