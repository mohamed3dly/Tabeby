const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require('../middlewares/authMiddleware');
const User = require("../models/user");
const Doctor = require("../models/doctor"); // 👈 ضيفي دي

const { isUserAvailable, createCalendarEvent } = require("../utils/googleCalendar");


router.get("/free-slots", async (req, res) => {
  
   try {
    console.log("📩 Query received:", req.query); // 👈 اطبع القيم اللي جايه من Angular

    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ message: "Missing doctorId or date" });
    }

    // ⬅️ هات الدكتور وربط مع اليوزر
    const doctor = await Doctor.findById(doctorId).populate("userId");
    if (!doctor || !doctor.userId?.google?.accessToken) {
      return res.status(400).json({ message: "Doctor not connected to Google" });
    }

    const googleData = doctor.userId.google; // ⬅️ tokens من User

    const dayStart = new Date(date);
    dayStart.setHours(9, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(17, 0, 0);

    let slots = [];
    let current = new Date(dayStart);

    while (current < dayEnd) {
      let next = new Date(current);
      next.setMinutes(current.getMinutes() + 30);

      const available = await isUserAvailable(
  doctor.userId._id,   // هنا تبعت userId
  googleData,
  current,
  next
);


      if (available) {
        slots.push({
          start: current.toISOString(),
          end: next.toISOString(),
        });
      }

      current = next;
    }

    res.json(slots);
  } catch (error) {
    console.error("❌ Error fetching free slots:", error);
    res.status(500).json({ message: "Error fetching free slots", error: error.message });
  }
});




router.get("/user/:userId", authMiddleware, bookingController.getBookingsByUser);

// doctor bookings
router.get("/doctor/:doctorId", authMiddleware, bookingController.getBookingsByDoctor);

// باقي الـ routes
router.post("/", authMiddleware, bookingController.createBooking);
router.get("/:id", authMiddleware, bookingController.getBookingById);
router.patch("/:id/cancel", authMiddleware, bookingController.cancelBooking);
module.exports = router;
