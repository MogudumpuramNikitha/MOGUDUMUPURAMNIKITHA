import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  
  return (
    <div className="login-container">
      <h2>Login</h2>
      <form>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required />
        </div>
        <button type="submit">Login</button>
        <p>Don't have an account? <span onClick={() => navigate('/register')}>Register</span></p>
      </form>
    </div>
  );
}

export default Login;