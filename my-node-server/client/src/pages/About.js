import React from 'react';
import Navbar from '../components/Navbar';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <Navbar />
      
      <section className="intro">
        <div className="details">
          <h1>Welcome To Foundation Of Christ Church</h1>
          <p>
            Foundation Of Christ Miracles Church is a denomination that targets to convert and teach non-Christians and
            non-believers to know about God's salvation, and making the relationship between human and the Most
            High God. The Church also focuses on nourishing the spiritual and mental growth.
          </p>
          
          <div className="founder">
            <div className="founder-description">
              <div className="founder-header">
                <img src="/eduford_img/user2.jpg" alt="Bishop Francis Odipo" />
                <h4 className="name">Bishop Francis Odipo</h4>
              </div>
              <p className="description">
                Foundation Of Christ Church Was started by Bishop Francis Odipo Otieno.
                He accepted God's calling to preach His Gospel to different areas and also targeting to convert
                many people to start believing in the Lord.<br /><br />
                The Church was founded on 12-05-2004.
                The foundation of this church was set first in Ongata Rongai area in Kajiado County.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mission-vision">
        <div className="mission">
          <h2><i className="fas fa-bullseye"></i> Our Mission</h2>
          <p>
            To spread the Gospel of Jesus Christ to all nations, making disciples and nurturing 
            believers in their spiritual journey towards eternal life.
          </p>
        </div>
        <div className="vision">
          <h2><i className="fas fa-eye"></i> Our Vision</h2>
          <p>
            To be a beacon of hope and transformation in our community, creating a generation 
            of believers who live out their faith in every aspect of their lives.
          </p>
        </div>
      </section>

      <section className="churches">
        <div className="church-branches">
          <h2>Our Churches</h2>
          <p>
            Foundation Of Christ Miracles Church has various branches across Kenya within different counties. 
            These branches have God-chosen servants who have really sacrificed to do the Lord's work.
          </p>

          <div className="branches">
            <h3>Church Branches</h3>
            <div className="branch-list">
              <div className="branch-card">
                <i className="fas fa-church"></i>
                <h4>Nairobi Branch</h4>
                <p>Main Branch</p>
              </div>
              <div className="branch-card">
                <i className="fas fa-church"></i>
                <h4>Migori Branch</h4>
                <p>Western Region</p>
              </div>
              <div className="branch-card">
                <i className="fas fa-church"></i>
                <h4>Siaya Branch</h4>
                <p>Lake Region</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 Foundation Of Christ Miracles Church. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default About;
