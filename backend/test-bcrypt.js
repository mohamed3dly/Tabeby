const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

require("dotenv").config(); // ✅ لازم يقرأ الـ .env

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // هنا هيتسحب من .env

    const email = "hebaaliahmed419@gmail.com"; // ✏️ غيره حسب المستخدم
    const newPassword = "Test1234";

    const hashed = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashed },
      { new: true }
    );

    if (!user) {
      console.log("❌ User not found");
    } else {
      console.log(`✅ Password reset for ${email}`);
      console.log(`👉 New password: ${newPassword}`);
      console.log(`👉 Hash saved: ${user.password}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("🔥 Error:", err);
  }
};

run();
