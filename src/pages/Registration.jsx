import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Registration() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    collegeName: '',
    collegeIdNumber: '',
    profilePicture: null,
    collegeIdCard: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  const validateFileSize = (file, minSize, maxSize, fieldName) => {
    if (!file) return `${fieldName} is required`;
    const sizeKB = file.size / 1024;
    if (sizeKB < minSize) return `${fieldName} must be at least ${minSize}KB`;
    if (sizeKB > maxSize) return `${fieldName} must not exceed ${maxSize}KB`;
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.fullName) newErrors.fullName = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone Number is required';
    if (!formData.collegeName) newErrors.collegeName = 'College Name is required';
    if (!formData.collegeIdNumber) newErrors.collegeIdNumber = 'College ID Number is required';

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number validation
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10-15 digits';
    }

    // File validations
    const profileError = validateFileSize(formData.profilePicture, 50, 250, 'Profile Picture');
    if (profileError) newErrors.profilePicture = profileError;

    const idCardError = validateFileSize(formData.collegeIdCard, 100, 500, 'College ID Card');
    if (idCardError) newErrors.collegeIdCard = idCardError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post('http://localhost:5000/api/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data && response.data.success) {
        alert('Registration successful! Please check your email for your password.');
        setTimeout(() => {
          navigate('/login', { state: { email: formData.email } });
        }, 5000);
      }
    } catch (error) {
      if (error.response?.data?.message?.includes('duplicate')) {
        setErrors({ email: 'This email is already registered. Please login or use a different email.' });
      } else {
        setErrors({ submit: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5002/ws'); // Update port to 5002
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    socket.onmessage = (event) => {
      console.log('Received message:', event.data);
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Online Exam Portal - Registration</h2>
      
      {errors.submit && (
        <div style={{ 
          color: 'red', 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#ffe6e6', 
          borderRadius: '4px',
          textAlign: 'center' 
        }}>
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: errors.fullName ? '1px solid red' : '1px solid #ddd',
              fontSize: '16px'
            }}
            required
          />
          {errors.fullName && (
            <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>
              {errors.fullName}
            </div>
          )}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: errors.email ? '1px solid red' : '1px solid #ddd',
              fontSize: '16px'
            }}
            required
          />
          {errors.email && (
            <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>
              {errors.email}
            </div>
          )}
        </div>

        <div>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number (10-15 digits)"
            value={formData.phoneNumber}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: errors.phoneNumber ? '1px solid red' : '1px solid #ddd',
              fontSize: '16px'
            }}
            required
          />
          {errors.phoneNumber && (
            <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>
              {errors.phoneNumber}
            </div>
          )}
        </div>

        <div>
          <input
            type="text"
            name="collegeName"
            placeholder="College Name"
            value={formData.collegeName}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: errors.collegeName ? '1px solid red' : '1px solid #ddd',
              fontSize: '16px'
            }}
            required
          />
          {errors.collegeName && (
            <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>
              {errors.collegeName}
            </div>
          )}
        </div>

        <div>
          <input
            type="text"
            name="collegeIdNumber"
            placeholder="College ID Number"
            value={formData.collegeIdNumber}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: errors.collegeIdNumber ? '1px solid red' : '1px solid #ddd',
              fontSize: '16px'
            }}
            required
          />
          {errors.collegeIdNumber && (
            <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>
              {errors.collegeIdNumber}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Profile Picture (50KB - 250KB)
          </label>
          <input
            type="file"
            name="profilePicture"
            accept="image/*"
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: errors.profilePicture ? '1px solid red' : '1px solid #ddd'
            }}
            required
          />
          {errors.profilePicture && (
            <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>
              {errors.profilePicture}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            College ID Card (100KB - 500KB)
          </label>
          <input
            type="file"
            name="collegeIdCard"
            accept="image/*"
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: errors.collegeIdCard ? '1px solid red' : '1px solid #ddd'
            }}
            required
          />
          {errors.collegeIdCard && (
            <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>
              {errors.collegeIdCard}
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '12px',
            backgroundColor: isSubmitting ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Already have an account? <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Login here</a>
      </p>
    </div>
  );
}

export default Registration;