const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendRegistrationEmail = async (email, name, password) => {
  try {
    await transporter.sendMail({
      from: `"College Registration" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Account Credentials',
      html: `
        <h2>Welcome ${name}!</h2>
        <p>Your registration was successful.</p>
        <p>Here are your login credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please change your password after first login.</p>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
  }
};

module.exports = { sendRegistrationEmail };