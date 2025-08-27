// const axios = require("axios");
// const Booking = require("../models/booking");
// const User = require("../models/user");
// const Doctor = require("../models/doctor");
// const { createGoogleCalendarEvent } = require("../utils/googleAvailability");

// const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
// const INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
// const IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

// exports.initiatePaymobPayment = async (req, res) => {
//   try {
//     const { bookingId } = req.body;

//     const booking = await Booking.findById(bookingId).populate("userId").populate("doctorId");
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     // Step 1: Auth token
//     const authRes = await axios.post("https://accept.paymob.com/api/auth/tokens", {
//       api_key: PAYMOB_API_KEY,
//     });

//     const token = authRes.data.token;

//     // Step 2: Order registration
//     // Step 2: Order registration
// const orderRes = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
//   auth_token: token,
//   delivery_needed: "false",
//   amount_cents: booking.type === "online" ? 5000 : 8000,
//   currency: "EGP",
//   items: [],
//   merchant_order_id: booking._id.toString(),  // 👈 مهم جداً
// });


//     const orderId = orderRes.data.id;

//     // Step 3: Payment Key
//     const paymentKeyRes = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
//       auth_token: token,
//       amount_cents: booking.type === "online" ? 5000 : 8000,
//       expiration: 3600,
//       order_id: orderId,
//       currency: "EGP",
//       integration_id: INTEGRATION_ID,
//       billing_data: {
//         email: booking.userId.email,
//         first_name: booking.userId.name,
//         last_name: "Patient",
//         phone_number: booking.userId.phone || "01000000000",
//         apartment: "NA",
//         floor: "NA",
//         street: "NA",
//         building: "NA",
//         city: "Cairo",
//         country: "EG",
//         state: "Cairo",
//       },
//     });

//     const paymentToken = paymentKeyRes.data.token;

//     // Step 4: Return iframe URL
//     const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentToken}`;

//     res.status(200).json({ paymentUrl });

//   } catch (error) {
//     console.error("❌ Error in Paymob Payment:", error.message);
//     res.status(500).json({ message: "Paymob payment failed" });
//   }
// };



// const crypto = require("crypto");
// const Payment = require("../models/payment");

// exports.paymobWebhook = async (req, res) => {
//   try {
//     const { obj, hmac } = req.body;

//     // ✅ verify HMAC
//     const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
//     const keys = [
//       "amount_cents",
//       "created_at",
//       "currency",
//       "error_occured",
//       "has_parent_transaction",
//       "id",
//       "integration_id",
//       "is_3d_secure",
//       "is_auth",
//       "is_capture",
//       "is_refunded",
//       "is_standalone_payment",
//       "is_voided",
//       "order.id",
//       "owner",
//       "pending",
//       "source_data.pan",
//       "source_data.sub_type",
//       "source_data.type",
//       "success",
//     ];

//     const concatStr = keys.map((k) => {
//       const val = k.includes(".") ? obj?.[k.split(".")[0]]?.[k.split(".")[1]] : obj?.[k];
//       return val ? val.toString() : "";
//     }).join("");

//     const calculatedHmac = crypto.createHmac("sha512", hmacSecret).update(concatStr).digest("hex");

//     if (calculatedHmac !== hmac) {
//       return res.status(403).json({ message: "Invalid HMAC - not from Paymob" });
//     }

//     // ✅ check payment success
//     if (obj.success && obj.order?.merchant_order_id) {
//       const bookingId = obj.order.merchant_order_id;

//       const booking = await Booking.findById(bookingId);
//       if (!booking) return res.status(404).json({ message: "الحجز غير موجود" });

//       booking.status = "confirmed";
//       await booking.save();

//       // 🔹 سجل في Payment Schema
//       await Payment.create({
//         orderId: obj.order.id,
//         bookingId: booking._id,
//         userId: booking.userId,
//         amount: obj.amount_cents / 100,
//         currency: obj.currency,
//         paymentMethod: "paymob",
//         paymentStatus: "paid",
//         paymobTransactionId: obj.id,
//         paymentDetails: obj,
//       });

//       return res.status(200).json({ message: "✅ الدفع تم والحجز اتأكد" });
//     } else {
//       return res.status(400).json({ message: "❌ الدفع فشل" });
//     }
//   } catch (error) {
//     console.error("❌ Webhook error:", error.message);
//     res.status(500).json({ message: "خطأ في السيرفر" });
//   }
// };
// const axios = require("axios");
// const Booking = require("../models/booking");
// const Payment = require("../models/payment");
// const crypto = require("crypto");
// const { createPaymobOrder, generatePaymentKey, verifyHmac } = require("../services/paymobService");

// const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
// const INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
// const IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
// const HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET; // ضيفيه في .env

// // ✅ إنشاء لينك دفع

// exports.initiatePaymobPayment = async (req, res) => {
//   try {
//     const { bookingId } = req.body;
   
//    const booking = await Booking.findById(bookingId)
//   .populate({
//     path: "patientId",
//     populate: {
//       path: "userId",
//       model: "User",        // <<< لازم تحدد الموديل
//       select: "fullName email phone"
//     }
//   })
//   .populate({
//     path: "doctorId",
//     populate: {
//       path: "userId",
//       model: "User",        // <<< برضه هنا
//       select: "fullName email phone"
//     }
//   });

