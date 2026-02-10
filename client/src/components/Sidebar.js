import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService, adminAuthService } from '../services/api';
import './Sidebar.css';

const Sidebar = ({ isAdmin = false, isSuperAdmin = false, onSectionChange, activeSection, onGivingClick, onPrayerClick, onResourcesClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear httpOnly cookies on server
      if (isAdmin) {
        await adminAuthService.logout();
        localStorage.removeItem('adminData');
        localStorage.removeItem('isAdminLoggedIn');
        navigate('/admin/login');
      } else {
        await authService.logout();
        localStorage.removeItem('userData');
        localStorage.removeItem('isLoggedIn');
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data and redirect even if API fails
      localStorage.clear();
      navigate(isAdmin ? '/admin/login' : '/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = (link) => {
    closeSidebar();
    if (link.section && onSectionChange) {
      onSectionChange(link.section);
    }
  };

  const memberLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { path: '/profile', label: 'My Profile', icon: 'fas fa-user' },
    { path: '/events', label: 'Events', icon: 'fas fa-calendar' },
    { path: '/sermons', label: 'Sermons', icon: 'fas fa-book' },
    { action: 'giving', label: 'My Giving', icon: 'fas fa-heart' },
    { action: 'prayer', label: 'Prayer Requests', icon: 'fas fa-pray' },
    { action: 'resources', label: 'Resources', icon: 'fas fa-book-open' },
    { path: '#groups', label: 'Small Groups', icon: 'fas fa-users' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', section: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { path: '/admin/dashboard', section: 'events', label: 'Manage Events', icon: 'fas fa-calendar-check' },
    { path: '/admin/dashboard', section: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn' },
    { path: '/admin/dashboard', section: 'members', label: 'View Members', icon: 'fas fa-user-friends' },
    { path: '/admin/dashboard', section: 'rsvps', label: 'Event RSVPs', icon: 'fas fa-clipboard-list' },
    { path: '/admin/dashboard', section: 'offerings', label: 'Manage Offerings', icon: 'fas fa-hands' },
    { path: '/admin/dashboard', section: 'sermons', label: 'Manage Sermons', icon: 'fas fa-book' },
    { path: '/admin/dashboard', section: 'prayer-requests', label: 'Prayer Requests', icon: 'fas fa-pray' },
    { path: '/admin/dashboard', section: 'resources', label: 'Manage Resources', icon: 'fas fa-book-open' },
  ];

  const links = isAdmin ? adminLinks : memberLinks;

  return (
    <>
      <button className={`hamburger-menu ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`overlay ${isOpen ? 'active' : ''}`} onClick={closeSidebar}></div>

      <nav className={`sidebar ${isOpen ? 'active' : ''}`}>
        <div className="logo">
          <h2>{isAdmin ? 'FOCM Admin' : 'FOCM'}</h2>
          <p>{isAdmin ? 'Administrator Portal' : 'Foundation of Christ Ministries'}</p>
        </div>

        <ul className="nav-menu">
          {links.map((link, index) => (
            <li key={`${link.path || link.action}-${index}`}>
              {link.section ? (
                <button
                  className={`nav-link-btn ${activeSection === link.section ? 'active' : ''}`}
                  onClick={() => handleLinkClick(link)}
                >
                  <i className={link.icon}></i> {link.label}
                </button>
              ) : link.action ? (
                <button
                  className="nav-link-btn"
                  onClick={() => {
                    closeSidebar();
                    if (link.action === 'giving' && onGivingClick) {
                      onGivingClick();
                    } else if (link.action === 'prayer' && onPrayerClick) {
                      onPrayerClick();
                    } else if (link.action === 'resources' && onResourcesClick) {
                      onResourcesClick();
                    }
                  }}
                >
                  <i className={link.icon}></i> {link.label}
                </button>
              ) : (
                <Link
                  to={link.path}
                  className={isActive(link.path) ? 'active' : ''}
                  onClick={closeSidebar}
                >
                  <i className={link.icon}></i> {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          {!isAdmin && (
            <Link to="/admin/login" className="admin-link">
              Admin Panel
            </Link>
          )}
          {isAdmin && adminData.role === 'super_admin' && location.pathname !== '/super-admin/dashboard' && (
            <Link to="/super-admin/dashboard" className="super-admin-link">
              <i className="fas fa-crown"></i> Super Admin Dashboard
            </Link>
          )}
          {isAdmin && adminData.role === 'super_admin' && location.pathname === '/super-admin/dashboard' && (
            <Link to="/admin/dashboard" className="admin-link">
              <i className="fas fa-arrow-left"></i> Regular Admin Dashboard
            </Link>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
