const User = require("../models/user");
const PatientProfile = require("../models/patient");

// جلب بيانات مريض بالـ ID
const getPatientById = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select("-password");
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    const profile = await PatientProfile.findOne({ userId: patient._id });
    res.status(200).json({ user: patient, profile });
  } catch (error) {
    console.error("❌ Error getting patient:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// تحديث التاريخ المرضي للمريض
const updateMedicalHistory = async (req, res) => {
  try {
    const patientId = req.user.id; 
    const { history } = req.body;

    const updatedProfile = await PatientProfile.findOneAndUpdate(
      { userId: patientId },
      { medicalHistory: history },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    res.status(200).json({ message: "Medical history updated successfully", profile: updatedProfile });
  } catch (error) {
    console.error("❌ Error updating medical history:", error);
    res.status(500).json({ message: "Failed to update medical history", error: error.message });
  }
};

// رفع ملفات المريض
const uploadPatientFile = async (req, res) => {
  try {
    const patientId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ تحقق من نوع الملف
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Allowed types: JPG, PNG, PDF" });
    }

    const profile = await PatientProfile.findOne({ userId: patientId });
    if (!profile) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    profile.documents.push({
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      uploadedAt: new Date()
    });

    await profile.save();
    res.status(200).json({ message: "File uploaded successfully", documents: profile.documents });
  } catch (error) {
    console.error("❌ Error uploading patient file:", error);
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
};

module.exports = {
  getPatientById,
  updateMedicalHistory,
  uploadPatientFile
};
