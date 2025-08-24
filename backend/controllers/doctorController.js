const Doctor = require('../models/doctor');
const User = require('../models/user');

const uploadCertificate = async (req, res) => {
  const doctorId = req.user.id; // مفروض تكوني عاملة protect middleware
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  const doctor = await Doctor.findOne({ userId: doctorId });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

  doctor.certificate = {
    fileUrl: `/uploads/${file.filename}`,
    fileType: file.mimetype,
    status: 'pending'
  };

  await doctor.save();
  res.json({ message: 'Certificate uploaded and pending approval' });
};

// get all doctors

// const getAllDoctors = async (req, res) => {
//   try {
//     const doctors = await User.find({ role: "doctor" }).select("-password");

//     const doctorsWithProfiles = await Promise.all(
//       doctors.map(async (doctor) => {
//         const profile = await DoctorProfile.findOne({ userId: doctor._id });
//         return { user: doctor, profile };
//       })
//     );

//     res.status(200).json(doctorsWithProfiles);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
// // get doctors by id
// const getDoctorById = async (req, res) => {
//   try {
//     const doctor = await User.findById(req.params.id).select('-password');
//     if (!doctor || doctor.role !== 'doctor') {
//       return res.status(404).json({ message: 'Doctor not found' });
//     }

//     const profile = await DoctorProfile.findOne({ userId: doctor._id });
//     res.status(200).json({ user: doctor, profile });

//   } catch (error) {
//     res.status(500).json({ message: 'Error getting doctor', error: error.message });
//   }
// };
// ✅ Get all doctors
// const getAllDoctors = async (req, res) => {
//   try {
//     // 1️⃣ هات كل اليوزرز اللي ليهم role = doctor
//     const doctors = await User.find({ role: "doctor" }).select("-password");

//     // 2️⃣ اربط كل دكتور بالـ profile بتاعه
//     const doctorsWithProfiles = await Promise.all(
//       doctors.map(async (doctor) => {
//         const profile = await DoctorProfile.findOne({ userId: doctor._id });
//         return { user: doctor, profile };
//       })
//     );

//     // 3️⃣ رجع النتيجة
//     res.status(200).json(doctorsWithProfiles);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
// controllers/doctorController.js

// ✅ Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("userId", "-password");
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ✅ Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select("-password");
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const profile = await DoctorProfile.findOne({ userId: doctor._id });
    res.status(200).json({ user: doctor, profile });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting doctor", error: error.message });
  }
};


// POST /doctors/certificate
// const addCertificate = async (req, res) => {
//   try {
//     const doctor = await Doctor.findOne({ userId: req.user.userId });
//     if (!doctor) return res.status(404).json({ message: "Doctor not found" });

//     const { title } = req.body;
//     doctor.certificates.push(title); // أو req.file.path لو صورة
//     await doctor.save();

//     res.status(200).json({ message: "Certificate added", certificates: doctor.certificates });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// PATCH update doctor by id

const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const currentUser = req.user;

    // ❗ Optional: لو عايزة تقيدي التعديل لمستخدم معيّن
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


const filterDoctors = async (req, res) => {
  try {
    const { name, specialty, city, maxPrice } = req.query;

    // هنجهز object للفلترة
    let filter = {};

    // فلترة بالتخصص
    if (specialty) {
      filter.specialty = specialty;
    }

    // فلترة بالسعر
    if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    // فلترة بالمكان
    if (city) {
      filter.location = { $regex: city, $options: "i" }; // case-insensitive
    }

    // نجيب الدكاترة بالفلتر
    let doctors = await Doctor.find(filter).populate("userId", "fullName email phone gender");

    // فلترة بالاسم (لازم بعد الـ populate لأن الاسم موجود في User مش Doctor)
    if (name) {
      doctors = doctors.filter(d =>
        d.userId?.fullName?.toLowerCase().includes(name.toLowerCase())
      );
    }

    res.json(doctors);
  } catch (error) {
    console.error("Error filtering doctors:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSpecialties = (req, res) => {
  try {
    // نجيب القيم من الـ enum اللي في schema
    const specialties = Doctor.schema.path("specialty").enumValues;
    res.status(200).json(specialties);
  } catch (error) {
    console.error("Error getting specialties:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getSpecialties,
  uploadCertificate,
  getAllDoctors,
  getDoctorById,
  // addCertificate,
  updateDoctorProfile,
  filterDoctors
};
