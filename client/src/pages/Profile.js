import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    setUserData(storedUserData);
    setFormData({
      userName: storedUserData.userName || '',
      email: storedUserData.email || '',
      phone: storedUserData.phone || ''
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update localStorage
    const updatedUserData = { ...userData, ...formData };
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    setUserData(updatedUserData);
    setIsEditing(false);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <h1>My Profile</h1>
        </header>

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            
            {!isEditing ? (
              <div className="profile-info">
                <div className="info-row">
                  <label>Full Name</label>
                  <p>{userData.userName || 'Not set'}</p>
                </div>
                <div className="info-row">
                  <label>Email</label>
                  <p>{userData.email || 'Not set'}</p>
                </div>
                <div className="info-row">
                  <label>Phone</label>
                  <p>{userData.phone || 'Not set'}</p>
                </div>
                <div className="info-row">
                  <label>Role</label>
                  <p className="role-badge">{userData.role || 'Member'}</p>
                </div>
                <button 
                  className="btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit"></i> Edit Profile
                </button>
              </div>
            ) : (
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="userName">Full Name</label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-buttons">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
