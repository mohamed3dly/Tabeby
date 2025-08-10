const User = require("../models/user");
const Doctor = require("../models/doctor");
const Nurse = require("../models/nurse");

// 1. عرض كل المستخدمين (اختياري فلترة حسب الدور)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query; // doctor, nurse, patient
    const filter = role ? { role } : {};
    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. عدد المستخدمين حسب الدور
exports.getUserCountsByRole = async (req, res) => {
  try {
    const roles = ["doctor", "nurse", "patient"];
    const counts = {};
    for (const role of roles) {
      counts[role] = await User.countDocuments({ role });
    }
    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. المستخدمين في حالة pending (دكاترة وممرضين فقط)
exports.getPendingUsers = async (req, res) => {
  try {
    // نجيب المستخدمين اللي role دكتور أو ممرض وحالتهم isVerified false
    const pendingDoctors = await Doctor.find({ "certificate.status": "pending" }).populate("userId", "-password");
    const pendingNurses = await Nurse.find({ "certificate.status": "pending" }).populate("userId", "-password");

    res.json({ pendingDoctors, pendingNurses });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. قبول أو رفض حساب دكتور أو ممرض
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { userId, role } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    let model;
    if (role === "doctor") model = Doctor;
    else if (role === "nurse") model = Nurse;
    else return res.status(400).json({ message: "Invalid role" });

    const profile = await model.findOne({ userId });
    if (!profile) return res.status(404).json({ message: `${role} profile not found` });

    profile.certificate.status = status;

    // تحديث حالة التوثيق داخل profile
    if (status === "rejected") {
      profile.certificate.rejectionReason = rejectionReason || "";
      profile.isVerified = false;
    } else {
      profile.certificate.rejectionReason = "";
      profile.isVerified = true;
    }

    await profile.save();

    // كمان نحدث حالة اليوزر نفسه
    const user = await User.findById(userId);
    if (user) {
      user.isVerified = status === "approved";
      await user.save();
    }

    res.json({ message: `${role} verification status updated to ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. تفاصيل مستخدم (مع بيانات إضافية حسب الدور)
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let extraData = {};
    if (user.role === "doctor") {
      extraData = await Doctor.findOne({ userId }).select("-_id -__v -userId");
    } else if (user.role === "nurse") {
      extraData = await Nurse.findOne({ userId }).select("-_id -__v -userId");
    }

    res.json({ user, extraData });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 6. تعطيل / تفعيل مستخدم
exports.toggleUserActivation = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User is now ${user.isActive ? "Active" : "Inactive"}` });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 7. حذف مستخدم نهائي
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    // كمان ممكن تمسح بيانات الدكتور أو الممرض المرتبطين لو حابة
    await Doctor.deleteOne({ userId });
    await Nurse.deleteOne({ userId });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};