const User = require("../models/user");
const PatientProfile = require("../models/patient");

// GET /patients/:id
const getPatientById = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select("-password");
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    const profile = await PatientProfile.findOne({ userId: patient._id });

    res.status(200).json({ user: patient, profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /patients/history
const updateMedicalHistory = async (req, res) => {
  try {
    const patientId = req.user.id; // protect middleware
    const { history } = req.body;

    const updatedProfile = await PatientProfile.findOneAndUpdate(
      { userId: patientId },
      { medicalHistory: history },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    res.status(200).json({ message: "Medical history updated", profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: "Failed to update", error: error.message });
  }
};

// POST /patients/upload
const uploadPatientFile = async (req, res) => {
  try {
    const patientId = req.user.id;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const profile = await PatientProfile.findOne({ userId: patientId });
    if (!profile) return res.status(404).json({ message: "Patient not found" });

    // Push to an array of documents (مثلاً تقارير أو أشعة)
    profile.documents.push({
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      uploadedAt: new Date()
    });

    await profile.save();

    res.status(200).json({ message: "File uploaded", documents: profile.documents });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

module.exports = {
  getPatientById,
  updateMedicalHistory,
  uploadPatientFile
};
