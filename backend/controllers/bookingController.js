const Booking = require("../models/booking");
const User = require("../models/user");
const Doctor = require("../models/doctor");
const Patient = require("../models/patient"); // 👈
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { isUserAvailable, createCalendarEvent } = require("../utils/googleCalendar");

// إعداد الإيميل
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
    } catch (err) {
        console.error("فشل إرسال الإيميل:", err.message);
    }
};

// إنشاء حجز

// 📌 controller/bookingController.js
// ✅ إنشاء حجز
// exports.createBooking = async (req, res) => {
//   console.log("📥 [NODE] Incoming Booking Body:", JSON.stringify(req.body, null, 2));

//   try {
//     const { doctorId, patientId, startTime, endTime, description, type } = req.body;

//     if (!doctorId || !patientId || !startTime || !endTime || !type) {
//       console.error("❌ [NODE] Missing Fields:", { doctorId, patientId, startTime, endTime, type });
//       return res.status(400).json({ message: "Missing required fields" });
//     }


//     // 1️⃣ هات الدكتور وربطه باليوزر
//     const doctor = await Doctor.findById(doctorId).populate("userId");
//     if (!doctor || !doctor.userId?.google?.accessToken) {
//       return res.status(400).json({ message: "Doctor not connected to Google" });
//     }
//    const patient = await Patient.findById(patientId);

//     // 2️⃣ شوف هل الدكتور متاح ولا مشغول
//     const available = await isUserAvailable(
//   doctor.userId._id,          // userId الأول
//   doctor.userId.google,       // googleData التاني
//   new Date(startTime),
//   new Date(endTime)
// );

//     if (!available) {
//       return res.status(400).json({ message: "Doctor not available at this time" });
//     }

//     // 3️⃣ أنشئ الـ event على Google Calendar
//     const eventId = await createCalendarEvent(doctor.userId._id, {
//       with: "Patient",
//       description,
//       startTime,
//       endTime,
//        guestEmail: patient?.email, // لو عايزة تبعتي ايميل للمريض ممكن تحطيه هنا
//     });

//     // 4️⃣ خزّن الحجز في DB
//     const booking = await Booking.create({
//       doctorId,
//       patientId,
//       startTime,
//       endTime,
//       description,
//       type: "clinic",
//       googleEventId: eventId, // نخزن الـ eventId عشان نقدر نلغيه/نعدله بعدين
//     });
    
//      // ✅ إرسال إيميل للمريض
//     if (patient?.email) {
//   console.log("📨 Sending email to:", patient.email);

//   await sendEmail(
//     patient.email,
//     "تأكيد الحجز",
//     `
//       <h3>مرحباً ${patient.fullName}</h3>
//       <p>تم تأكيد حجزك مع الدكتور <strong>${doctor.fullName}</strong></p>
//       <p>🗓️ التاريخ: ${new Date(startTime).toLocaleDateString("ar-EG")}</p>
//       <p>⏰ الوقت: ${new Date(startTime).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</p>
//     `
//   );

//   console.log("✅ Email function executed");
// }


//     res.status(201).json({
//       message: "Booking created successfully",
//       booking,
//     });
//   } catch (error) {
//     console.error("❌ Error creating booking:", error);
//     res.status(500).json({ message: "Error creating booking", error: error.message });
//   }

