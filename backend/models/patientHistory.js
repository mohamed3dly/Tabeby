const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "patients",
        required: [true, "Patient ID is required"],
    },
    chronicDisease1: {
        type: String,
        required: [true, "First chronic disease is required"],
    },
    chronicDisease2: {
        type: String,
        required: [true, "Second chronic disease is required"],
    },
    surgeryName: {
        type: String,
        required: [true, "Surgery name is required"],
    },
    surgeryDate: {
        type: Date,
        required: [true, "Surgery date is required"],
    },
    surgeryNotes: {
        type: String,
        required: [true, "Surgery notes are required"],
    },
    medication1: {
        type: String,
        required: [true, "First medication is required"],
    },
    
    allergy: {
        type: String,
        required: [true, "Allergy information is required"],
    },
    visitDoctorName: {
        type: String,
        required: [true, "Visit doctor name is required"],
    },
    visitDate: {
        type: Date,
        required: [true, "Visit date is required"],
    },
    visitDiagnosis: {
        type: String,
        required: [true, "Visit diagnosis is required"],
    },
    testFileUrl: {
        type: String,
        required: [true, "Test file URL is required"],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("History", historySchema);