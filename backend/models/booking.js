const mongoose = require("mongoose");


const bookingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ["clinic"], // ممكن تزود قيم تانية لو عايز
    default: "clinic", // 👈 هنا خليتها Default علشان حتى لو منسيتش مبعوتة، يشتغل
    required: true,
  },
  googleEventId: { // 👈 ضفناها
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "confirmed",
  },
}, { timestamps: true });



module.exports = mongoose.model("Booking", bookingSchema);
