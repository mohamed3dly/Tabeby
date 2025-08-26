const User = require("../models/user");
const Doctor = require("../models/doctor");
const Nurse = require("../models/nurse");
const Patient = require("../models/patient");
const OTP = require("../models/otp");
const History = require("../models/patientHistory");
const authMiddleware = require("../middlewares/authMiddleware");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require('otp-generator');
const sendEmail = require('../utils/sendEmail');



//  Register

// const registerUser = async (req, res) => {
// console.log('req.file:', req.file);
// console.log('req.body:', req.body);
//   const validateRoleData = (role, data) => {
//   const errors = [];

//   if (role === "doctor") {
//     if (!data.specialty) errors.push("التخصص مطلوب");
//     if (!data.description) errors.push("الوصف مطلوب");
//     if (!data.title) errors.push("اللقب مطلوب");
//     if (!data.price) errors.push("السعر مطلوب");
//     if (!data.location) errors.push("الموقع مطلوب");
//     if (!data.phone) errors.push("رقم الهاتف مطلوب");
//     if (!data.certificate?.fileUrl || !data.certificate?.fileType) {
//       errors.push("شهادة الترخيص مطلوبة");
//     }
//   }

//   if (role === "nurse") {
//     if (!data.specialty) errors.push("تخصص التمريض مطلوب");
//     if (!data.description) errors.push("الوصف مطلوب");
//     if (!data.price) errors.push("السعر مطلوب");
//     if (!data.location) errors.push("الموقع مطلوب");
//     if (!data.phone) errors.push("رقم الهاتف مطلوب");
//     if (!data.certificate?.fileUrl || !data.certificate?.fileType) {
//       errors.push("شهادة الترخيص مطلوبة");
//     }
//   }

//   if (role === "patient") {
//     if (!data.phone) errors.push("رقم الهاتف مطلوب");
//     if (!data.location) errors.push("الموقع مطلوب");
//   }

//   return errors;
// };

//   try {
//     const {
//       fullName,
//       email,
//       password,
//       phone,
//       location,
//       role,
//       gender,
//       birthDate,
//       specialty,
//       description,
//       title,
//       price,
//     } = req.body;

//     const file = req.file;

//     const certificate = file
//       ? {
//           fileUrl: file.path,
//           fileType: file.mimetype,
//         }
//       : null;

//     const extraErrors = validateRoleData(role, {
//       specialty,
//       description,
//       title,
//       price,
//       certificate,
//       phone,
//       location,
//     });

//     if (extraErrors.length > 0) {
//       return res.status(400).json({
//         message: "فشل التسجيل",
//         error: extraErrors.join(" - "),
//       });
//     }
//     // بعد validateRoleData و قبل إنشاء اليوزر
// const existingUser = await User.findOne({ email });
// if (existingUser) {
//   return res.status(400).json({
//     message: "الإيميل مستخدم بالفعل",
//     error: "هذا البريد الإلكتروني مسجل من قبل"
//   });
// }

//     //  دلوقتي خلاص متأكدين إن البيانات سليمة، نبدأ نسجل
//     // const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       fullName,
//       email,
//       password,
//       gender,
//       birthDate,
//       phone,
//       role,
//     });

//     // ثم نسجل التفاصيل حسب الـ role
//     if (role === "doctor") {
//       await Doctor.create({
//         userId: user._id,
//         specialty,
//         description,
//         certificate,
//         phone,
//         location,
//         title,
//         price,
//         status: "pending",
//       });
//     }
//     if (role === "nurse") {
//       await Nurse.create({
//         userId: user._id,
//         specialty,
//         description,
//         certificate,
//         phone,
//         location,
//         price,
//         status: "pending",
//       });
//     }
//     if (role === "patient") {
//   const patient = await Patient.create({
//     userId: user._id,
//     phone,
//     location,
//   });
//   await History.create({
//     patientId: patient._id,
//     chronicDiseases: req.body.chronicDiseases || [],
//     surgeries: req.body.surgeries || [],
//     medications: req.body.medications || [],
//     allergy: req.body.allergy || "",
//     visits: req.body.visits || [],
//     testFileUrl: req.body.testFileUrl || ""
//   });
// }

