const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // أو smtp زي mailtrap لو بتجربي
    auth: {
      user: process.env.EMAIL_USER, // إيميلك
      pass: process.env.EMAIL_PASS, // كلمة المرور أو App Password
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
