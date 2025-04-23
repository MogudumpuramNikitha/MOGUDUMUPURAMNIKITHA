const express = require('express');
const multer = require('multer');
const { registerUser } = require('../controllers/auth');

const router = express.Router();

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 // 500KB max
  }
});

// Registration route
router.post('/register', 
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'collegeIdCard', maxCount: 1 }
  ]),
  registerUser
);

module.exports = router;