const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

// فلتر مختلف حسب نوع الحقل
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "certificate") {
    // شهادة: PDF أو صور
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("الشهادة لازم تكون PDF أو صورة"), false);
    }
  } else if (file.fieldname === "profileImage") {
    // صورة بروفايل: صور فقط
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("صورة البروفايل لازم تكون صورة (jpeg أو png)"), false);
    }
  } else {
    cb(new Error("حقل غير معروف"), false);
  }
};

const upload = multer({ storage, fileFilter });

// نسمح برفع أكتر من فايل بأنواع مختلفة
const multiUpload = upload.fields([
  { name: "certificate", maxCount: 1 },
  { name: "profileImage", maxCount: 1 }
]);

module.exports = multiUpload;