//     // وهكذا لباقي الـ roles

//     const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

// const otp = otpGenerator.generate(6, {
//   upperCaseAlphabets: false,
//   specialChars: false
// });

// await OTP.findOneAndUpdate(
//   { email },
//   { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
//   { upsert: true }
// );

// await sendEmail(email, 'رمز تأكيد الحساب', `رمز OTP الخاص بك هو: ${otp}`);
// return res.status(201).json({
//   message: "تم التسجيل بنجاح، برجاء تأكيد الإيميل باستخدام رمز OTP المرسل",
//   success: true,
//   // userId: user._id,
//   // role: user.role
// });

//   } catch (err) {
//     console.error(" Error in register:", err);
//     res.status(500).json({
//       message: "فشل التسجيل",
//       error: err.message,
//     });
//   }
// };


// const registerUser = async (req, res) => {
//   console.log('req.file:', req.file);
//   console.log('req.body:', req.body);

//   const validateRoleData = (role, data) => {
//     const errors = [];

//     if (role === "doctor") {
//       if (!data.specialty) errors.push("التخصص مطلوب");
//       if (!data.description) errors.push("الوصف مطلوب");
//       if (!data.title) errors.push("اللقب مطلوب");
//       if (!data.price) errors.push("السعر مطلوب");
//       if (!data.location) errors.push("الموقع مطلوب");
//       if (!data.phone) errors.push("رقم الهاتف مطلوب");
//       if (!data.certificate?.fileUrl || !data.certificate?.fileType) {
//         errors.push("شهادة الترخيص مطلوبة");
//       }
//     }

//     if (role === "nurse") {
//       if (!data.specialty) errors.push("تخصص التمريض مطلوب");
//       if (!data.description) errors.push("الوصف مطلوب");
//       if (!data.price) errors.push("السعر مطلوب");
//       if (!data.location) errors.push("الموقع مطلوب");
//       if (!data.phone) errors.push("رقم الهاتف مطلوب");
//       if (!data.certificate?.fileUrl || !data.certificate?.fileType) {
//         errors.push("شهادة الترخيص مطلوبة");
//       }
//     }

//     if (role === "patient") {
//       if (!data.phone) errors.push("رقم الهاتف مطلوب");
//       if (!data.location) errors.push("الموقع مطلوب");
//     }

//     return errors;
//   };

//   try {
//     const {
//       fullName,
//       email,
//       password,
//       phone,
//       location,
//       role,
//       gender,
//       birthDate,
//       specialty,
//       description,
//       title,
//       price,
//     } = req.body;

//     const file = req.file;

//     // ✅ خزن شهادة الترخيص كـ URL كامل
//     const certificate = file
//       ? {
//           fileUrl: `${req.protocol}://${req.get("host")}/uploads/${path.basename(file.path)}`,
//           fileType: file.mimetype,
//         }
//       : null;

//     const extraErrors = validateRoleData(role, {
//       specialty,
//       description,
//       title,
//       price,
//       certificate,
//       phone,
//       location,
//     });

//     if (extraErrors.length > 0) {
//       return res.status(400).json({
//         message: "فشل التسجيل",
//         error: extraErrors.join(" - "),
//       });
//     }

//     // ✅ check duplicate email
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         message: "الإيميل مستخدم بالفعل",
//         error: "هذا البريد الإلكتروني مسجل من قبل"
//       });
//     }

//     // ✅ hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ user image كـ URL كامل أو افتراضي
//     const userImage = req.body.image
//       ? `${req.protocol}://${req.get("host")}/uploads/${req.body.image}`
//       : `${req.protocol}://${req.get("host")}/uploads/default.png`;

//     // ✅ create user
//     const user = await User.create({
//       fullName,
//       email,
//       password: hashedPassword,
//       gender,
//       birthDate,
//       phone,
//       role,
//       image: userImage,
//     });

