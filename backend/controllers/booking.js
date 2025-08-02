const Booking = require("../models/booking");
const User = require("../models/user");
const Doctor = require("../models/doctor");
const nodemailer = require("nodemailer");

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
        const { userId, doctorId, date, type } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: "الدكتور غير موجود" });

        const validTypes = ["online", "in-person"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: "نوع الحجز غير صالح" });
        }

        const existingBooking = await Booking.findOne({
            doctorId,
            date: { $eq: new Date(date) },
        });
        if (existingBooking) {
            return res.status(400).json({ message: "هذا الموعد محجوز مسبقاً" });
        }

        const booking = await Booking.create({ userId, doctorId, date, type });

        if (user.email) {
            await sendEmail(
                user.email,
                "تأكيد الحجز",
                `<h2>مرحبًا ${user.name}</h2><p>تم حجز موعد مع الدكتور ${doctor.name} يوم ${new Date(date).toLocaleString()}</p>`
            );
        }

        res.status(201).json({ message: "تم إنشاء الحجز بنجاح", booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        if (user && user.email) {
            await sendEmail(
                user.email,
                "إلغاء الحجز",
                `<h2>مرحبًا ${user.name}</h2><p>تم إلغاء حجزك مع الدكتور ${doctor?.name} بتاريخ ${new Date(booking.date).toLocaleString()}</p>`
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
        await booking.save();

        res.status(200).json({ message: "تم تأكيد الحجز", booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