//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     // Step 1: Token
//     const authRes = await axios.post("https://accept.paymob.com/api/auth/tokens", {
//       api_key: process.env.PAYMOB_API_KEY,
//     });
//     const token = authRes.data.token;

//     // Step 2: Order
//     const orderRes = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
//       auth_token: token,
//       delivery_needed: false,
//       amount_cents: 5000,
//       currency: "EGP",
//       merchant_order_id: booking._id.toString(), // 👈 ربطناه بالحجز
//       items: [],
//     });
//     const orderId = orderRes.data.id;

//     // Step 3: Payment key
//     const paymentKeyRes = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
//       auth_token: token,
//       amount_cents: 5000,
//       expiration: 3600,
//       order_id: orderId,
//       currency: "EGP",
//       integration_id: process.env.PAYMOB_INTEGRATION_ID,
//       billing_data: {
//         first_name: booking.userId.name || "User",
//         last_name: "Patient",
//         email: booking.userId.email,
//         phone_number: booking.userId.phone || "01000000000",
//         apartment: "NA",
//         floor: "NA",
//         street: "NA",
//         building: "NA",
//         city: "Cairo",
//         country: "EG",
//         state: "Cairo",
//       },
//     });

//     const paymentToken = paymentKeyRes.data.token;
//     const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

//     res.status(200).json({ iframeUrl });
//   } catch (err) {
//     console.error("❌ Error initiating payment:", err.message);
//     res.status(500).json({ message: "Payment initiation failed" });
//   }
// };


// // ✅ Webhook من Paymob
// exports.paymobWebhook = async (req, res) => {
//   try {
//     const data = req.body;

//     // 1️⃣ تحقق من HMAC
//     const hmac = req.query.hmac || req.body.hmac;
//  // Paymob بيبعت HMAC في الـ query
//     const secret = process.env.PAYMOB_HMAC_SECRET;

//     // خلي الداتا sorted زي ما Paymob طالب
//     const keys = [
//       "amount_cents", "created_at", "currency", "error_occured", "has_parent_transaction",
//       "id", "integration_id", "is_3d_secure", "is_auth", "is_capture", "is_refunded",
//       "is_standalone_payment", "is_voided", "order.id", "owner", "pending",
//       "source_data.pan", "source_data.sub_type", "source_data.type", "success"
//     ];

//     let concatenated = "";
//     keys.forEach(k => {
//       const value = k.includes(".") ? data.obj?.order?.id : data.obj[k];
//       concatenated += value ? value.toString() : "";
//     });

//     const calculatedHmac = crypto
//       .createHmac("sha512", secret)
//       .update(concatenated)
//       .digest("hex");

//     if (calculatedHmac !== hmac) {
//       return res.status(400).json({ message: "❌ Invalid HMAC" });
//     }

//     // 2️⃣ اتأكد إن الدفع نجح
//     if (data.obj.success) {
//       const merchantOrderId = data.obj.order.merchant_order_id;

//       // نلاقي الحجز اللي معمول بالـ merchant_order_id
//       const booking = await Booking.findById(merchantOrderId);
//       if (!booking) return res.status(404).json({ message: "Booking not found" });

//       booking.status = "confirmed";
//       await booking.save();

//       return res.status(200).json({ message: "✅ Payment confirmed & booking updated" });
//     }

//     return res.status(400).json({ message: "❌ Payment failed" });
//   } catch (err) {
//     console.error("❌ Webhook error:", err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// controllers/paymentController.js
const axios = require("axios");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const User = require("../models/user");  // ✅ بدل Patient
const { createPaymobOrder, generatePaymentKey, verifyHmac } = require("../services/paymobService");

const INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

// 1️⃣ بدء الدفع
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    // هات الحجز
    const booking = await Booking.findById(bookingId)
      .populate("doctorId")
      .populate("patientId"); // patientId دلوقتي User

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // هات بيانات المريض من User
    const patient = await User.findById(booking.patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient (User) not found" });
    }

    // 1- أنشئ order عند Paymob
    const order = await createPaymobOrder(amount);

    // 2- أنشئ payment key
    const paymentKey = await generatePaymentKey(order.id, amount, patient.email, patient.phone || "01000000000");

    // 3- أنشئ Session في DB
    const payment = new Payment({
      bookingId: booking._id,
      patientId: patient._id,
      amount,
      status: "pending",
      provider: "paymob",
      orderId: order.id,
    });
    await payment.save();

    res.json({
      iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentKey}`,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("❌ Error initiating payment:", error.message);
    res.status(500).json({ message: "Error initiating payment", error: error.message });
  }
};

// 2️⃣ Webhook callback من Paymob
exports.handleCallback = async (req, res) => {
  try {
    const hmacVerified = verifyHmac(req.query, process.env.PAYMOB_HMAC);
    if (!hmacVerified) {
      return res.status(400).json({ message: "Invalid HMAC" });
    }

    const { obj } = req.body;
    const { order: { id: orderId }, success } = obj;

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = success ? "paid" : "failed";
    await payment.save();

    res.status(200).json({ message: "Payment status updated", payment });
  } catch (error) {
    console.error("❌ Error handling callback:", error.message);
    res.status(500).json({ message: "Error handling callback", error: error.message });
  }
};