//     // ✅ role details
//     if (role === "doctor") {
//       await Doctor.create({
//         userId: user._id,
//         specialty,
//         description,
//         certificate,
//         phone,
//         location,
//         title,
//         price,
//         status: "pending",
//       });
//     }

//     if (role === "nurse") {
//       await Nurse.create({
//         userId: user._id,
//         specialty,
//         description,
//         certificate,
//         phone,
//         location,
//         price,
//         status: "pending",
//       });
//     }

//     if (role === "patient") {
//       const patient = await Patient.create({
//         userId: user._id,
//         phone,
//         location,
//       });
//       await History.create({
//         patientId: patient._id,
//         chronicDiseases: req.body.chronicDiseases || [],
//         surgeries: req.body.surgeries || [],
//         medications: req.body.medications || [],
//         allergy: req.body.allergy || "",
//         visits: req.body.visits || [],
//         testFileUrl: req.body.testFileUrl || ""
//       });
//     }

//     // ✅ token
//     const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     // ✅ otp
//     const otp = otpGenerator.generate(6, {
//       upperCaseAlphabets: false,
//       specialChars: false
//     });

//     await OTP.findOneAndUpdate(
//       { email },
//       { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
//       { upsert: true }
//     );

//     await sendEmail(email, 'رمز تأكيد الحساب', `رمز OTP الخاص بك هو: ${otp}`);

//     return res.status(201).json({
//       message: "تم التسجيل بنجاح، برجاء تأكيد الإيميل باستخدام رمز OTP المرسل",
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.fullName,
//         role: user.role,
//         image: user.image
//       }
//     });

//   } catch (err) {
//     console.error("❌ Error in register:", err);
//     res.status(500).json({
//       message: "فشل التسجيل",
//       error: err.message,
//     });
//   }
// };

// Helper: Validate role-specific fields
const validateRoleData = (role, data) => {
  const errors = [];

  if (role === "doctor") {
    if (!data.specialty) errors.push("التخصص مطلوب");
    if (!data.description) errors.push("الوصف مطلوب");
    if (!data.title) errors.push("اللقب مطلوب");
    if (!data.price) errors.push("السعر مطلوب");
    if (!data.location) errors.push("الموقع مطلوب");
    if (!data.phone) errors.push("رقم الهاتف مطلوب");
    if (!data.certificate?.fileUrl || !data.certificate?.fileType) {
      errors.push("شهادة الترخيص مطلوبة");
    }
  }

  if (role === "nurse") {
    if (!data.specialty) errors.push("تخصص التمريض مطلوب");
    if (!data.description) errors.push("الوصف مطلوب");
    if (!data.price) errors.push("السعر مطلوب");
    if (!data.location) errors.push("الموقع مطلوب");
    if (!data.phone) errors.push("رقم الهاتف مطلوب");
    if (!data.certificate?.fileUrl || !data.certificate?.fileType) {
      errors.push("شهادة الترخيص مطلوبة");
    }
  }

  if (role === "patient") {
    if (!data.phone) errors.push("رقم الهاتف مطلوب");
    if (!data.location) errors.push("الموقع مطلوب");
  }

  return errors;
};

