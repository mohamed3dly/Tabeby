const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: [true, "Patient ID is required"],
    },

    phone: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^[+]?[\d\s()-]{5,20}$/.test(v); // أي رقم من 5 لـ 20 رقم/رمز
            },
            message: 'Invalid phone number format'
        }
    },

    chronicDiseases: [
        {
            type: String,
            trim: true
        }
    ],

    surgeries: [
        {
            name: {
                type: String,
                trim: true,
                required: [true, "Surgery name is required"]
            },
            date: {
                type: Date,
                required: [true, "Surgery date is required"]
            },
            notes: {
                type: String,
                trim: true,
                required: [true, "Surgery notes are required"]
            }
        }
    ],

    medications: [
        {
            type: String,
            trim: true
        }
    ],

    visits: [
        {
            doctorName: {
                type: String,
                trim: true
            },
            date: {
                type: Date
            },
            diagnosis: {
                type: String,
                trim: true
            }
        }
    ],

    testFileUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Invalid URL format for test file'
        }
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("History", historySchema);
