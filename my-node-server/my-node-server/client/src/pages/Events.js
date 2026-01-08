import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { eventsService } from '../services/api';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [rsvpStatus, setRsvpStatus] = useState({});
  const [rsvpLoading, setRsvpLoading] = useState({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventsService.getAll();
      if (data.success) {
        setEvents(data.events || []);
        // Initialize RSVP status
        const status = {};
        data.events?.forEach(event => {
          status[event.id] = event.userRsvp || false;
        });
        setRsvpStatus(status);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRsvp = async (eventId) => {
    // Prevent multiple clicks
    if (rsvpLoading[eventId]) return;
    
    setRsvpLoading({ ...rsvpLoading, [eventId]: true });
    
    try {
      const isRsvped = rsvpStatus[eventId];
      
      if (isRsvped) {
        const response = await eventsService.cancelRsvp(eventId);
        if (response.success) {
          setRsvpStatus({ ...rsvpStatus, [eventId]: false });
          // Update attendee count locally
          setEvents(events.map(event => 
            event.id === eventId 
              ? { ...event, attendees: Math.max((event.attendees || 1) - 1, 0) }
              : event
          ));
        }
      } else {
        const response = await eventsService.rsvp(eventId);
        if (response.success) {
          setRsvpStatus({ ...rsvpStatus, [eventId]: true });
          // Update attendee count locally
          setEvents(events.map(event => 
            event.id === eventId 
              ? { ...event, attendees: (event.attendees || 0) + 1 }
              : event
          ));
        }
      }
    } catch (error) {
      console.error('RSVP error:', error);
      alert(error.response?.data?.message || 'Failed to process RSVP. Please try again.');
    } finally {
      setRsvpLoading({ ...rsvpLoading, [eventId]: false });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const categories = ['all', ...new Set(events.map(event => event.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div className="loading">Loading events...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <h1><i className="fas fa-calendar-alt"></i> Events</h1>
          <p>Browse and RSVP to upcoming church events</p>
        </header>

        <div className="events-filter">
          <label>Filter by Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-category">{event.category}</div>
                <h3>{event.title}</h3>
                <div className="event-details">
                  <p><i className="fas fa-calendar"></i> {formatDate(event.date)}</p>
                  <p><i className="fas fa-clock"></i> {formatTime(event.time)}</p>
                  <p><i className="fas fa-map-marker-alt"></i> {event.location}</p>
                </div>
                <p className="event-description">{event.description}</p>
                <div className="event-footer">
                  <span className="attendees">
                    <i className="fas fa-users"></i> {event.attendees || 0} attending
                  </span>
                  <button 
                    className={`rsvp-btn ${rsvpStatus[event.id] ? 'rsvped' : ''}`}
                    onClick={() => handleRsvp(event.id)}
                    disabled={rsvpLoading[event.id]}
                  >
                    {rsvpLoading[event.id] 
                      ? 'Processing...' 
                      : (rsvpStatus[event.id] ? 'Cancel RSVP' : 'RSVP')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">
              <i className="fas fa-calendar-times"></i>
              <h3>No Events Found</h3>
              <p>There are no events matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Events;
