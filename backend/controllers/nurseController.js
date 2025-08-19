const Nurse = require('../models/nurse'); 
const User = require('../models/user');

// رفع شهادة الممرضة
const uploadCertificate = async (req, res) => {
  try {
    const nurseId = req.user.id; 
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const nurse = await Nurse.findOne({ userId: nurseId });
    if (!nurse) {
      return res.status(404).json({ message: 'Nurse not found' });
    }

    nurse.certificate = {
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      status: 'pending'
    };

    await nurse.save();
    res.status(200).json({ message: 'Certificate uploaded and pending approval' });
  } catch (err) {
    console.error("❌ Error uploading certificate:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// جلب كل الممرضات
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
    console.error("❌ Error fetching nurses:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// جلب ممرضة بالـ ID
const getNurseById = async (req, res) => {
  try {
    const nurse = await User.findById(req.params.id).select('-password');
    if (!nurse || nurse.role !== 'nurse') {
      return res.status(404).json({ message: 'Nurse not found' });
    }

    const profile = await Nurse.findOne({ userId: nurse._id });
    res.status(200).json({ user: nurse, profile });
  } catch (error) {
    console.error("❌ Error getting nurse:", error);
    res.status(500).json({ message: 'Error getting nurse', error: error.message });
  }
};

// تحديث بيانات الممرضة
const updateNurseProfile = async (req, res) => {
  try {
    const nurseId = req.params.id;
    const currentUser = req.user;

    // السماح فقط للـ Admin أو نفس الممرضة بتعديل بياناتها
    if (currentUser.role !== "admin" && currentUser.id !== nurseId) {
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
    console.error("❌ Error updating nurse profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const addNurse = async (req, res) => {
  try {
    const { name, email, specialization, phone, address } = req.body;

    const newNurse = new Nurse({
      name,
      email,
      specialization,
      phone,
      address,
      image: req.file ? req.file.path : null, // لو في صورة
    });

    await newNurse.save();
    res.status(201).json({ message: "Nurse added successfully", nurse: newNurse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadCertificate,
  getAllNurses,
  getNurseById,
  updateNurseProfile,
  addNurse
};
