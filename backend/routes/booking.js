const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require('../middlewares/authMiddleware');

router.post("/", authMiddleware, bookingController.createBooking);
router.get("/:id",  authMiddleware, bookingController.getBookingById);
router.get("/user/:userId",authMiddleware, bookingController.getBookingsByUser);
router.patch("/:id/cancel",authMiddleware, bookingController.cancelBooking);

 router.get("/doctor/:doctorId", authMiddleware, bookingController.getBookingsByDoctor);
 router.patch("/:id/confirm",authMiddleware, bookingController.confirmBooking);
// =======
// const bookingController = require("../controllers/booking");
// const { protect } = require("../middlewares/authMiddleware");

// router.post("/", protect, bookingController.createBooking);
// router.get("/:id", protect, bookingController.getBookingById);
// router.get("/user/:userId", protect, bookingController.getBookingsByUser);
// router.patch("/:id/cancel", protect, bookingController.cancelBooking);

// router.get("/doctor/:doctorId", protect, bookingController.getBookingsByDoctor);
// router.patch("/:id/confirm", protect, bookingController.confirmBooking);
// >>>>>>> f2a521d65dc8475fea0fc8df1383b22a17fc4075

module.exports = router;
