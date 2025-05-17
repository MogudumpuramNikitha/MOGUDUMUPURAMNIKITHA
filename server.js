import express from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// upload directories
const uploadDirs = ['uploads/profiles', 'uploads/ids'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

dotenv.config();

const app = express();
const server = createServer(app);

// Middleware with correct limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

//  WebSocket configuration with path
const wss = new WebSocketServer({ 
  server,
  path: '/ws'  // specific path for WebSocket
});


wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');

  // Send initial connection success message
  ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));

  ws.on('message', (message) => {
    try {
      console.log('Received:', message.toString());
      // Handle message processing here
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Update database connection to use promises
const db = mysql.createConnection({
  host: 'localhost',
  user: 'examuser',
  password: 'nikitha@2003',
  database: 'exam_portal'
}).promise();

// Update File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = file.fieldname === 'profilePicture' ? 
      path.join(__dirname, 'uploads/profiles') : 
      path.join(__dirname, 'uploads/ids');
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 // 500KB max file size
  }
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Registration endpoint
app.post('/api/register', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'collegeIdCard', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    console.log('Files received:', req.files);

    const { fullName, email, phoneNumber, collegeName, collegeIdNumber } = req.body;
    
    if (!req.files || !req.files.profilePicture || !req.files.collegeIdCard) {
      return res.status(400).json({
        success: false,
        message: 'Both profile picture and college ID card are required'
      });
    }
    
    // Generate random password
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Store relative paths instead of full paths
    const profilePicturePath = req.files.profilePicture[0].path.replace(/\\/g, '/').replace(__dirname, '');
    const collegeIdCardPath = req.files.collegeIdCard[0].path.replace(/\\/g, '/').replace(__dirname, '');
    
    const [result] = await db.query(
      'INSERT INTO users (fullName, email, password, phoneNumber, collegeName, collegeIdNumber, profilePicture, collegeIdCard) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        fullName,
        email,
        hashedPassword,
        phoneNumber,
        collegeName,
        collegeIdNumber,
        profilePicturePath,
        collegeIdCardPath
      ]
    );

    // Send email with password
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Account Password',
      html: `
        <h1>Welcome to Online Exam Registration Portal</h1>
        <p>Dear ${fullName},</p>
        <p>Your account has been created successfully.</p>
        <p>Here are your login credentials:</p>
        <p>Email: ${email}</p>
        <p>Password: ${password}</p>
        <p>Please login and change your password for security reasons.</p>
      `
    });

    res.json({ success: true, message: 'Registration successful! Please check your email for login credentials.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'Email already registered' : 'Registration failed. Please try again.'
    });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  console.log('Login attempt for email:', req.body.email);
  try {
    const { email, password } = req.body;
    
    // Get user from database using promise-based query
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Protected route to get user data
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = results[0];
    delete user.password;
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Start server with proper error handling
const PORT = process.env.PORT || 5000;
db.connect()
  .then(() => {
    const startServer = () => {
      server.listen(PORT, () => {
        console.log('=================================');
        console.log(`Server running on port ${PORT}`);
        console.log(`WebSocket server is running on ws://localhost:${PORT}/ws`);
        console.log('Environment:', process.env.NODE_ENV || 'development');
        console.log('=================================');
      });
    };

    //  start the server
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
        server.close();
        PORT++;
        startServer();
      }
    });

    startServer();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Move this BEFORE all route definitions
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

