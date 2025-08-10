const axios = require("axios");
const Booking = require("../models/booking");
const User = require("../models/user");
const Doctor = require("../models/doctor");
const { createGoogleCalendarEvent } = require("../utils/googleAvailability");

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

exports.initiatePaymobPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("userId").populate("doctorId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Step 1: Auth token
    const authRes = await axios.post("https://accept.paymob.com/api/auth/tokens", {
      api_key: PAYMOB_API_KEY,
    });

    const token = authRes.data.token;

    // Step 2: Order registration
    const orderRes = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
      auth_token: token,
      delivery_needed: "false",
      amount_cents: booking.type === "online" ? 5000 : 8000, // Example: 50 EGP or 80 EGP
      currency: "EGP",
      items: [],
    });

    const orderId = orderRes.data.id;

    // Step 3: Payment Key
    const paymentKeyRes = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
      auth_token: token,
      amount_cents: booking.type === "online" ? 5000 : 8000,
      expiration: 3600,
      order_id: orderId,
      currency: "EGP",
      integration_id: INTEGRATION_ID,
      billing_data: {
        email: booking.userId.email,
        first_name: booking.userId.name,
        last_name: "Patient",
        phone_number: booking.userId.phone || "01000000000",
        apartment: "NA",
        floor: "NA",
        street: "NA",
        building: "NA",
        city: "Cairo",
        country: "EG",
        state: "Cairo",
      },
    });

    const paymentToken = paymentKeyRes.data.token;

    // Step 4: Return iframe URL
    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentToken}`;

    res.status(200).json({ paymentUrl });

  } catch (error) {
    console.error("❌ Error in Paymob Payment:", error.message);
    res.status(500).json({ message: "Paymob payment failed" });
  }
};

exports.paymobWebhook = async (req, res) => {
  try {
    const data = req.body;

    // تحقق إن الدفع ناجح فعلاً من Paymob
    if (data.obj && data.obj.success === true && data.obj.order) {
      const bookingId = data.obj.order.merchant_order_id;

      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: "الحجز غير موجود" });

      // متأكدين خلاص إن الدفع تم
      booking.status = "confirmed";
      await booking.save();

      const user = await User.findById(booking.userId);
      const doctor = await Doctor.findById(booking.doctorId);

      // اضف الحجز لـ Google Calendar
      if (
        doctor?.google?.accessToken &&
        doctor?.google?.refreshToken &&
        user?.google?.email
      ) {
        const eventId = await createGoogleCalendarEvent(doctor, user.google.email, {
          date: booking.date,
          type: booking.type,
          hostName: doctor.name,
          guestName: user.name,
        });

        if (eventId) {
          booking.googleEventId = eventId;
          await booking.save();
        }
      }

      return res.status(200).json({ message: "✅ الدفع تم والحجز اتأكد" });
    } else {
      return res.status(400).json({ message: "❌ فشل في تأكيد الدفع من Paymob" });
    }
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};