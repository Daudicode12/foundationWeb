import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-section">
        <Link to="/">
          <img src="/eduford_img/image2.jpeg" alt="FOCM Logo" className="logo" />
        </Link>
        
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <img 
            src="/eduford_img/times bar.png" 
            alt="Close menu" 
            className="times-bar" 
            onClick={closeMenu}
          />
          <ul>
            <li>
              <Link 
                to="/" 
                className={isActive('/') ? 'active' : ''} 
                onClick={closeMenu}
              >
                HOME
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={isActive('/about') ? 'active' : ''} 
                onClick={closeMenu}
              >
                ABOUT
              </Link>
            </li>
            <li>
              <Link 
                to="/signup" 
                className={isActive('/signup') ? 'active' : ''} 
                onClick={closeMenu}
              >
                SIGN UP
              </Link>
            </li>
            <li>
              <Link 
                to="/login" 
                className={isActive('/login') ? 'active' : ''} 
                onClick={closeMenu}
              >
                LOGIN
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={isActive('/contact') ? 'active' : ''} 
                onClick={closeMenu}
              >
                CONTACT
              </Link>
            </li>
          </ul>
        </div>
        
        <img 
          src="/eduford_img/menu bar.png" 
          alt="Open menu" 
          className="menu-bar" 
          onClick={toggleMenu}
        />
      </div>
    </nav>
  );
};

export default Navbar;
