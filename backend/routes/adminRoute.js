const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserCountsByRole,
  getPendingUsers,
  updateVerificationStatus,
  getUserDetails,
  toggleUserActivation,
  deleteUser
} = require("../controllers/adminController");

// عرض كل المستخدمين (دكاترة، ممرضين، مرضى) أو فلترة حسب الدور
router.get("/", getAllUsers);

// عدد المستخدمين حسب الدور
router.get("/counts", getUserCountsByRole);

// عرض المستخدمين في حالة pending
router.get("/pending", getPendingUsers);

// تحديث حالة التحقق (قبول أو رفض) للمستخدم دكتور أو ممرض
router.put("/verify/:role/:userId", updateVerificationStatus);

// تفاصيل مستخدم معين
router.get("/:userId", getUserDetails);

// تعطيل أو تفعيل مستخدم
router.put("/toggle/:userId", toggleUserActivation);

// حذف مستخدم نهائي
router.delete("/:userId", deleteUser);

module.exports = router;
 