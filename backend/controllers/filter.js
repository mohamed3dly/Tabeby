const Doctor = require("../models/doctor");
const User = require("../models/user");

// GET /api/doctors?gender=male&title=دكتور&specialty=باطنة&minPrice=100&maxPrice=500
const getFilteredDoctors = async (req, res) => {
  try {
    const { gender, title, specialty, minPrice, maxPrice } = req.query;

    // فلتر ديناميك
    let filter = {};

    if (title) {
      filter.title = title;
    }

    if (specialty) {
      filter.specialty = specialty;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // هات الدكاترة من Doctor Model
    let doctors = await Doctor.find(filter).populate("userId", "-password");

    // فلتر الـ gender من جدول الـ User (بعد الـ populate)
    if (gender) {
      doctors = doctors.filter(
        (doc) => doc.userId && doc.userId.gender === gender
      );
    }

    res.status(200).json(doctors);
  } catch (err) {
    console.error("❌ Error in getFilteredDoctors:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const getAllDoctors = async (req, res) => {
  try {
    // هات كل الدكاترة مع بيانات اليوزر المرتبط
    const doctors = await Doctor.find().populate("userId", "-password");

    res.status(200).json(doctors);
  } catch (err) {
    console.error("❌ Error in getAllDoctors:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getFilteredDoctors,getAllDoctors };
