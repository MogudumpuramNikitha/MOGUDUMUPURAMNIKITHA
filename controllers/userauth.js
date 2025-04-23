const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendRegistrationEmail } = require('../utils/email');
const { generateRandomPassword } = require('../utils/helpers');

const registerUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, collegeName, collegeIdNumber } = req.body;
    const profilePicture = req.files['profilePicture'][0].path;
    const collegeIdCard = req.files['collegeIdCard'][0].path;

    // Check if user already exists
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR phone_number = ?',
      [email, phoneNumber]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone number already exists'
      });
    }

    // Generate random password
    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.query(
      `INSERT INTO users 
      (full_name, email, phone_number, college_name, college_id_number, profile_picture, college_id_card, password) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, email, phoneNumber, collegeName, collegeIdNumber, profilePicture, collegeIdCard, hashedPassword]
    );

    // Send email with credentials
    await sendRegistrationEmail(email, fullName, password);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Check your email for credentials.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

module.exports = { registerUser };