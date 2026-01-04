import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { authService, eventsService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
            <button className="btn-primary">Submit Prayer Request</button>
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
    </div>
  );
};

export default Dashboard;
