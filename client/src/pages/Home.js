import React from 'react';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  return (
    <>
      <section className="header">
        <Navbar />
        
        {/* Animated Background Elements */}
        <div className="hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="text-box">
          <div className="hero-badge">
            <i className="fas fa-church"></i>
            <span>Welcome to Our Community</span>
          </div>
          <h1>Foundation Of Christ<br /><span className="highlight">Miracles Church</span></h1>
          <p className="hero-subtitle">
            A Church Well Equipped To Meet With Christ<br />
            And Offer Spiritual Guidance For A Strong Spiritual Growth
          </p>
          
          <div className="hero-buttons">
            <a href="/signup" className="hero-button primary">
              <span>Join Us Today</span>
              <i className="fas fa-arrow-right"></i>
            </a>
            <a href="/about" className="hero-button secondary">
              <span>Learn More</span>
              <i className="fas fa-info-circle"></i>
            </a>
          </div>

          {/* Quick Info Cards */}
          <div className="hero-info-cards">
            <div className="info-card">
              <i className="fas fa-clock"></i>
              <div>
                <h4>Sunday Service</h4>
                <p>9:00 AM - 12:00 PM</p>
              </div>
            </div>
            <div className="info-card">
              <i className="fas fa-users"></i>
              <div>
                <h4>Growing Community</h4>
                <p>Join Our Family</p>
              </div>
            </div>
            <div className="info-card">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <h4>Find Us</h4>
                <p>Visit Our Location</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="scroll-indicator">
          <span>Scroll Down</span>
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <h1>Services We Offer</h1>
        <p>
          This is a Church That is Preparing the believers Spiritually And Also Making Them Be Ready For The Second
          Coming Of Messiah.<br />
          We Also Help The Non-Believers to know About Christ And His Love For Us
        </p>
        
        <div className="row">
          <div className="services-col">
            <h3><i className="fas fa-bible"></i> Bible Study</h3>
            <p>Deep dive into God's Word with our weekly Bible study sessions. Understanding scripture together builds a stronger faith foundation.</p>
          </div>
          <div className="services-col">
            <h3><i className="fas fa-praying-hands"></i> Prayer Ministry</h3>
            <p>Join our prayer ministry where we intercede for each other and the world. Experience the power of collective prayer.</p>
          </div>
          <div className="services-col">
            <h3><i className="fas fa-music"></i> Worship</h3>
            <p>Experience uplifting worship that touches hearts and connects souls to the divine. Music that moves and inspires.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h1>Join Our Community Today</h1>
        <p>Become part of a loving family dedicated to spiritual growth and fellowship</p>
        <a href="/signup" className="hero-button primary">
          <span>Get Started</span>
          <i className="fas fa-arrow-right"></i>
        </a>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Foundation Of Christ Miracles Church</h3>
            <p>A Church Well Equipped To Meet With Christ</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Foundation Of Christ Miracles Church. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Home;
