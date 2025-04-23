import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Registration.css';

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    collegeName: '',
    collegeIdNumber: ''
  });
  const [profilePic, setProfilePic] = useState(null);
  const [collegeIdPic, setCollegeIdPic] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!profilePic || !collegeIdPic) {
      setMessage('Please upload both images');
      return;
    }

    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('collegeName', formData.collegeName);
    data.append('collegeIdNumber', formData.collegeIdNumber);
    data.append('profilePicture', profilePic);
    data.append('collegeIdCard', collegeIdPic);

    try {
      const response = await axios.post('http://localhost:5000/register', data);
      if (response.data.success) {
        setMessage('Registration successful! Check your email for password.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="registration-container">
      <h2>Student Registration</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>College Name</label>
          <input type="text" name="collegeName" value={formData.collegeName} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>College ID Number</label>
          <input type="text" name="collegeIdNumber" value={formData.collegeIdNumber} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Profile Picture (50KB-250KB)</label>
          <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} required />
        </div>

        <div className="form-group">
          <label>College ID Card (100KB-500KB)</label>
          <input type="file" accept="image/*" onChange={(e) => setCollegeIdPic(e.target.files[0])} required />
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Registration;