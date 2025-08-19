const Doctor = require('../models/doctor');
const User = require('../models/user');
const DoctorProfile = require('../models/doctor'); // ✅ لازم تستورديه

// 📌 رفع شهادة الطبيب
const uploadCertificate = async (req, res) => {
  try {
    const doctorId = req.user.id; // مفروض عندك protect middleware بيرجع user
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.certificate = {
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      status: 'pending'
    };

    await doctor.save();
    res.json({ message: 'Certificate uploaded and pending approval' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 📌 عرض جميع الأطباء
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");

    const doctorsWithProfiles = await Promise.all(
      doctors.map(async (doctor) => {
        const profile = await DoctorProfile.findOne({ userId: doctor._id });
        return { user: doctor, profile };
      })
    );

    res.status(200).json(doctorsWithProfiles);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 عرض طبيب حسب ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select('-password');
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const profile = await DoctorProfile.findOne({ userId: doctor._id });
    res.status(200).json({ user: doctor, profile });

  } catch (error) {
    res.status(500).json({ message: 'Error getting doctor', error: error.message });
  }
};

// 📌 تحديث بيانات الطبيب
const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const currentUser = req.user;

    if (currentUser.role !== "admin" && currentUser.userId !== doctorId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedProfile = await DoctorProfile.findOneAndUpdate(
      { userId: doctorId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    res.status(200).json({ message: "Doctor profile updated", updatedProfile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const addDoctor = async (req, res) => {
  try {
    const doctorData = req.body;

    // لو فيه شهادة
    if (req.files && req.files.certificate) {
      doctorData.certificate = {
        fileUrl: req.files.certificate[0].path,
        fileType: req.files.certificate[0].mimetype,
        status: "pending"
      };
    }

    // لو فيه صورة
    if (req.files && req.files.image) {
      doctorData.image = req.files.image[0].path;
    }

    const doctor = new Doctor(doctorData);
    await doctor.save();

    res.status(201).json({
      message: "Doctor added successfully",
      doctor
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
module.exports = {
  uploadCertificate,
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  addDoctor
};