// };
exports.createBooking = async (req, res) => {
  console.log("📥 [NODE] Incoming Booking Body:", JSON.stringify(req.body, null, 2));

  try {
    const { doctorId, patientId, startTime, endTime, description, type } = req.body;

    if (!doctorId || !patientId || !startTime || !endTime || !type) {
      console.error("❌ [NODE] Missing Fields:", { doctorId, patientId, startTime, endTime, type });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ هات الدكتور وربطه باليوزر
    const doctor = await Doctor.findById(doctorId).populate("userId");
    if (!doctor || !doctor.userId?.google?.accessToken) {
      return res.status(400).json({ message: "Doctor not connected to Google" });
    }

    // 2️⃣ هات بيانات المريض كـ User
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 3️⃣ شوف هل الدكتور متاح ولا مشغول
    const available = await isUserAvailable(
      doctor.userId._id,          // userId الأول
      doctor.userId.google,       // googleData التاني
      new Date(startTime),
      new Date(endTime)
    );

    if (!available) {
      return res.status(400).json({ message: "Doctor not available at this time" });
    }

    // 4️⃣ أنشئ الـ event على Google Calendar
    const eventId = await createCalendarEvent(doctor.userId._id, {
      with: patient.fullName || "Patient",
      description,
      startTime,
      endTime,
      guestEmail: patient?.email, // لو عايزة تبعتي ايميل للمريض
    });

    // 5️⃣ خزّن الحجز في DB
    const booking = await Booking.create({
      doctorId,
      patientId,
      startTime,
      endTime,
      description,
      type: "clinic",
      googleEventId: eventId,
    });

    // ✅ إرسال إيميل للمريض
    if (patient?.email) {
      console.log("📨 Sending email to:", patient.email);

      await sendEmail(
        patient.email,
        "تأكيد الحجز",
        `
          <h3>مرحباً ${patient.fullName}</h3>
          <p>تم تأكيد حجزك مع الدكتور <strong>${doctor.fullName}</strong></p>
          <p>🗓️ التاريخ: ${new Date(startTime).toLocaleDateString("ar-EG")}</p>
          <p>⏰ الوقت: ${new Date(startTime).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</p>
        `
      );

      console.log("✅ Email function executed");
    }

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

// عرض حجز واحد
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate({ path: "userId", select: "name email phone" })
            .populate({ path: "doctorId", select: "name specialty email phone" });

        if (!booking) {
            return res.status(404).json({ message: "الحجز غير موجود" });
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// عرض جميع حجوزات مريض
exports.getBookingsByUser = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId })
            .populate("doctorId", "name specialty");

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// إلغاء حجز

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }

    booking.status = "cancelled";
    await booking.save();

    const user = await User.findById(booking.userId);
    const doctor = await Doctor.findById(booking.doctorId);
    const nurse = booking.nurseId ? await Nurse.findById(booking.nurseId) : null;

    const host = doctor || nurse;

    // حذف الحدث من Google Calendar
    if (
      host?.google?.accessToken &&
      host?.google?.refreshToken &&
      booking.googleEventId
    ) {
      await deleteGoogleCalendarEvent(host, booking.googleEventId);
    }

    // إرسال إيميل للمريض
    if (user && user.email) {
      await sendEmail(
        user.email,
        "إلغاء الحجز",
        `<h2>مرحبًا ${user.name}</h2><p>تم إلغاء حجزك مع ${
          host?.name || "المضيف"
        } بتاريخ ${new Date(booking.date).toLocaleString("ar-EG")}</p>`
      );
    }

    res.status(200).json({ message: "تم إلغاء الحجز", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// عرض جميع حجوزات دكتور
exports.getBookingsByDoctor = async (req, res) => {
    try {
        const bookings = await Booking.find({ doctorId: req.params.doctorId })
            .populate("userId", "name email phone")
            .sort({ date: 1 });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// تأكيد حجز
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "الحجز غير موجود" });
    }

    booking.status = "confirmed";

    const user = await User.findById(booking.userId);
    const doctor = booking.doctorId ? await Doctor.findById(booking.doctorId) : null;
    const nurse = booking.nurseId ? await Nurse.findById(booking.nurseId) : null;
    const host = doctor || nurse;

    // لو مفيش googleEventId نضيف الحدث في Google Calendar
    if (
      !booking.googleEventId &&
      host?.google?.accessToken &&
      host?.google?.refreshToken &&
      user?.google?.email
    ) {
      const eventId = await createGoogleCalendarEvent(host, user.google.email, {
        date: booking.date,
        type: booking.type,
        hostName: host.name,
        guestName: user.name,
      });

      if (eventId) {
        booking.googleEventId = eventId;
      }
    }

    await booking.save();

    res.status(200).json({ message: "تم تأكيد الحجز", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

