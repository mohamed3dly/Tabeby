const Doctor = require('../models/doctor');
const User = require('../models/user');
const DoctorProfile = require('../models/doctor');

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
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const profile = await Doctor.findOne({ userId: user._id });
     console.log("User from DB:", user);
    console.log("Doctor profile from DB:", profile);
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.status(200).json({
  _id: user._id,
  fullName: user.fullName, // ✅ الاسم موجود هنا
  email: user.email,
  profileImage: user.image ? `/uploads/${user.image}` : 'https://via.placeholder.com/150', // ✅ الصورة
  specialty: profile.specialty,
  location: profile.location,
  description: profile.description,
  rating: profile.rating,
  experience: profile.experience || 0,
  patients: profile.patients || 0,
  price: profile.price,
  availableDates: profile.availableDates || [],
  availableTimes: profile.availableTimes || [],
});
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

const getAvailableDays = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("schedule");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // رجع الأيام اللي فيها slots فاضية
    const days = doctor.schedule
      .filter(d => d.slots.some(slot => !slot.isBooked))
      .map(d => d.day);

    res.json(days);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available days", error: error.message });
  }
};
const getAvailableTimes = async (req, res) => {
  try {
    const { id, day } = req.params;
    const doctor = await Doctor.findById(id).select("schedule");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const scheduleDay = doctor.schedule.find(d => d.day === day);
    if (!scheduleDay) return res.json([]);

    const times = scheduleDay.slots
      .filter(slot => !slot.isBooked)
      .map(slot => `${slot.start} - ${slot.end}`);

    res.json(times);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available times", error: error.message });
  }
};

module.exports = {
  uploadCertificate,
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getAvailableDays,
  getAvailableTimes
};
