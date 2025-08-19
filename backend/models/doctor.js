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

// Doctor Schema
const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    title: {
      type: String,
      enum: ["دكتور", "استشاري", "أستاذ دكتور"],
      required: true,
    },
    specialty: {
      type: String,
      enum: [
        "جلدية",
        "اسنان",
        "نفسي",
        "اطفال وحديثي الولادة",
        "مخ واعصاب",
        "عظام",
        "نساء وتوليد",
        "انف واذن وحنجرة",
        "قلب واوعية دموية",
        "الآشعة التداخلية",
        "امراض دم",
        "اورام",
        "باطنة",
        "تخسيس وتغذية",
        "جراحة اطفال",
        "جراحة أورام",
        "جراحة اوعية دموية",
        "جراحة تجميل",
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
      fileUrl: { type: String, required: true },
      fileType: { type: String, required: true },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      rejectionReason: String,
    },
    image: { type: String }, 
    isVerified: { type: Boolean, default: false },
    location: { type: String, required: true },
    schedule: [scheduleSchema],
    rating: { type: Number, default: 0 }, 
    totalReviews: { type: Number, default: 0 },
    google: {
      accessToken: String,
      refreshToken: String,
      calendarId: { type: String, default: "primary" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
