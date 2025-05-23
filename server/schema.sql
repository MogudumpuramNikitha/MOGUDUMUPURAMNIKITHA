CREATE DATABASE IF NOT EXISTS exam_portal;
USE exam_portal;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phoneNumber VARCHAR(15) NOT NULL,
  collegeName VARCHAR(255) NOT NULL,
  collegeIdNumber VARCHAR(50) NOT NULL,
  profilePicture VARCHAR(255) NOT NULL,
  collegeIdCard VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);