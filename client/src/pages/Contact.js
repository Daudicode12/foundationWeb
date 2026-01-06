import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { contactService } from '../services/api';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ message: '', isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: '', isError: false });

    try {
      const response = await contactService.sendMessage(formData);
      if (response.success) {
        setStatus({ message: 'Message sent successfully!', isError: false });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setStatus({ message: response.message || 'Failed to send message', isError: true });
      }
    } catch (error) {
      setStatus({ message: 'An error occurred. Please try again.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <Navbar />
      
      <section className="contact-section">
        <div className="contact-container">
          <h1>Get In Touch With Us</h1>
          <p>We'd love to hear from you. Reach out to us for prayers, guidance, or any questions.</p>

          <div className="contact-content">
            <div className="contact-info">
              <h2>Contact Information</h2>
              
              <div className="info-item">
                <h3><i className="fas fa-map-marker-alt"></i> Location</h3>
                <p>
                  Foundation Of Christ Miracles Church<br />
                  Ongata Rongai<br />
                  Kajiado County, Kenya
                </p>
              </div>

              <div className="info-item">
                <h3><i className="fas fa-phone"></i> Phone</h3>
                <p>+254 700 000 000</p>
              </div>

              <div className="info-item">
                <h3><i className="fas fa-envelope"></i> Email</h3>
                <p>info@fcmchurch.org</p>
              </div>

              <div className="info-item">
                <h3><i className="fas fa-clock"></i> Service Times</h3>
                <p>
                  Sunday Service: 9:00 AM - 12:00 PM<br />
                  Wednesday Bible Study: 6:00 PM - 8:00 PM<br />
                  Friday Prayer Meeting: 6:00 PM - 8:00 PM
                </p>
              </div>
            </div>

            <div className="contact-form">
              <h2>Send Us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
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
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
              
              {status.message && (
                <div className={`form-message ${status.isError ? 'error' : 'success'}`}>
                  {status.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
