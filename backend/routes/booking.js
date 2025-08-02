const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking");
const {protect} = require('../middlewares/authMiddleware');

router.post("/", protect, bookingController.createBooking);
router.get("/:id",  protect, bookingController.getBookingById);
router.get("/user/:userId",protect, bookingController.getBookingsByUser);
router.patch("/:id/cancel",protect, bookingController.cancelBooking);

 router.get("/doctor/:doctorId", protect, bookingController.getBookingsByDoctor);
 router.patch("/:id/confirm",protect, bookingController.confirmBooking);

module.exports = router;
