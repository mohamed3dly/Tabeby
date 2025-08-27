const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true }, // 👈 بدل Appointment
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ["EGP", "USD", "EUR"], default: "EGP" },
  paymentMethod: { type: String, enum: ["paymob", "vodafone_cash", "instapay", "credit_card"], default: "paymob" },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  paymobTransactionId: { type: String, trim: true },
  invoiceUrl: { type: String, trim: true },
  paymentDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  notes: { type: String, trim: true },
}, { timestamps: true });


module.exports = mongoose.model('Payment', paymentSchema);
