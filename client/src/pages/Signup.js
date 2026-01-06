import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

    const { userName, email, phone, password, confirmPassword } = formData;

    // Validation
    if (!userName || !email || !phone || !password || !confirmPassword) {
      setMessage({ text: 'Please fill in all fields.', isError: true });
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters.', isError: true });
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', isError: true });
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await authService.signup({ userName, email, phone, password });
      
      if (data.success) {
        setMessage({ text: data.message, isError: false });
        
        // Redirect to login after short delay
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        setMessage({ text: data.message || 'Signup failed', isError: true });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage({ text: 'Network error. Please try again later.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>Sign Up</h2>
        <p className="back-link">
          <Link to="/">← Back to Home</Link>
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="userName"
              placeholder="Full Name"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="login-link">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
        
        {message.text && (
          <div className={`message ${message.isError ? 'error' : 'success'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
