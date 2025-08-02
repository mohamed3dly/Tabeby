const Nurse = require('../models/nurse'); // Profile Model
const User = require('../models/user');

const uploadCertificate = async (req, res) => {
  const nurseId = req.user.id; // مفروض تكوني عاملة protect middleware
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  const nurse = await Nurse.findOne({ userId: nurseId });
  if (!nurse) return res.status(404).json({ message: 'Nurse not found' });

  nurse.certificate = {
    fileUrl: `/uploads/${file.filename}`,
    fileType: file.mimetype,
    status: 'pending'
  };

  await nurse.save();
  res.json({ message: 'Certificate uploaded and pending approval' });
};

// GET /nurses
const getAllNurses = async (req, res) => {
  try {
    const nurses = await User.find({ role: "nurse" }).select("-password");

    const nursesWithProfiles = await Promise.all(
      nurses.map(async (nurse) => {
        const profile = await Nurse.findOne({ userId: nurse._id });
        return { user: nurse, profile };
      })
    );

    res.status(200).json(nursesWithProfiles);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /nurses/:id
const getNurseById = async (req, res) => {
  try {
    const nurse = await User.findById(req.params.id).select('-password');
    if (!nurse || nurse.role !== 'nurse') {
      return res.status(404).json({ message: 'Nurse not found' });
    }

    const profile = await Nurse.findOne({ userId: nurse._id });
    res.status(200).json({ user: nurse, profile });

  } catch (error) {
    res.status(500).json({ message: 'Error getting nurse', error: error.message });
  }
};

// PATCH /nurses/:id
const updateNurseProfile = async (req, res) => {
  try {
    const nurseId = req.params.id;
    const currentUser = req.user;

    if (currentUser.role !== "admin" && currentUser.userId !== nurseId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedProfile = await Nurse.findOneAndUpdate(
      { userId: nurseId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Nurse profile not found" });
    }

    res.status(200).json({ message: "Nurse profile updated", updatedProfile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  uploadCertificate,
  getAllNurses,
  getNurseById,
  updateNurseProfile
};
