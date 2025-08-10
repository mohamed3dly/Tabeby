const Booking = require("../models/booking");
const User = require("../models/user");
const Doctor = require("../models/doctor");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { isUserAvailable } = require("../utils/googleAvailability");
const { deleteGoogleCalendarEvent ,createGoogleCalendarEvent} = require("../utils/googleEvent");


// const createGoogleCalendarEvent = async (host, guestEmail, booking) => {
//   try {
//     const oAuth2Client = new google.auth.OAuth2(
//       process.env.GOOGLE_CLIENT_ID,
//       process.env.GOOGLE_CLIENT_SECRET,
//       process.env.GOOGLE_REDIRECT_URI // استخدمتيه أثناء الربط
//     );

//     oAuth2Client.setCredentials({
//       access_token: host.google.accessToken,
//       refresh_token: host.google.refreshToken,
//     });

//     const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

//     const start = new Date(booking.date);
//     const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 دقيقة

//     const event = {
//       summary: `موعد بين ${booking.hostName} و ${booking.guestName}`,
//       description: `نوع الحجز: ${booking.type}`,
//       start: {
//         dateTime: start.toISOString(),
//         timeZone: "Africa/Cairo",
//       },
//       end: {
//         dateTime: end.toISOString(),
//         timeZone: "Africa/Cairo",
//       },
//       attendees: guestEmail ? [{ email: guestEmail }] : [],
//     };

//     const calendarId = host.google.calendarId || "primary";

//     const response = await calendar.events.insert({
//       calendarId,
//       resource: event,
//       sendUpdates: "all", // لإشعار المدعوين
//     });

//     console.log("✅ تم إنشاء الحدث في Google Calendar");
//     return response.data.id;
//   } catch (error) {
//     console.error("❌ فشل إنشاء الحدث على Google Calendar:", error.message);
//     return null;
//   }
// };


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

exports.createBooking = async (req, res) => {
  try {
    const { userId, doctorId, nurseId, date, type } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    let host;
    if (doctorId) {
      host = await Doctor.findById(doctorId);
      if (!host) return res.status(404).json({ message: "الدكتور غير موجود" });
    } else if (nurseId) {
      host = await Nurse.findById(nurseId);
      if (!host) return res.status(404).json({ message: "الممرض غير موجود" });
    } else {
      return res.status(400).json({ message: "يجب تحديد دكتور أو ممرض" });
    }
    // 🔐 التحقق من ربط Google Calendar
if (!host.google?.accessToken || !host.google?.refreshToken) {
  return res.status(400).json({
    message: `لا يمكن الحجز إلا بعد ربط التقويم الخاص بـ ${
      doctorId ? "الدكتور" : "الممرض"
    } بـ Google Calendar`,
  });
}

    const validTypes = ["online", "in-person"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "نوع الحجز غير صالح" });
    }

    // التأكد من وجود حجز في نفس الوقت مع نفس الدكتور أو الممرض
    const existingBooking = await Booking.findOne({
      $or: [{ doctorId }, { nurseId }],
      date: new Date(date),
    });
    if (existingBooking) {
      return res.status(400).json({ message: "هذا الموعد محجوز مسبقاً" });
    }

    // ✅ التأكد من تفرّغ الطبيب/الممرض من تقويم جوجل
    if (host?.google?.accessToken && host?.google?.refreshToken) {
      const startTime = new Date(date);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 دقيقة
      const isAvailable = await isUserAvailable(host.google, startTime, endTime);
      if (!isAvailable) {
        return res.status(400).json({ message: "المضيف مشغول في هذا الوقت على تقويم جوجل" });
      }
    }

    // إنشاء الحجز
    const booking = await Booking.create({
      userId,
      doctorId,
      nurseId,
      date,
      type,
    });

    // إرسال إيميل للمريض
    if (user.email) {
      await sendEmail(
        user.email,
        "تأكيد الحجز",
        `<h2>مرحبًا ${user.name}</h2><p>تم حجز موعد مع ${host.name} بتاريخ ${new Date(date).toLocaleString("ar-EG")}</p>`
      );
    }

    // إضافة الحجز إلى Google Calendar
    if (
      host?.google?.accessToken &&
      host?.google?.refreshToken &&
      user?.google?.email
    ) {
      const eventId = await createGoogleCalendarEvent(host, user.google.email, {
        date,
        type,
        hostName: host.name,
        guestName: user.name,
      });

      if (eventId) {
        booking.googleEventId = eventId;
        await booking.save();
      }
    }

    res.status(201).json({ message: "✅ تم إنشاء الحجز بنجاح", booking });
  } catch (error) {
    console.error("❌", error);
    res.status(500).json({ message: error.message });
  }}
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

