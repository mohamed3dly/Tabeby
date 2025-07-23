const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        default: null
    },
    nurse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nurse',
        default: null
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("Review", reviewSchema)