const Doctor = require('../models/doctor');

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

module.exports = { uploadCertificate };
