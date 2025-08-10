require('dotenv').config();
require('./config/passport'); // لو ملفك جوه config أو أي مكان تاني
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const session = require('express-session');


connectDB();

const app = express();
app.use(cors());
app.use(express.json());


app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
}));


app.get('/', (req, res) => {
  res.send('API is running...');
});

const userRoutes = require("./routes/userRoute");
app.use("/users", userRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/google", authRoutes);

const reviewRoutes = require("./routes/review");
app.use("/reviews", reviewRoutes);

const bookingRoutes = require("./routes/booking");
app.use("/bookings", bookingRoutes);

const adminUserRoute = require("./routes/adminRoute");
app.use("/admin", adminUserRoute);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