const registerUser = async (req, res) => {
  try {
    console.log("📂 Uploaded Files:", req.files);
    console.log("📥 Request Body:", req.body);

    const {
      fullName,
      email,
      password,
      phone,
      location,
      role,
      gender,
      birthDate,
      specialty,
      description,
      title,
      price,
    } = req.body;

    // ✅ Get certificate file
    let certificate = null;
    if (req.files?.certificate && req.files.certificate[0]) {
      const file = req.files.certificate[0];
      certificate = {
        fileUrl: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        fileType: file.mimetype,
      };
    }

    // ✅ Get profile image file
    let profileImage = null;
    if (req.files?.profileImage && req.files.profileImage[0]) {
      const file = req.files.profileImage[0];
      profileImage = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    }

    // ✅ Validate role-specific data
    const extraErrors = validateRoleData(role, {
      specialty,
      description,
      title,
      price,
      certificate,
      phone,
      location,
    });

    if (extraErrors.length > 0) {
      return res.status(400).json({
        message: "فشل التسجيل",
        error: extraErrors.join(" - "),
      });
    }

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "الإيميل مستخدم بالفعل",
        error: "هذا البريد الإلكتروني مسجل من قبل",
      });
    }

    // ✅ Create User
    const user = await User.create({
      fullName,
      email,
      password, // (تقدر تشفره بالـ bcrypt لو عايز)
      gender,
      birthDate,
      phone,
      role,
      image: profileImage, // ⬅️ Store profile image in user
    });

    // ✅ Create Role-specific documents
    if (role === "doctor") {
      await Doctor.create({
        userId: user._id,
        specialty,
        description,
        certificate,
        phone,
        location,
        title,
        price,
        status: "pending",
      });
    }

    if (role === "nurse") {
      await Nurse.create({
        userId: user._id,
        specialty,
        description,
        certificate,
        phone,
        location,
        price,
        status: "pending",
      });
    }

    if (role === "patient") {
      const patient = await Patient.create({
        userId: user._id,
        phone,
        location,
      });

      await History.create({
        patientId: patient._id,
        chronicDiseases: req.body.chronicDiseases || [],
        surgeries: req.body.surgeries || [],
        medications: req.body.medications || [],
        allergy: req.body.allergy || "",
        visits: req.body.visits || [],
        testFileUrl: req.body.testFileUrl || "",
      });
    }

    // ✅ Generate JWT
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ Generate & send OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await OTP.findOneAndUpdate(
      { email },
      { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
      { upsert: true }
    );

    await sendEmail(email, "رمز تأكيد الحساب", `رمز OTP الخاص بك هو: ${otp}`);

    return res.status(201).json({
      message: "تم التسجيل بنجاح، برجاء تأكيد الإيميل باستخدام رمز OTP المرسل",
      success: true,
      userId: user._id,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("❌ Error in register:", err);
    res.status(500).json({
      message: "فشل التسجيل",
      error: err.message,
    });
  }
};
//  Login
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
//     }

//     // Check if email is verified
//     if (!user.isVerified) {
//       return res.status(401).json({ message: "يرجى تأكيد الإيميل أولًا قبل تسجيل الدخول" });
//     }

//     // Check approval for doctor or nurse
//     // if (user.role === "doctor" || user.role === "nurse") {
//     //   const roleModel = user.role === "doctor"
//     //     ? require("../models/doctor")
//     //     : require("../models/nurse");

//     //   const roleData = await roleModel.findOne({ userId: user._id });

//     //   if (!roleData || roleData.certificate.status !== "approved") {
//     //     return res.status(403).json({
//     //       message: "لم تتم الموافقة على الحساب بعد من قبل الأدمن",
//     //     });
//     //   }
//     // }
//     if (user.role === "doctor" || user.role === "nurse") {
//   const roleModel = user.role === "doctor"
//     ? require("../models/doctor")
//     : require("../models/nurse");

//   const roleData = await roleModel.findOne({ userId: user._id });

//   if (!roleData || roleData.status !== "approved") {
//     return res.status(403).json({
//       message: "لم تتم الموافقة على الحساب بعد من قبل الأدمن",
//     });
//   }
// }

//     const token = jwt.sign(
//       { id: user._id, 
//         role: user.role,
//         name: user.fullName,   // ✅ ضيف الاسم
//        email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.status(200).json({ token, user: {
//     id: user._id,
//     name: user.name,
//     role: user.role
//   } });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// ✅ LOGIN
// const loginUser = async (req, res) => {
//   try {
//     let { email, password } = req.body;

//     // 1) Normalize email
//     email = email.toLowerCase().trim();
//     console.log("📩 Login attempt with:", email);

//     // 2) اطبع اسم الـ DB
//     console.log("📂 Current DB:", mongoose.connection.name);

//     // 3) اطبع عدد اليوزرز + أول 10 ايميلات
//     const allUsers = await User.find({});
//     console.log("👥 Total users in DB:", allUsers.length);
//     console.log("📧 Sample emails:", allUsers.map(u => u.email).slice(0, 10));

//     // 4) دور على اليوزر
//     const user = await User.findOne({ email });
//     console.log("🔍 User found:", user ? "✅ YES" : "❌ NO");

//     if (!user) {
//       return res.status(401).json({ message: "بيانات الدخول غير صحيحة (user not found)" });
//     }

//     // 5) Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log("🔑 Password match:", isMatch ? "✅ YES" : "❌ NO");

//     if (!isMatch) {
//       return res.status(401).json({ message: "بيانات الدخول غير صحيحة (wrong password)" });
//     }

//     // 6) Check email verification
//     if (!user.isVerified) {
//       return res.status(401).json({ message: "يرجى تأكيد الإيميل أولًا قبل تسجيل الدخول" });
//     }

//     // 7) Check approval if doctor or nurse
//     if (user.role === "doctor" || user.role === "nurse") {
//       const roleModel =
//         user.role === "doctor"
//           ? require("../models/doctor")
//           : require("../models/nurse");

//       const roleData = await roleModel.findOne({ userId: user._id });

//       if (!roleData || roleData.status !== "approved") {
//         return res.status(403).json({
//           message: "لم تتم الموافقة على الحساب بعد من قبل الأدمن",
//         });
//       }
//     }

//     // 8) Generate token
//     const token = jwt.sign(
//       {
//         id: user._id,
//         role: user.role,
//         name: user.fullName || user.name || "",
//         email: user.email,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     // 9) Response
//     res.status(200).json({
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.fullName || user.name || "",
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error("🔥 Login error:", err);
//     res.status(500).json({ message: "خطأ في السيرفر" });
//   }
// };

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    // 1) Normalize email
    email = email.toLowerCase().trim();
    console.log("📩 Login attempt with:", email);

    // 2) اطبع اسم الـ DB
    console.log("📂 Current DB:", mongoose.connection.name);

    // 3) اطبع عدد اليوزرز + أول 10 ايميلات
    const allUsers = await User.find({});
    console.log("👥 Total users in DB:", allUsers.length);
    console.log("📧 Sample emails:", allUsers.map(u => u.email).slice(0, 10));

    // 4) دور على اليوزر
    const user = await User.findOne({ email });
    console.log("🔍 User found:", user ? "✅ YES" : "❌ NO");

    if (!user) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة (user not found)" });
    }

    // 5) Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔑 Password match:", isMatch ? "✅ YES" : "❌ NO");

    if (!isMatch) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة (wrong password)" });
    }

    // 6) Check email verification
    if (!user.isVerified) {
      return res.status(401).json({ message: "يرجى تأكيد الإيميل أولًا قبل تسجيل الدخول" });
    }

    // 7) Check approval if doctor or nurse
    if (user.role === "doctor" || user.role === "nurse") {
      const roleModel =
        user.role === "doctor"
          ? require("../models/doctor")
          : require("../models/nurse");

      const roleData = await roleModel.findOne({ userId: user._id });

      // ✅ تعديل هنا
      if (!roleData ) {
        return res.status(403).json({
          message: "لم تتم الموافقة على الحساب بعد من قبل الأدمن",
        });
      }
    }

    // 8) Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.fullName || user.name || "",
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 9) Response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName || user.name || "",
        role: user.role,
      },
    });
  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};



