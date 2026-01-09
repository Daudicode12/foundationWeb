import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { adminMembersService, eventsService, adminEventsService, adminRsvpsService, adminAnnouncementsService, adminSermonsService, adminOfferingsService, adminPrayerRequestService } from '../services/api';
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
  const [rsvps, setRsvps] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [offeringsSummary, setOfferingsSummary] = useState([]);
  const [totalOfferings, setTotalOfferings] = useState(0);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [selectedPrayerRequest, setSelectedPrayerRequest] = useState(null);
  const [showPrayerDetailModal, setShowPrayerDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showSermonModal, setShowSermonModal] = useState(false);
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'service'
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'general',
    author: '',
    date: ''
  });
  const [sermonForm, setSermonForm] = useState({
    title: '',
    preacher: '',
    description: '',
    scripture_reference: '',
    date: '',
    time: '',
    day_type: 'sunday',
    series_name: '',
    video_url: '',
    audio_url: ''
  });
  const [offeringForm, setOfferingForm] = useState({
    member_name: '',
    email: '',
    phone: '',
    amount: '',
    offering_type: 'offering',
    payment_method: 'cash',
    reference_number: '',
    date: '',
    notes: '',
    is_anonymous: false
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
        setMembers(membersData.members || membersData.data || []);
      }

      // Load RSVPs
      const rsvpsData = await adminRsvpsService.getAll();
      if (rsvpsData.success) {
        setRsvps(rsvpsData.data || []);
      }

      // Load Announcements
      const announcementsData = await adminAnnouncementsService.getAll();
      if (announcementsData.success) {
        setAnnouncements(announcementsData.data || []);
      }

      // Load Sermons
      const sermonsData = await adminSermonsService.getAll();
      if (sermonsData.success) {
        setSermons(sermonsData.data || []);
      }

      // Load Offerings
      const offeringsData = await adminOfferingsService.getAll();
      if (offeringsData.success) {
        setOfferings(offeringsData.data || []);
      }

      // Load Offerings Summary
      const summaryData = await adminOfferingsService.getSummary();
      if (summaryData.success) {
        setOfferingsSummary(summaryData.data || []);
      }

      // Load Total Offerings
      const totalData = await adminOfferingsService.getTotal();
      if (totalData.success) {
        setTotalOfferings(totalData.total || 0);
      }

      // Load Prayer Requests
      const prayerData = await adminPrayerRequestService.getAll();
      if (prayerData.success) {
        setPrayerRequests(prayerData.prayerRequests || []);
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

  // Announcement handlers
  const handleAnnouncementFormChange = (e) => {
    setAnnouncementForm({
      ...announcementForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAnnouncementsService.create(announcementForm);
      if (response.success) {
        setShowAnnouncementModal(false);
        setAnnouncementForm({
          title: '',
          content: '',
          priority: 'general',
          author: '',
          date: ''
        });
        setSuccessMessage('Announcement added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await adminAnnouncementsService.delete(announcementId);
        setSuccessMessage('Announcement deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  // Sermon handlers
  const handleSermonFormChange = (e) => {
    setSermonForm({
      ...sermonForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSermonSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminSermonsService.create(sermonForm);
      if (response.success) {
        setShowSermonModal(false);
        setSermonForm({
          title: '',
          preacher: '',
          description: '',
          scripture_reference: '',
          date: '',
          time: '',
          day_type: 'sunday',
          series_name: '',
          video_url: '',
          audio_url: ''
        });
        setSuccessMessage('Sermon added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error creating sermon:', error);
    }
  };

  const handleDeleteSermon = async (sermonId) => {
    if (window.confirm('Are you sure you want to delete this sermon?')) {
      try {
        await adminSermonsService.delete(sermonId);
        setSuccessMessage('Sermon deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting sermon:', error);
      }
    }
  };

  // Offering handlers
  const handleOfferingFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferingForm({
      ...offeringForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleOfferingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminOfferingsService.create(offeringForm);
      if (response.success) {
        setShowOfferingModal(false);
        setOfferingForm({
          member_name: '',
          email: '',
          phone: '',
          amount: '',
          offering_type: 'offering',
          payment_method: 'cash',
          reference_number: '',
          date: '',
          notes: '',
          is_anonymous: false
        });
        setSuccessMessage('Offering recorded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error creating offering:', error);
    }
  };

  const handleDeleteOffering = async (offeringId) => {
    if (window.confirm('Are you sure you want to delete this offering record?')) {
      try {
        await adminOfferingsService.delete(offeringId);
        setSuccessMessage('Offering deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting offering:', error);
      }
    }
  };

  // Prayer Request handlers
  const handleViewPrayerRequest = async (prayerRequest) => {
    setSelectedPrayerRequest(prayerRequest);
    setShowPrayerDetailModal(true);
    // Mark as read if not already read
    if (!prayerRequest.is_read) {
      try {
        await adminPrayerRequestService.markAsRead(prayerRequest.id);
        loadDashboardData();
      } catch (error) {
        console.error('Error marking prayer request as read:', error);
      }
    }
  };

  const handleUpdatePrayerStatus = async (prayerId, status) => {
    try {
      await adminPrayerRequestService.updateStatus(prayerId, status);
      setSuccessMessage(`Prayer request marked as ${status}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      loadDashboardData();
      if (selectedPrayerRequest && selectedPrayerRequest.id === prayerId) {
        setSelectedPrayerRequest({ ...selectedPrayerRequest, status });
      }
    } catch (error) {
      console.error('Error updating prayer request status:', error);
    }
  };

  const handleDeletePrayerRequest = async (prayerId) => {
    if (window.confirm('Are you sure you want to delete this prayer request?')) {
      try {
        await adminPrayerRequestService.delete(prayerId);
        setSuccessMessage('Prayer request deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowPrayerDetailModal(false);
        setSelectedPrayerRequest(null);
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting prayer request:', error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
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
              <button className="primary-btn" onClick={() => setShowAnnouncementModal(true)}>
                <i className="fas fa-plus"></i> New Announcement
              </button>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.length > 0 ? (
                    announcements.map(announcement => (
                      <tr key={announcement.id}>
                        <td>{announcement.title}</td>
                        <td>{announcement.author}</td>
                        <td>{formatDate(announcement.date)}</td>
                        <td><span className={`badge ${announcement.priority}`}>{announcement.priority}</span></td>
                        <td>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No announcements yet. Create your first announcement!</td>
                    </tr>
                  )}
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
                    <th>Event Date</th>
                    <th>RSVP Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.length > 0 ? (
                    rsvps.map((rsvp, index) => (
                      <tr key={index}>
                        <td>{rsvp.eventTitle || 'N/A'}</td>
                        <td>{rsvp.userName || 'N/A'}</td>
                        <td>{rsvp.email}</td>
                        <td>{rsvp.eventDate ? formatDate(rsvp.eventDate) : 'N/A'}</td>
                        <td>{rsvp.rsvp_date ? formatDate(rsvp.rsvp_date) : 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No RSVPs recorded yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

         {/* offering section */}
        {activeSection === 'offerings' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Manage Offerings</h2>
              <button className="primary-btn" onClick={() => setShowOfferingModal(true)}>
                <i className="fas fa-plus"></i> Record New Offering
              </button>
            </div>

            {/* Offerings Summary Cards */}
            <div className="offerings-summary">
              <div className="summary-card total">
                <h4>Total Offerings</h4>
                <p className="amount">{formatCurrency(totalOfferings)}</p>
              </div>
              {offeringsSummary.map((item, index) => (
                <div key={index} className="summary-card">
                  <h4>{item.offering_type.charAt(0).toUpperCase() + item.offering_type.slice(1)}</h4>
                  <p className="amount">{formatCurrency(item.total)}</p>
                  <p className="count">{item.count} records</p>
                </div>
              ))}
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Member</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Payment Method</th>
                    <th>Reference</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offerings.length > 0 ? (
                    offerings.map(offering => (
                      <tr key={offering.id}>
                        <td>{formatDate(offering.date)}</td>
                        <td>{offering.is_anonymous ? 'Anonymous' : offering.member_name}</td>
                        <td className="amount-cell">{formatCurrency(offering.amount)}</td>
                        <td><span className={`badge ${offering.offering_type}`}>{offering.offering_type}</span></td>
                        <td>{offering.payment_method}</td>
                        <td>{offering.reference_number || '-'}</td>
                        <td>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteOffering(offering.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">No offerings recorded yet. Record your first offering!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

         {/* Sermons section */}
        {activeSection === 'sermons' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Manage Sermons</h2>
              <button className="primary-btn" onClick={() => setShowSermonModal(true)}>
                <i className="fas fa-plus"></i> Add New Sermon
              </button>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Preacher</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Day Type</th>
                    <th>Scripture</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sermons.length > 0 ? (
                    sermons.map(sermon => (
                      <tr key={sermon.id}>
                        <td>{sermon.title}</td>
                        <td>{sermon.preacher}</td>
                        <td>{formatDate(sermon.date)}</td>
                        <td>{sermon.time}</td>
                        <td><span className={`badge ${sermon.day_type}`}>{sermon.day_type === 'sunday' ? 'Sunday Service' : 'Weekday Service'}</span></td>
                        <td>{sermon.scripture_reference}</td>
                        <td>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteSermon(sermon.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">No sermons scheduled yet. Add your first sermon!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Prayer Requests Section */}
        {activeSection === 'prayer-requests' && (
          <section className="content-section">
            <div className="section-header">
              <h2>Prayer Requests</h2>
              <div className="prayer-stats">
                <span className="stat-badge unread">
                  <i className="fas fa-envelope"></i> {prayerRequests.filter(p => !p.is_read).length} Unread
                </span>
                <span className="stat-badge pending">
                  <i className="fas fa-clock"></i> {prayerRequests.filter(p => p.status === 'pending').length} Pending
                </span>
                <span className="stat-badge praying">
                  <i className="fas fa-pray"></i> {prayerRequests.filter(p => p.status === 'praying').length} Praying
                </span>
                <span className="stat-badge answered">
                  <i className="fas fa-check-circle"></i> {prayerRequests.filter(p => p.status === 'answered').length} Answered
                </span>
              </div>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Member</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Read</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prayerRequests.length > 0 ? (
                    prayerRequests.map(prayer => (
                      <tr key={prayer.id} className={!prayer.is_read ? 'unread-row' : ''}>
                        <td>{formatDate(prayer.created_at)}</td>
                        <td>{prayer.is_anonymous ? 'Anonymous' : prayer.user_name}</td>
                        <td>{prayer.title}</td>
                        <td>
                          <span className={`badge status-${prayer.status}`}>
                            {prayer.status}
                          </span>
                        </td>
                        <td>
                          {prayer.is_read ? (
                            <i className="fas fa-envelope-open" title="Read"></i>
                          ) : (
                            <i className="fas fa-envelope" title="Unread"></i>
                          )}
                        </td>
                        <td>
                          <button 
                            className="view-btn"
                            onClick={() => handleViewPrayerRequest(prayer)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeletePrayerRequest(prayer.id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No prayer requests yet.</td>
                    </tr>
                  )}
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
          <button 
            className={activeSection === 'prayer-requests' ? 'active' : ''}
            onClick={() => showSection('prayer-requests')}
          >
            Prayer Requests
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

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Announcement</h3>
              <button className="close-btn" onClick={() => setShowAnnouncementModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAnnouncementSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={announcementForm.title}
                  onChange={handleAnnouncementFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  name="content"
                  value={announcementForm.content}
                  onChange={handleAnnouncementFormChange}
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={announcementForm.date}
                    onChange={handleAnnouncementFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={announcementForm.priority}
                    onChange={handleAnnouncementFormChange}
                  >
                    <option value="general">General</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  name="author"
                  value={announcementForm.author}
                  onChange={handleAnnouncementFormChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAnnouncementModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sermon Modal */}
      {showSermonModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>Add New Sermon</h3>
              <button className="close-btn" onClick={() => setShowSermonModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSermonSubmit}>
              <div className="form-group">
                <label>Sermon Title</label>
                <input
                  type="text"
                  name="title"
                  value={sermonForm.title}
                  onChange={handleSermonFormChange}
                  placeholder="e.g., Walking in Faith"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Preacher</label>
                  <input
                    type="text"
                    name="preacher"
                    value={sermonForm.preacher}
                    onChange={handleSermonFormChange}
                    placeholder="Pastor's name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Scripture Reference</label>
                  <input
                    type="text"
                    name="scripture_reference"
                    value={sermonForm.scripture_reference}
                    onChange={handleSermonFormChange}
                    placeholder="e.g., John 3:16-21"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={sermonForm.description}
                  onChange={handleSermonFormChange}
                  rows="3"
                  placeholder="Brief description of the sermon"
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={sermonForm.date}
                    onChange={handleSermonFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={sermonForm.time}
                    onChange={handleSermonFormChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Service Day</label>
                  <select
                    name="day_type"
                    value={sermonForm.day_type}
                    onChange={handleSermonFormChange}
                  >
                    <option value="sunday">Sunday Service</option>
                    <option value="weekday">Weekday Service</option>
                    <option value="wednesday">Wednesday Bible Study</option>
                    <option value="friday">Friday Prayer Meeting</option>
                    <option value="special">Special Service</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Series Name (Optional)</label>
                  <input
                    type="text"
                    name="series_name"
                    value={sermonForm.series_name}
                    onChange={handleSermonFormChange}
                    placeholder="e.g., Faith Series"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Video URL (Optional)</label>
                  <input
                    type="url"
                    name="video_url"
                    value={sermonForm.video_url}
                    onChange={handleSermonFormChange}
                    placeholder="YouTube or video link"
                  />
                </div>
                <div className="form-group">
                  <label>Audio URL (Optional)</label>
                  <input
                    type="url"
                    name="audio_url"
                    value={sermonForm.audio_url}
                    onChange={handleSermonFormChange}
                    placeholder="Audio recording link"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowSermonModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Sermon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offering Modal */}
      {showOfferingModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>Record New Offering</h3>
              <button className="close-btn" onClick={() => setShowOfferingModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleOfferingSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Member Name *</label>
                  <input
                    type="text"
                    name="member_name"
                    value={offeringForm.member_name}
                    onChange={handleOfferingFormChange}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount (KES) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={offeringForm.amount}
                    onChange={handleOfferingFormChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={offeringForm.email}
                    onChange={handleOfferingFormChange}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={offeringForm.phone}
                    onChange={handleOfferingFormChange}
                    placeholder="+254..."
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Offering Type *</label>
                  <select
                    name="offering_type"
                    value={offeringForm.offering_type}
                    onChange={handleOfferingFormChange}
                    required
                  >
                    <option value="tithe">Tithe</option>
                    <option value="offering">Offering</option>
                    <option value="donation">Donation</option>
                    <option value="special">Special Offering</option>
                    <option value="building_fund">Building Fund</option>
                    <option value="missions">Missions</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    name="payment_method"
                    value={offeringForm.payment_method}
                    onChange={handleOfferingFormChange}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money (M-Pesa)</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={offeringForm.date}
                    onChange={handleOfferingFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    name="reference_number"
                    value={offeringForm.reference_number}
                    onChange={handleOfferingFormChange}
                    placeholder="Transaction ID or Check #"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={offeringForm.notes}
                  onChange={handleOfferingFormChange}
                  rows="2"
                  placeholder="Any additional notes..."
                ></textarea>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_anonymous"
                    checked={offeringForm.is_anonymous}
                    onChange={handleOfferingFormChange}
                  />
                  <span>Record as Anonymous</span>
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowOfferingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Record Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prayer Request Detail Modal */}
      {showPrayerDetailModal && selectedPrayerRequest && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>Prayer Request Details</h3>
              <button className="close-btn" onClick={() => { setShowPrayerDetailModal(false); setSelectedPrayerRequest(null); }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="prayer-detail-content">
              <div className="prayer-detail-header">
                <div className="prayer-meta">
                  <p><strong>From:</strong> {selectedPrayerRequest.is_anonymous ? 'Anonymous' : selectedPrayerRequest.user_name}</p>
                  {!selectedPrayerRequest.is_anonymous && (
                    <p><strong>Email:</strong> {selectedPrayerRequest.user_email}</p>
                  )}
                  <p><strong>Submitted:</strong> {formatDate(selectedPrayerRequest.created_at)}</p>
                </div>
                <div className="prayer-status-badge">
                  <span className={`badge status-${selectedPrayerRequest.status}`}>
                    {selectedPrayerRequest.status}
                  </span>
                </div>
              </div>
              
              <div className="prayer-detail-body">
                <h4>{selectedPrayerRequest.title}</h4>
                <p className="prayer-request-text">{selectedPrayerRequest.request}</p>
              </div>

              <div className="prayer-status-actions">
                <p><strong>Update Status:</strong></p>
                <div className="status-buttons">
                  <button 
                    className={`status-btn pending ${selectedPrayerRequest.status === 'pending' ? 'active' : ''}`}
                    onClick={() => handleUpdatePrayerStatus(selectedPrayerRequest.id, 'pending')}
                  >
                    <i className="fas fa-clock"></i> Pending
                  </button>
                  <button 
                    className={`status-btn praying ${selectedPrayerRequest.status === 'praying' ? 'active' : ''}`}
                    onClick={() => handleUpdatePrayerStatus(selectedPrayerRequest.id, 'praying')}
                  >
                    <i className="fas fa-pray"></i> Praying
                  </button>
                  <button 
                    className={`status-btn answered ${selectedPrayerRequest.status === 'answered' ? 'active' : ''}`}
                    onClick={() => handleUpdatePrayerStatus(selectedPrayerRequest.id, 'answered')}
                  >
                    <i className="fas fa-check-circle"></i> Answered
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="delete-btn"
                  onClick={() => handleDeletePrayerRequest(selectedPrayerRequest.id)}
                >
                  <i className="fas fa-trash"></i> Delete Request
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => { setShowPrayerDetailModal(false); setSelectedPrayerRequest(null); }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
