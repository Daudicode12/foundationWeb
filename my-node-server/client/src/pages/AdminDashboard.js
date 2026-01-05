import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { adminMembersService, eventsService, adminEventsService } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAnnouncements: 0,
    totalMembers: 0,
    totalRSVPs: 0
  });
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'service'
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load stats
      const statsData = await adminMembersService.getStats();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Load events
      const eventsData = await eventsService.getAll();
      if (eventsData.success) {
        setEvents(eventsData.events || []);
      }

      // Load members
      const membersData = await adminMembersService.getAll();
      if (membersData.success) {
        setMembers(membersData.members || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const showSection = (section) => {
    setActiveSection(section);
  };

  const handleEventFormChange = (e) => {
    setEventForm({
      ...eventForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminEventsService.create(eventForm);
      if (response.success) {
        setShowEventModal(false);
        setEventForm({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          category: 'service'
        });
        setSuccessMessage('Event added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await adminEventsService.delete(eventId);
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
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
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Sidebar isAdmin={true} onSectionChange={showSection} activeSection={activeSection} />
      
      <main className="admin-main-content">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </header>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i> {successMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalEvents}</h3>
              <p>Total Events</p>
            </div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">
              <i className="fas fa-bullhorn"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalAnnouncements}</h3>
              <p>Announcements</p>
            </div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalMembers}</h3>
              <p>Members</p>
            </div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalRSVPs}</h3>
              <p>Total RSVPs</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {activeSection === 'dashboard' && (
          <section className="content-section">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button 
                className="action-btn"
                onClick={() => { showSection('events'); setShowEventModal(true); }}
              >
                <i className="fas fa-calendar-plus"></i>
                Add New Event
              </button>
              <button 
                className="action-btn"
                onClick={() => showSection('members')}
              >
                <i className="fas fa-user-friends"></i>
                View Members
              </button>
            </div>
          </section>
        )}

        {/* Events Section */}
        {activeSection === 'events' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Manage Events</h2>
              <button 
                className="primary-btn"
                onClick={() => setShowEventModal(true)}
              >
                <i className="fas fa-plus-circle"></i> Add New Event
              </button>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length > 0 ? (
                    events.map(event => (
                      <tr key={event.id}>
                        <td>{event.title}</td>
                        <td><span className="badge">{event.category}</span></td>
                        <td>{formatDate(event.date)}</td>
                        <td>{event.location}</td>
                        <td>
                          <button className="edit-btn">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No events found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Members Section */}
        {activeSection === 'members' && (
          <section className="content-section">
            <div className="section-header">
              <h2>View Members</h2>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length > 0 ? (
                    members.map(member => (
                      <tr key={member.id}>
                        <td>{member.userName}</td>
                        <td>{member.email}</td>
                        <td>{member.phone}</td>
                        <td><span className="badge">{member.role || 'member'}</span></td>
                        <td>{member.created_at ? formatDate(member.created_at) : 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No members found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Announcements Section */}
        {activeSection === 'announcements' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Manage Announcements</h2>
              <button className="primary-btn">
                <i className="fas fa-plus"></i> New Announcement
              </button>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" className="no-data">No announcements yet. Create your first announcement!</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* RSVPs Section */}
        {activeSection === 'rsvps' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Event RSVPs</h2>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Member</th>
                    <th>Email</th>
                    <th>RSVP Date</th>
                    <th>Status</th>
                    <th>Sermons</th>
                    <th>Offering</th>

                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="5" className="no-data">No RSVPs recorded yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

         {/* offering section */}
        {activeSection === 'offerings' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Offerings</h2>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Member</th>
                    <th>Email</th>
                    <th>RSVP Date</th>
                    <th>Status</th>
                    <th>Sermons</th>
                    <th>Offering</th>

                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="5" className="no-data">No Offerings recorded yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

         {/* Sermons section */}
        {activeSection === 'sermons' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Sermons</h2>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Member</th>
                    <th>Email</th>
                    <th>RSVP Date</th>
                    <th>Status</th>
                    <th>Sermons</th>
                    <th>Offering</th>

                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="5" className="no-data">No Sermons recorded yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button 
            className={activeSection === 'dashboard' ? 'active' : ''}
            onClick={() => showSection('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeSection === 'events' ? 'active' : ''}
            onClick={() => showSection('events')}
          >
            Events
          </button>
          <button 
            className={activeSection === 'announcements' ? 'active' : ''}
            onClick={() => showSection('announcements')}
          >
            Announcements
          </button>
          <button 
            className={activeSection === 'members' ? 'active' : ''}
            onClick={() => showSection('members')}
          >
            Members
          </button>
          <button 
            className={activeSection === 'rsvps' ? 'active' : ''}
            onClick={() => showSection('rsvps')}
          >
            RSVPs
          </button>
                    <button 
            className={activeSection === 'offerings' ? 'active' : ''}
            onClick={() => showSection('offerings')}
          >
            offerings
          </button>
                    <button 
            className={activeSection === 'sermons' ? 'active' : ''}
            onClick={() => showSection('sermons')}
          >
            sermons
          </button>
        </div>
      </main>

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Event</h3>
              <button className="close-btn" onClick={() => setShowEventModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEventSubmit}>
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={eventForm.date}
                    onChange={handleEventFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={eventForm.time}
                    onChange={handleEventFormChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventFormChange}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={eventForm.category}
                  onChange={handleEventFormChange}
                >
                  <option value="service">Service</option>
                  <option value="meeting">Meeting</option>
                  <option value="fellowship">Fellowship</option>
                  <option value="outreach">Outreach</option>
                  <option value="youth">Youth</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEventModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