//  Forgot Password - Send OTP

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false
  });

  await OTP.findOneAndUpdate(
    { email },
    { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
    { upsert: true }
  );

  await sendEmail(email, 'رمز إعادة تعيين كلمة المرور', `رمز OTP الخاص بك: ${otp}`);
  res.json({ message: 'OTP sent to your email' });
};

// ===============================
// Verify OTP
// ===============================
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = await OTP.findOne({ email });

  if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'رمز OTP غير صحيح أو منتهي' });
  }

  //  فعل الحساب
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

  user.isVerified = true;
  await user.save();

  await OTP.deleteOne({ email });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ message: 'تم تأكيد الحساب بنجاح', token });
};

//  Reset Password

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // 1) Check if OTP exists and valid
    const record = await OTP.findOne({ email });
    if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: "رمز OTP غير صحيح أو منتهي" });
    }

    // 2) Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    // 3) Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // 4) Delete OTP after use
    await OTP.deleteOne({ email });

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    console.error("🔥 Reset password error:", err);
    res.status(500).json({ message: "حدث خطأ في السيرفر" });
  }
};
//
// Verify OTP for Reset Password
const verifyOtpReset = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. نجيب الـ OTP من الداتا
    const record = await OTP.findOne({ email });
    if (!record) {
      return res.status(400).json({ message: "لا يوجد رمز OTP لهذا البريد" });
    }

    // 2. تحقق من صلاحية الكود
    if (record.otp !== otp || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: "رمز OTP غير صحيح أو منتهي" });
    }

    // 3. تحقق من وجود المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // 4. امسح الكود بعد ما يتأكد
    await OTP.deleteOne({ email });

    // 5. رجّع OK → عشان يكمّل reset password
    res.json({ message: "تم تأكيد الرمز بنجاح، يمكنك الآن تغيير كلمة المرور" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ ما", error: err.message });
  }
};


