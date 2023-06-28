const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USERNAME,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.log("Email sending error", err);
  }
};

module.exports = { sendEmail };
