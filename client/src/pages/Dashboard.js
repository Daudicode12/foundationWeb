import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { authService, eventsService, prayerRequestService, myOfferingsService, resourceService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showOfferingsModal, setShowOfferingsModal] = useState(false);
  const [showMakeOfferingModal, setShowMakeOfferingModal] = useState(false);
  const [myOfferings, setMyOfferings] = useState([]);
  const [offeringsTotal, setOfferingsTotal] = useState(0);
  const [offeringsSummary, setOfferingsSummary] = useState([]);
  const [offeringForm, setOfferingForm] = useState({
    amount: '',
    offering_type: 'tithe',
    payment_method: 'mobile_money',
    reference_number: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    is_anonymous: false
  });
  const [offeringStatus, setOfferingStatus] = useState({ message: '', isError: false });
  const [prayerForm, setPrayerForm] = useState({ title: '', request: '', isAnonymous: false });
  const [prayerStatus, setPrayerStatus] = useState({ message: '', isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myPrayerRequests, setMyPrayerRequests] = useState([]);
  const [showMyPrayersModal, setShowMyPrayersModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [resources, setResources] = useState([]);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
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

        // Load user's prayer requests
        try {
          const prayerData = await prayerRequestService.getMyRequests(storedUserData.email);
          if (prayerData.success) {
            setMyPrayerRequests(prayerData.prayerRequests || []);
          }
        } catch (error) {
          console.error('Error loading prayer requests:', error);
        }
      }

      // Load resources (public - available to all members)
      try {
        const resourcesData = await resourceService.getAll();
        if (resourcesData.success) {
          setResources(resourcesData.resources || []);
        }
      } catch (error) {
        console.error('Error loading resources:', error);
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

  // Offering handlers
  const handleOfferingInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOfferingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOfferingStatus({ message: '', isError: false });

    try {
      const offeringData = {
        member_name: userData.userName || userData.name || 'Member',
        email: userData.email,
        phone: userData.phone || null,
        amount: parseFloat(offeringForm.amount),
        offering_type: offeringForm.offering_type,
        payment_method: offeringForm.payment_method,
        reference_number: offeringForm.reference_number || null,
        date: offeringForm.date,
        notes: offeringForm.notes || null,
        is_anonymous: offeringForm.is_anonymous
      };

      const response = await myOfferingsService.create(offeringData);
      
      if (response.success) {
        setOfferingStatus({ message: 'Offering recorded successfully! God bless you.', isError: false });
        setOfferingForm({
          amount: '',
          offering_type: 'tithe',
          payment_method: 'mobile_money',
          reference_number: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
          is_anonymous: false
        });
        
        // Refresh offerings data
        if (userData.email) {
          const offeringsData = await myOfferingsService.getMyOfferings(userData.email);
          if (offeringsData.success) {
            setMyOfferings(offeringsData.data || []);
          }
          const totalData = await myOfferingsService.getMyTotal(userData.email);
          if (totalData.success) {
            setOfferingsTotal(totalData.total || 0);
          }
          const summaryData = await myOfferingsService.getMySummary(userData.email);
          if (summaryData.success) {
            setOfferingsSummary(summaryData.data || []);
          }
        }
        
        // Close make offering modal and show history after delay
        setTimeout(() => {
          setShowMakeOfferingModal(false);
          setOfferingStatus({ message: '', isError: false });
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting offering:', error);
      setOfferingStatus({ 
        message: error.response?.data?.message || 'Failed to record offering. Please try again.', 
        isError: true 
      });
    } finally {
      setIsSubmitting(false);
    }
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
        // Refresh the prayer requests list
        const prayerData = await prayerRequestService.getMyRequests(userData.email);
        if (prayerData.success) {
          setMyPrayerRequests(prayerData.prayerRequests || []);
        }
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
      <Sidebar 
        onGivingClick={() => setShowOfferingsModal(true)}
        onPrayerClick={() => { setSelectedPrayer(null); setShowMyPrayersModal(true); }}
        onResourcesClick={() => { setSelectedResource(null); setShowResourcesModal(true); }}
      />
      
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

          <div className="card prayer-card">
            <h3><i className="fas fa-praying-hands"></i> Prayer Requests</h3>
            <div className="prayer-summary">
              <span className="prayer-count">
                <i className="fas fa-list"></i> {myPrayerRequests.length} Request{myPrayerRequests.length !== 1 ? 's' : ''}
              </span>
              {myPrayerRequests.length > 0 && (
                <div className="prayer-status-summary">
                  <span className="status-count pending">
                    <i className="fas fa-clock"></i> {myPrayerRequests.filter(p => p.status === 'pending').length}
                  </span>
                  <span className="status-count praying">
                    <i className="fas fa-pray"></i> {myPrayerRequests.filter(p => p.status === 'praying').length}
                  </span>
                  <span className="status-count answered">
                    <i className="fas fa-check-circle"></i> {myPrayerRequests.filter(p => p.status === 'answered').length}
                  </span>
                </div>
              )}
            </div>
            {myPrayerRequests.length > 0 && (
              <div className="recent-prayers">
                {myPrayerRequests.slice(0, 3).map(prayer => (
                  <div 
                    key={prayer.id} 
                    className="prayer-item"
                    onClick={() => { setSelectedPrayer(prayer); setShowMyPrayersModal(true); }}
                  >
                    <span className="prayer-title">{prayer.title}</span>
                    <span className={`prayer-status status-${prayer.status}`}>{prayer.status}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="prayer-actions">
              <button className="btn-primary" onClick={() => setShowPrayerModal(true)}>
                <i className="fas fa-plus"></i> New Request
              </button>
              {myPrayerRequests.length > 0 && (
                <button className="btn-secondary" onClick={() => { setSelectedPrayer(null); setShowMyPrayersModal(true); }}>
                  View All
                </button>
              )}
            </div>
          </div>

          <div className="card giving-card" onClick={() => setShowOfferingsModal(true)}>
            <h3><i className="fas fa-hand-holding-heart"></i> My Giving</h3>
            <div className="giving-summary">
              <div className="giving-total-box">
                <span className="total-label">Total Giving</span>
                <span className="total-amount">{formatCurrency(offeringsTotal)}</span>
              </div>
              <p className="giving-count">{myOfferings.length} contribution{myOfferings.length !== 1 ? 's' : ''} recorded</p>
            </div>
            {myOfferings.length > 0 && (
              <div className="recent-offerings">
                {myOfferings.slice(0, 3).map(offering => (
                  <div key={offering.id} className="offering-item">
                    <span className="offering-type">{offering.offering_type}</span>
                    <span className="offering-amount">{formatCurrency(offering.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="giving-footer">
              <span className="view-link"><i className="fas fa-eye"></i> Click to view all offerings</span>
            </div>
          </div>

          <div className="card resources-card" onClick={() => { setSelectedResource(null); setShowResourcesModal(true); }}>
            <h3><i className="fas fa-book-open"></i> Church Resources</h3>
            <div className="resources-summary">
              <p className="resources-count">{resources.length} resource{resources.length !== 1 ? 's' : ''} available</p>
              {resources.length > 0 && (
                <div className="resources-type-summary">
                  <span className="type-count bible">
                    <i className="fas fa-bible"></i> {resources.filter(r => r.category === 'bible_verse').length}
                  </span>
                  <span className="type-count teaching">
                    <i className="fas fa-chalkboard-teacher"></i> {resources.filter(r => r.category === 'teaching').length}
                  </span>
                  <span className="type-count devotional">
                    <i className="fas fa-pray"></i> {resources.filter(r => r.category === 'devotional').length}
                  </span>
                </div>
              )}
            </div>
            {resources.filter(r => r.is_featured).length > 0 && (
              <div className="featured-resources">
                <span className="featured-label"><i className="fas fa-star"></i> Featured</span>
                {resources.filter(r => r.is_featured).slice(0, 2).map(resource => (
                  <div 
                    key={resource.id} 
                    className="featured-item"
                    onClick={(e) => { e.stopPropagation(); setSelectedResource(resource); setShowResourcesModal(true); }}
                  >
                    <span className="resource-title">{resource.title}</span>
                    {resource.scripture_reference && (
                      <span className="resource-scripture">{resource.scripture_reference}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="resources-footer">
              <span className="view-link"><i className="fas fa-eye"></i> Click to browse all resources</span>
            </div>
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

      {/* My Offerings Modal */}
      {showOfferingsModal && (
        <div className="modal-overlay" onClick={() => setShowOfferingsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowOfferingsModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header-with-action">
              <div>
                <h2><i className="fas fa-hand-holding-heart"></i> My Giving</h2>
                <p className="modal-subtitle">View your giving records and make new offerings</p>
              </div>
              <button 
                className="btn-make-offering" 
                onClick={() => { setShowOfferingsModal(false); setShowMakeOfferingModal(true); }}
              >
                <i className="fas fa-plus"></i> Make Offering
              </button>
            </div>
            
            {/* Summary Cards */}
            <div className="offerings-summary-grid">
              <div className="summary-item total">
                <span className="summary-label">Total Giving</span>
                <span className="summary-value">{formatCurrency(offeringsTotal)}</span>
              </div>
              {offeringsSummary.map((item, index) => (
                <div key={index} className="summary-item">
                  <span className="summary-label">{item.offering_type}</span>
                  <span className="summary-value">{formatCurrency(item.total)}</span>
                  <span className="summary-count">{item.count} record{item.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>

            {/* Offerings List */}
            <div className="offerings-list">
              <h4>Recent Offerings</h4>
              {myOfferings.length > 0 ? (
                <table className="offerings-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOfferings.map(offering => (
                      <tr key={offering.id}>
                        <td>{formatDate(offering.date)}</td>
                        <td><span className={`badge ${offering.offering_type}`}>{offering.offering_type}</span></td>
                        <td className="amount">{formatCurrency(offering.amount)}</td>
                        <td>{offering.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-offerings">No offering records found for your account.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Make Offering Modal */}
      {showMakeOfferingModal && (
        <div className="modal-overlay" onClick={() => setShowMakeOfferingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMakeOfferingModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2><i className="fas fa-donate"></i> Make an Offering</h2>
            <p className="modal-subtitle">Record your giving to the Lord</p>
            
            <form onSubmit={handleOfferingSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount">Amount (KES) *</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={offeringForm.amount}
                    onChange={handleOfferingInputChange}
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="offering_type">Offering Type *</label>
                  <select
                    id="offering_type"
                    name="offering_type"
                    value={offeringForm.offering_type}
                    onChange={handleOfferingInputChange}
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="payment_method">Payment Method *</label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    value={offeringForm.payment_method}
                    onChange={handleOfferingInputChange}
                    required
                  >
                    <option value="mobile_money">Mobile Money (M-Pesa)</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="check">Check</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={offeringForm.date}
                    onChange={handleOfferingInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reference_number">Reference/Transaction Number</label>
                <input
                  type="text"
                  id="reference_number"
                  name="reference_number"
                  value={offeringForm.reference_number}
                  onChange={handleOfferingInputChange}
                  placeholder="e.g., M-Pesa code, Bank reference"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={offeringForm.notes}
                  onChange={handleOfferingInputChange}
                  placeholder="Any additional notes..."
                  rows="2"
                ></textarea>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_anonymous"
                    checked={offeringForm.is_anonymous}
                    onChange={handleOfferingInputChange}
                  />
                  <span>Give anonymously (your name won't be displayed)</span>
                </label>
              </div>
              
              <button type="submit" className="btn-primary btn-full" disabled={isSubmitting}>
                {isSubmitting ? 'Recording...' : 'Record Offering'}
              </button>
            </form>
            
            {offeringStatus.message && (
              <div className={`status-message ${offeringStatus.isError ? 'error' : 'success'}`}>
                {offeringStatus.message}
              </div>
            )}

            <div className="offering-scripture">
              <i className="fas fa-quote-left"></i>
              <p>"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."</p>
              <span>- 2 Corinthians 9:7</span>
            </div>
          </div>
        </div>
      )}

      {/* My Prayer Requests Modal */}
      {showMyPrayersModal && (
        <div className="modal-overlay" onClick={() => { setShowMyPrayersModal(false); setSelectedPrayer(null); }}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowMyPrayersModal(false); setSelectedPrayer(null); }}>
              <i className="fas fa-times"></i>
            </button>
            
            {selectedPrayer ? (
              // Show single prayer request details
              <>
                <h2><i className="fas fa-praying-hands"></i> Prayer Request Details</h2>
                <div className="prayer-detail-view">
                  <div className="prayer-detail-header">
                    <h3>{selectedPrayer.title}</h3>
                    <span className={`prayer-status-badge status-${selectedPrayer.status}`}>
                      {selectedPrayer.status === 'pending' && <><i className="fas fa-clock"></i> Pending</>}
                      {selectedPrayer.status === 'praying' && <><i className="fas fa-pray"></i> Being Prayed For</>}
                      {selectedPrayer.status === 'answered' && <><i className="fas fa-check-circle"></i> Answered</>}
                    </span>
                  </div>
                  <p className="prayer-date">
                    <i className="fas fa-calendar"></i> Submitted on {formatDate(selectedPrayer.created_at)}
                  </p>
                  <div className="prayer-content">
                    <p>{selectedPrayer.request}</p>
                  </div>
                  {selectedPrayer.is_anonymous && (
                    <p className="anonymous-note">
                      <i className="fas fa-user-secret"></i> This request was submitted anonymously
                    </p>
                  )}
                  <div className="prayer-status-info">
                    <h4>Status Information</h4>
                    {selectedPrayer.status === 'pending' && (
                      <p className="status-description">Your prayer request has been received and is awaiting review by our prayer team.</p>
                    )}
                    {selectedPrayer.status === 'praying' && (
                      <p className="status-description">Our prayer team is actively praying for your request. Stay strong in faith!</p>
                    )}
                    {selectedPrayer.status === 'answered' && (
                      <p className="status-description">Praise God! This prayer has been marked as answered. Glory to His name!</p>
                    )}
                  </div>
                  <button className="btn-secondary btn-full" onClick={() => setSelectedPrayer(null)}>
                    <i className="fas fa-arrow-left"></i> Back to All Requests
                  </button>
                </div>
              </>
            ) : (
              // Show all prayer requests list
              <>
                <h2><i className="fas fa-praying-hands"></i> My Prayer Requests</h2>
                <p className="modal-subtitle">Track the status of your prayer requests</p>
                
                {/* Status Summary */}
                <div className="prayers-status-grid">
                  <div className="status-card total">
                    <span className="status-number">{myPrayerRequests.length}</span>
                    <span className="status-label">Total Requests</span>
                  </div>
                  <div className="status-card pending">
                    <span className="status-number">{myPrayerRequests.filter(p => p.status === 'pending').length}</span>
                    <span className="status-label">Pending</span>
                  </div>
                  <div className="status-card praying">
                    <span className="status-number">{myPrayerRequests.filter(p => p.status === 'praying').length}</span>
                    <span className="status-label">Being Prayed For</span>
                  </div>
                  <div className="status-card answered">
                    <span className="status-number">{myPrayerRequests.filter(p => p.status === 'answered').length}</span>
                    <span className="status-label">Answered</span>
                  </div>
                </div>

                {/* Prayer Requests List */}
                <div className="prayers-list">
                  <h4>All Prayer Requests</h4>
                  {myPrayerRequests.length > 0 ? (
                    <div className="prayer-requests-container">
                      {myPrayerRequests.map(prayer => (
                        <div 
                          key={prayer.id} 
                          className={`prayer-request-card status-${prayer.status}`}
                          onClick={() => setSelectedPrayer(prayer)}
                        >
                          <div className="prayer-card-header">
                            <h5>{prayer.title}</h5>
                            <span className={`status-badge status-${prayer.status}`}>
                              {prayer.status}
                            </span>
                          </div>
                          <p className="prayer-excerpt">
                            {prayer.request.length > 100 ? `${prayer.request.substring(0, 100)}...` : prayer.request}
                          </p>
                          <div className="prayer-card-footer">
                            <span className="prayer-date-small">
                              <i className="fas fa-calendar-alt"></i> {formatDate(prayer.created_at)}
                            </span>
                            {prayer.is_anonymous && (
                              <span className="anonymous-badge">
                                <i className="fas fa-user-secret"></i> Anonymous
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-prayers">
                      <i className="fas fa-inbox"></i>
                      <p>You haven't submitted any prayer requests yet.</p>
                      <button className="btn-primary" onClick={() => { setShowMyPrayersModal(false); setShowPrayerModal(true); }}>
                        Submit Your First Request
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Resources Modal */}
      {showResourcesModal && (
        <div className="modal-overlay" onClick={() => { setShowResourcesModal(false); setSelectedResource(null); }}>
          <div className="resources-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowResourcesModal(false); setSelectedResource(null); }}>
              <i className="fas fa-times"></i>
            </button>
            
            {selectedResource ? (
              // Single Resource Detail View
              <div className="resource-detail-view">
                <button className="back-to-list" onClick={() => setSelectedResource(null)}>
                  <i className="fas fa-arrow-left"></i> Back to Resources
                </button>
                
                <div className="resource-detail-header">
                  <span className={`category-tag ${selectedResource.category}`}>
                    {selectedResource.category === 'bible_verse' && <><i className="fas fa-bible"></i> Bible Verse</>}
                    {selectedResource.category === 'teaching' && <><i className="fas fa-chalkboard-teacher"></i> Teaching</>}
                    {selectedResource.category === 'devotional' && <><i className="fas fa-pray"></i> Devotional</>}
                    {selectedResource.category === 'sermon_notes' && <><i className="fas fa-scroll"></i> Sermon Notes</>}
                    {selectedResource.category === 'testimony' && <><i className="fas fa-heart"></i> Testimony</>}
                    {selectedResource.category === 'announcement' && <><i className="fas fa-bullhorn"></i> Announcement</>}
                  </span>
                  {selectedResource.is_featured && (
                    <span className="featured-badge"><i className="fas fa-star"></i> Featured</span>
                  )}
                </div>

                <h2 className="resource-detail-title">{selectedResource.title}</h2>
                
                {selectedResource.scripture_reference && (
                  <div className="resource-scripture-box">
                    <i className="fas fa-bookmark"></i>
                    <span>{selectedResource.scripture_reference}</span>
                  </div>
                )}

                <div className="resource-content-box">
                  <p>{selectedResource.content}</p>
                </div>

                <div className="resource-meta">
                  {selectedResource.author && (
                    <span className="meta-item">
                      <i className="fas fa-user"></i> {selectedResource.author}
                    </span>
                  )}
                  {selectedResource.date_shared && (
                    <span className="meta-item">
                      <i className="fas fa-calendar-alt"></i> {formatDate(selectedResource.date_shared)}
                    </span>
                  )}
                </div>

                {selectedResource.tags && (
                  <div className="resource-tags">
                    {selectedResource.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="resource-tag">{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Resources List View
              <>
                <h2><i className="fas fa-book-open"></i> Church Resources</h2>
                <p className="modal-subtitle">Browse Bible verses, teachings, and devotionals shared by our church</p>

                {resources.length > 0 ? (
                  <div className="resources-list">
                    {/* Featured Resources Section */}
                    {resources.filter(r => r.is_featured).length > 0 && (
                      <div className="featured-section">
                        <h4><i className="fas fa-star"></i> Featured Resources</h4>
                        <div className="resources-grid">
                          {resources.filter(r => r.is_featured).map(resource => (
                            <div 
                              key={resource.id} 
                              className={`resource-card ${resource.category}`}
                              onClick={() => setSelectedResource(resource)}
                            >
                              <div className="resource-card-header">
                                <span className={`category-icon ${resource.category}`}>
                                  {resource.category === 'bible_verse' && <i className="fas fa-bible"></i>}
                                  {resource.category === 'teaching' && <i className="fas fa-chalkboard-teacher"></i>}
                                  {resource.category === 'devotional' && <i className="fas fa-pray"></i>}
                                  {resource.category === 'sermon_notes' && <i className="fas fa-scroll"></i>}
                                  {resource.category === 'testimony' && <i className="fas fa-heart"></i>}
                                  {resource.category === 'announcement' && <i className="fas fa-bullhorn"></i>}
                                </span>
                                <span className="featured-star"><i className="fas fa-star"></i></span>
                              </div>
                              <h5 className="resource-card-title">{resource.title}</h5>
                              {resource.scripture_reference && (
                                <span className="resource-ref">{resource.scripture_reference}</span>
                              )}
                              <p className="resource-preview">
                                {resource.content.length > 80 ? `${resource.content.substring(0, 80)}...` : resource.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Resources Section */}
                    <div className="all-resources-section">
                      <h4><i className="fas fa-list"></i> All Resources</h4>
                      <div className="resources-grid">
                        {resources.filter(r => !r.is_featured).map(resource => (
                          <div 
                            key={resource.id} 
                            className={`resource-card ${resource.category}`}
                            onClick={() => setSelectedResource(resource)}
                          >
                            <div className="resource-card-header">
                              <span className={`category-icon ${resource.category}`}>
                                {resource.category === 'bible_verse' && <i className="fas fa-bible"></i>}
                                {resource.category === 'teaching' && <i className="fas fa-chalkboard-teacher"></i>}
                                {resource.category === 'devotional' && <i className="fas fa-pray"></i>}
                                {resource.category === 'sermon_notes' && <i className="fas fa-scroll"></i>}
                                {resource.category === 'testimony' && <i className="fas fa-heart"></i>}
                                {resource.category === 'announcement' && <i className="fas fa-bullhorn"></i>}
                              </span>
                            </div>
                            <h5 className="resource-card-title">{resource.title}</h5>
                            {resource.scripture_reference && (
                              <span className="resource-ref">{resource.scripture_reference}</span>
                            )}
                            <p className="resource-preview">
                              {resource.content.length > 80 ? `${resource.content.substring(0, 80)}...` : resource.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-resources">
                    <i className="fas fa-book"></i>
                    <p>No resources available yet.</p>
                    <p className="no-resources-sub">Check back soon for Bible verses, teachings, and devotionals!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