//  resendOtp

const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "تم توثيق الحساب بالفعل" });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false
    });

    await OTP.findOneAndUpdate(
      { email },
      { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
      { upsert: true }
    );

    await sendEmail(email, "رمز تأكيد البريد الإلكتروني", `رمز OTP الخاص بك هو: ${otp}`);

    res.json({ message: "تم إرسال رمز تأكيد جديد إلى بريدك الإلكتروني" });

  } catch (err) {
    res.status(500).json({ message: "حدث خطأ ما", error: err.message });
  }
};
 const logoutUser = (req, res) => {
  // ببساطة مجرد إرسال رسالة نجاح
  return res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let profile = null;

    if (user.role === "doctor") {
      profile = await Doctor.findOne({ userId: user._id });
    } else if (user.role === "patient") {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === "nurse") {
      profile = await Nurse.findOne({ userId: user._id });
    }

    return res.status(200).json({
      user,
      profile
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(userId, req.body.user, {
      new: true,
      runValidators: true
    }).select("-password");
    
    if (req.body.user?.email || req.body.user?.password) {
      return res.status(400).json({ message: "You can't update email or password from here." });
    }
    // ✅ Update profile info

    let updatedProfile = null;

    if (req.body.profile) {
      if (updatedUser.role === "doctor") {
        updatedProfile = await Doctor.findOneAndUpdate(
          { userId },
          req.body.profile,
          { new: true, runValidators: true }
        );
      } else if (updatedUser.role === "patient") {
        updatedProfile = await Patient.findOneAndUpdate(
          { userId },
          req.body.profile,
          { new: true, runValidators: true }
        );
      } else if (updatedUser.role === "nurse") {
        updatedProfile = await Nurse.findOneAndUpdate(
          { userId },
          req.body.profile,
          { new: true, runValidators: true }
        );
      }
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
      profile: updatedProfile
    });

  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};


const updateUserImage = async (req, res) => {
  try {
    const { userId } = req.params;

    // اتأكد إن في صورة متبعتة
    if (!req.file) {
      return res.status(400).json({ message: "لم يتم رفع أي صورة" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // لو عنده صورة قديمة غير default.png احذفها
    if (user.image && user.image !== "default.png") {
      const oldPath = path.join(__dirname, "..", "uploads", user.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // احفظ الصورة الجديدة
    user.image = req.file.filename;
    await user.save();

    res.json({
      message: "تم تحديث صورة البروفايل بنجاح",
      image: user.image,
    });
  } catch (err) {
    console.error("❌ Error in updateUserImage:", err);
    res.status(500).json({ message: "فشل تحديث الصورة", error: err.message });
  }
};


//  Exports

module.exports = { updateUserImage,registerUser,loginUser,forgotPassword,verifyOtp,resetPassword,resendOtp,logoutUser,getUser,updateUser,verifyOtpReset};
