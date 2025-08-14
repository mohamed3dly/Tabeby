const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require('../middlewares/authMiddleware');

router.post("/", authMiddleware, bookingController.createBooking);
router.get("/:id", authMiddleware, bookingController.getBookingById);
router.get("/user/:userId", authMiddleware, bookingController.getBookingsByUser);
router.patch("/:id/cancel", authMiddleware, bookingController.cancelBooking);
router.get("/doctor/:doctorId", authMiddleware, bookingController.getBookingsByDoctor);
router.patch("/:id/confirm", authMiddleware, bookingController.confirmBooking);

module.exports = router;
