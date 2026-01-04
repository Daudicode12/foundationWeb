import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAuthService } from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ text: '', isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in as admin
    const token = localStorage.getItem('adminToken');
    if (token) {
      adminAuthService.verifyToken(token)
        .then(data => {
          if (data.valid) {
            navigate('/admin/dashboard');
          }
        })
        .catch(() => {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', isError: false });

    const { email, password } = formData;

    if (!email || !password) {
      setMessage({ text: 'Please fill in all fields.', isError: true });
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await adminAuthService.login(email, password);
      
      if (data.success) {
        setMessage({ text: 'Login successful!', isError: false });
        
        // Store admin token and data
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify({
          email: email,
          name: data.adminName || 'Admin'
        }));
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        setMessage({ text: data.message || 'Login failed', isError: true });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setMessage({ text: 'An error occurred. Please try again.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1><i className="fas fa-shield-alt"></i> FOCM Admin</h1>
            <p>Administrator Portal</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login to Admin Panel'}
            </button>
            
            {message.text && (
              <div className={`message ${message.isError ? 'error' : 'success'}`}>
                {message.text}
              </div>
            )}
          </form>
          
          <div className="back-link">
            <Link to="/dashboard">← Back to Member Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
