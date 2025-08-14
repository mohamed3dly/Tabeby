require("dotenv").config();
require("./config/passport"); // لو ملفك جوه config أو أي مكان تاني
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const session = require("express-session");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const userRoutes = require("./routes/userRoute");
app.use("/users", userRoutes);

app.use('/uploads', express.static('uploads'));

const authRoutes = require("./routes/auth");
app.use("/api/google", authRoutes);

const reviewRoutes = require("./routes/review");
app.use("/reviews", reviewRoutes);

const bookingRoutes = require("./routes/booking");
app.use("/bookings", bookingRoutes);

const chatRoutes = require("./routes/chat");
app.use("/chats", chatRoutes);

const notificationRoutes = require("./routes/notification");
app.use("/notifications", notificationRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/payments", paymentRoutes);

const patientHistoryRoutes = require("./routes/patientHistoryRoute");
app.use("/patientHistories", patientHistoryRoutes);

const doctorRoutes = require("./routes/doctorRoute");
app.use("/doctors", doctorRoutes);

const nurseRoutes = require("./routes/nurseRoute");
app.use("/nurses", nurseRoutes);

const adminRoutes = require("./routes/adminRoute");
app.use("/admins", adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
