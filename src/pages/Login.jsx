import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Pre-fill email if coming from registration
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/api/login', formData);
      
      if (response.data && response.data.token) {
        // Store the token
        localStorage.setItem('token', response.data.token);
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Login failed. Please check your credentials.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Online Exam Portal - Login</h2>
      
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
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: errors.password ? '1px solid red' : '1px solid #ddd',
              fontSize: '16px'
            }}
            required
          />
          {errors.password && (
            <div style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>
              {errors.password}
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
            fontSize: '16px'
          }}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Don't have an account? <a href="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register here</a>
      </p>
    </div>
  );
}

export default Login;