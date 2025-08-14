const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    validate: {
      validator: function (v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Full name must contain only letters and spaces'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email format']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+?[0-9\s\-()]{8,20}$/, 'Invalid phone number']
  },
  password: {
    type: String,
    required: [
      function () {
        return !this.google?.googleId; // Required لو مش داخل بجوجل
      },
      'Password is required'
    ],
    minlength: [8, 'Password must be at least 8 characters'],
    match: [/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}/, 'Invalid password format'],
    select: false // عشان مايرجعش الباسورد في الاستعلامات العادية
  },
   image: { type: String, default: 'default.png' },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'nurse', 'admin'],
    default: 'patient',
    lowercase: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Gender is required'],
    lowercase: true
  },
  location: {
    type: String,
    default: ''
  },
  birthDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value < new Date();
      },
      message: 'Birthdate must be in the past'
    }
  },
  google: {
    googleId: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// تشفير الباسورد قبل الحفظ
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ميثود لمقارنة الباسورد
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
