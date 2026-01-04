import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ text: '', isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('memberToken');
    if (token) {
      authService.verifyToken(token)
        .then(data => {
          if (data.valid) {
            navigate('/dashboard');
          }
        })
        .catch(() => {
          localStorage.removeItem('memberToken');
          localStorage.removeItem('userData');
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
      const data = await authService.login(email, password);
      
      if (data.success) {
        setMessage({ text: data.message, isError: false });
        
        // Store token and user data
        localStorage.setItem('memberToken', data.token);
        localStorage.setItem('userData', JSON.stringify({
          userName: data.userName || email.split('@')[0],
          email: email,
          phone: data.phone,
          role: data.role || 'member'
        }));
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setMessage({ text: 'Login failed: ' + data.message, isError: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ text: 'An error occurred. Please try again later.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p className="back-link">
          <Link to="/">← Back to Home</Link>
        </p>
        
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
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="signup-link">
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
        
        {message.text && (
          <div className={`message ${message.isError ? 'error' : 'success'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
