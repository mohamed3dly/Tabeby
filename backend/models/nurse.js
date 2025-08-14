const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  start: { type: String, required: true }, // HH:mm
  end: { type: String, required: true },   // HH:mm
  type: { type: String, enum: ["home", "clinic"], required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
});

const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
            "السبت",
            "الأحد",
            "الاثنين",
            "الثلاثاء",
            "الاربعاء",
            "الخميس",
            "الجمعة",
          ],
    required: true,
  },
  slots: [slotSchema]
});

const nurseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    specialty: {
      type: String,
      enum: [
        "تمريض المسنين",
        "تمريض النساء والتوليد",
        "تمريض الحالات الحرجة",
        "تمريض الأطفال",
        "تمريض الصحة العامة",
        "تمريض الباطني والجراحي"
      ],
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true
    },
    certificate: {
      fileUrl: { type: String, required: true },
      fileType: { type: String, required: true },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
      },
      rejectionReason: String
    },
    isVerified: { type: Boolean, default: false },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"]
    },
    location: { type: String, required: true, trim: true },
    schedule: [scheduleSchema],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Nurse", nurseSchema);
