import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('User data received:', response.data); // Add this debug line
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCourseClick = async () => {
    setActiveSection('courses');
    // Fetch tests for the course
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTests(response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleTestStart = (testId) => {
    navigate(`/test/${testId}`);
  };

  return (
    <div className="dashboard" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Panel */}
      <div style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        padding: '20px',
        color: 'white'
      }}>
        <h2 style={{ marginBottom: '30px' }}>Navigation</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '15px' }}>
              <button 
                onClick={handleCourseClick}
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '18px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: '4px',
                  backgroundColor: activeSection === 'courses' ? '#34495e' : 'transparent'
                }}
              >
                My Courses
              </button>
            </li>
            <li style={{ marginBottom: '15px' }}>
              <button 
                onClick={() => setActiveSection('results')}
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '18px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: '4px',
                  backgroundColor: activeSection === 'results' ? '#34495e' : 'transparent'
                }}
              >
                Results
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        {/* Top Profile Section */}
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'flex-end',
          borderBottom: '1px solid #ddd',
          position: 'relative'
        }}>
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            {user && (
              <img
                src={user.profilePicture ? 
                  `http://localhost:5000/uploads/profiles/${user.profilePicture.split('\\').pop()}` : 
                  'https://via.placeholder.com/40'}
                alt={user.fullName || 'Profile'}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  objectFit: 'cover',
                  border: '2px solid #ddd'
                }}
                onError={(e) => {
                  console.error('Profile picture load error:', e.target.src);
                  e.target.src = 'https://via.placeholder.com/40';
                }}
              />
            )}
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                backgroundColor: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                borderRadius: '4px',
                width: '200px',
                zIndex: 1000
              }}>
                <ul style={{
                  listStyle: 'none',
                  padding: '0',
                  margin: '0'
                }}>
                  <li style={{ padding: '10px 20px', borderBottom: '1px solid #eee' }}>
                    <a href="/profile" style={{ color: '#333', textDecoration: 'none' }}>
                      My Profile
                    </a>
                  </li>
                  <li style={{ padding: '10px 20px', borderBottom: '1px solid #eee' }}>
                    <a href="/change-password" style={{ color: '#333', textDecoration: 'none' }}>
                      Change Password
                    </a>
                  </li>
                  <li style={{ padding: '10px 20px' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#333',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        padding: '0'
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '20px' }}>
          {activeSection === 'dashboard' && (
            <h1>Welcome to Your Dashboard</h1>
          )}

          {activeSection === 'courses' && (
            <div>
              <h2>Available Tests</h2>
              <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {tests.map(test => (
                  <div 
                    key={test.id}
                    style={{
                      padding: '20px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <h3>{test.title}</h3>
                    <p>Duration: {test.duration} minutes</p>
                    <p>Questions: {test.totalQuestions}</p>
                    <button
                      onClick={() => handleTestStart(test.id)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Start Test
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'results' && (
            <div>
              <h2>Your Test Results</h2>
              {/* Add results content here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;