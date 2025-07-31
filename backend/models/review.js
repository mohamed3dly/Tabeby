const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        trim: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient is required']
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

reviewSchema.pre('validate', function (next) {
    if (!this.doctor && !this.nurse) {
        next(new Error('Review must be for either a doctor or a nurse'));
    } else {
        next();
    }
});

module.exports = mongoose.model("Review", reviewSchema);
