const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
  type: { type: String, enum: ["online", "clinic", "home"], required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
});


const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ],
    required: true,
  },
  slots: [slotSchema]
});


const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  title: {
    type: String,
    enum: ["Doctor", "Consultant", "Professor"],
    required: true,
  },
  specialty: {
    type: String,
    enum: [
        "Dermatology",               // جلدية
        "Dentistry",                 // اسنان
        "Psychiatry",                // نفسي
        "Pediatrics and Neonatology",// اطفال وحديثي الولادة
        "Neurology",                 // مخ واعصاب
        "Orthopedics",               // عظام
        "Gynecology and Obstetrics", // نساء وتوليد
        "ENT",                       // انف واذن وحنجرة
        "Cardiology",                // قلب واوعية دموية
        "Interventional Radiology",  // الآشعة التداخلية
        "Hematology",                // امراض دم
        "Oncology",                  // اورام
        "Internal Medicine",         // باطنة
        "Nutrition and Weight Loss", // تخسيس وتغذية
        "Pediatric Surgery",         // جراحة اطفال
        "Oncological Surgery",       // جراحة أورام
        "Vascular Surgery",          // جراحة اوعية دموية
        "Plastic Surgery",           // جراحة تجميل
      ],
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  certificate: {
    fileUrl: {
      type: String, // رابط الشهادة (صورة أو PDF من Cloudinary أو AWS S3)
      required: true,
    },
    fileType: {
      type: String, // 'image/jpeg', 'application/pdf', إلخ
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String, // اختياري – لو اترفض يقدر الأدمن يكتب السبب
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
   isActive: {   // ✅ أضفنا الحقل هنا
    type: Boolean,
    default: true,
  },
  location: {
    type: String,
    required: true,
  },
  schedule: [
    {
      day: {
        type: String,
        enum: [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
      },
      slots: [String], // e.g. ['10:00', '11:00', '12:00']
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  google: {
    accessToken: String,
    refreshToken: String,
    calendarId: {
      type: String,
      default: "primary",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Doctor", doctorSchema);
