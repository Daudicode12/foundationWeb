import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { authService, eventsService, prayerRequestService, myOfferingsService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showOfferingsModal, setShowOfferingsModal] = useState(false);
  const [myOfferings, setMyOfferings] = useState([]);
  const [offeringsTotal, setOfferingsTotal] = useState(0);
  const [offeringsSummary, setOfferingsSummary] = useState([]);
  const [prayerForm, setPrayerForm] = useState({ title: '', request: '', isAnonymous: false });
  const [prayerStatus, setPrayerStatus] = useState({ message: '', isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem('memberToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    alert('Your session has expired. Please log in again.');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('memberToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const data = await authService.verifyToken(token);
        if (!data.valid) {
          handleSessionExpired();
          return;
        }
      } catch (error) {
        console.error('Session verification error:', error);
      }

      // Load user data
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      setUserData(storedUserData);

      // Load upcoming events
      try {
        const eventsData = await eventsService.getUpcoming();
        if (eventsData.success) {
          setUpcomingEvents(eventsData.events?.slice(0, 3) || []);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }

      // Load user's offerings
      if (storedUserData.email) {
        try {
          const offeringsData = await myOfferingsService.getMyOfferings(storedUserData.email);
          if (offeringsData.success) {
            setMyOfferings(offeringsData.data || []);
          }

          const totalData = await myOfferingsService.getMyTotal(storedUserData.email);
          if (totalData.success) {
            setOfferingsTotal(totalData.total || 0);
          }

          const summaryData = await myOfferingsService.getMySummary(storedUserData.email);
          if (summaryData.success) {
            setOfferingsSummary(summaryData.data || []);
          }
        } catch (error) {
          console.error('Error loading offerings:', error);
        }
      }

      setIsLoading(false);
    };

    verifySession();

    // Set up token refresh interval
    const refreshInterval = setInterval(async () => {
      const token = localStorage.getItem('memberToken');
      if (token) {
        try {
          const data = await authService.refreshToken(token);
          if (data.success && data.token) {
            localStorage.setItem('memberToken', data.token);
          }
        } catch (error) {
          console.error('Token refresh error:', error);
        }
      }
    }, 20 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [navigate, handleSessionExpired]);

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const handlePrayerInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrayerForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePrayerSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPrayerStatus({ message: '', isError: false });

    try {
      const response = await prayerRequestService.submit({
        userId: userData.id,
        userName: userData.userName,
        userEmail: userData.email,
        title: prayerForm.title,
        request: prayerForm.request,
        isAnonymous: prayerForm.isAnonymous
      });

      if (response.success) {
        setPrayerStatus({ message: response.message, isError: false });
        setPrayerForm({ title: '', request: '', isAnonymous: false });
        setTimeout(() => {
          setShowPrayerModal(false);
          setPrayerStatus({ message: '', isError: false });
        }, 2000);
      } else {
        setPrayerStatus({ message: response.message || 'Failed to submit prayer request', isError: true });
      }
    } catch (error) {
      setPrayerStatus({ message: 'An error occurred. Please try again.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Welcome, <span>{userData.userName || 'Member'}</span>!</h1>
          <p className="date">{getCurrentDate()}</p>
        </header>

        <section className="dashboard-grid">
          <div className="card">
            <h3><i className="fas fa-calendar-alt"></i> Upcoming Events</h3>
            <div className="event-list">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div key={event.id} className="event-item">
                    <p className="event-title">{event.title}</p>
                    <p className="event-date">{formatDate(event.date)}</p>
                  </div>
                ))
              ) : (
                <p className="no-events">No upcoming events</p>
              )}
            </div>
            <Link to="/events" className="card-link">View All Events →</Link>
          </div>

          <div className="card">
            <h3><i className="fas fa-book-open"></i> Recent Sermons</h3>
            <div className="sermon-list">
              <div className="sermon-item">
                <p className="sermon-title">Walking in Faith</p>
                <p className="sermon-date">Oct 29, 2025</p>
              </div>
              <div className="sermon-item">
                <p className="sermon-title">The Power of Prayer</p>
                <p className="sermon-date">Oct 22, 2025</p>
              </div>
            </div>
            <a href="#sermons" className="card-link">View All Sermons →</a>
          </div>

          <div className="card">
            <h3><i className="fas fa-praying-hands"></i> Prayer Requests</h3>
            <p>Submit your prayer requests and pray for others in the community.</p>
            <button className="btn-primary" onClick={() => setShowPrayerModal(true)}>Submit Prayer Request</button>
          </div>

          <div className="card">
            <h3><i className="fas fa-hand-holding-heart"></i> My Giving</h3>
            <p className="giving-total">Total This Year: <strong>$0.00</strong></p>
            <button className="btn-primary">Make a Donation</button>
          </div>

          <div className="card">
            <h3><i className="fas fa-users"></i> My Small Group</h3>
            <p>You're not part of a small group yet.</p>
            <button className="btn-primary">Join a Group</button>
          </div>

          <div className="card">
            <h3><i className="fas fa-bullhorn"></i> Announcements</h3>
            <ul className="announcement-list">
              <li>New church directory available</li>
              <li>Youth camp registration open</li>
              <li>Volunteer opportunities</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Prayer Request Modal */}
      {showPrayerModal && (
        <div className="modal-overlay" onClick={() => setShowPrayerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPrayerModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2><i className="fas fa-praying-hands"></i> Submit Prayer Request</h2>
            <p className="modal-subtitle">Share your prayer needs with our church family</p>
            
            <form onSubmit={handlePrayerSubmit}>
              <div className="form-group">
                <label htmlFor="title">Prayer Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={prayerForm.title}
                  onChange={handlePrayerInputChange}
                  placeholder="Brief title for your prayer request"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="request">Your Prayer Request</label>
                <textarea
                  id="request"
                  name="request"
                  value={prayerForm.request}
                  onChange={handlePrayerInputChange}
                  placeholder="Share your prayer request here..."
                  rows="5"
                  required
                ></textarea>
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isAnonymous"
                    checked={prayerForm.isAnonymous}
                    onChange={handlePrayerInputChange}
                  />
                  <span>Submit anonymously</span>
                </label>
              </div>
              
              <button type="submit" className="btn-primary btn-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}
              </button>
            </form>
            
            {prayerStatus.message && (
              <div className={`status-message ${prayerStatus.isError ? 'error' : 'success'}`}>
                {prayerStatus.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
