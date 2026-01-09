import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isAdmin = false, onSectionChange, activeSection, onGivingClick, onPrayerClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      navigate('/admin/login');
    } else {
      localStorage.removeItem('memberToken');
      localStorage.removeItem('userData');
      navigate('/login');
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
    { path: '#groups', label: 'Small Groups', icon: 'fas fa-users' },
    { path: '#resources', label: 'Resources', icon: 'fas fa-folder' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', section: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { path: '/admin/dashboard', section: 'events', label: 'Manage Events', icon: 'fas fa-calendar-check' },
    { path: '/admin/dashboard', section: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn' },
    { path: '/admin/dashboard', section: 'members', label: 'View Members', icon: 'fas fa-user-friends' },
    { path: '/admin/dashboard', section: 'rsvps', label: 'Event RSVPs', icon: 'fas fa-clipboard-list' },
    { path: '/admin/dashboard', section: 'offerings', label: 'Manage Offerings', icon: 'fas fa-hands' },
    { path: '/admin/dashboard', section: 'sermons', label: 'Manage Sermons', icon: 'fas fa-book' },
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
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
