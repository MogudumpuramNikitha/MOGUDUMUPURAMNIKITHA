CREATE DATABASE exam_system;
USE exam_system;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phoneNumber VARCHAR(20) NOT NULL,
  collegeName VARCHAR(255) NOT NULL,
  collegeIdNumber VARCHAR(50) NOT NULL,
  profilePicture VARCHAR(255) NOT NULL,
  collegeIdCard VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  courseId INT,
  enrolledAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (courseId) REFERENCES courses(id)
);

CREATE TABLE exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  courseId INT,
  title VARCHAR(255) NOT NULL,
  duration INT NOT NULL,
  totalMarks INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (courseId) REFERENCES courses(id)
);

CREATE TABLE results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  examId INT,
  marksObtained INT NOT NULL,
  completedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (examId) REFERENCES exams(id)
);