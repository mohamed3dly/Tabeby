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
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("userId", "fullName email");
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// get doctors by id
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("userId", "fullName email");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
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
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // تأكد إن اللي بيعدل هو نفسه الدكتور
    if (doctor.userId.toString() !== req.user.userId)
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

module.exports = {
  uploadCertificate,
  getAllDoctors,
  getDoctorById,
  // addCertificate,
  updateDoctor
};
