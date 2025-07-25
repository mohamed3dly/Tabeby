
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, required: [true, "Email is required"], unique: true },
    phone: { type: String, required: [true, "Phone is required"] },
    location: { type: String },
    role: { type: String, enum: ["user", "doctor", "nurse"], required: true },
    medical_record_id: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalRecord" }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
