import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { sermonsService } from '../services/api';
import './Sermons.css';

const Sermons = () => {
  const [sermons, setSermons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayType, setSelectedDayType] = useState('all');
  const [viewMode, setViewMode] = useState('upcoming'); // 'upcoming' or 'all'

  useEffect(() => {
    loadSermons();
  }, [viewMode]);

  const loadSermons = async () => {
    setIsLoading(true);
    try {
      let data;
      if (viewMode === 'upcoming') {
        data = await sermonsService.getUpcoming();
      } else {
        data = await sermonsService.getAll();
      }
      
      if (data.success) {
        setSermons(data.sermons || []);
      }
    } catch (error) {
      console.error('Error loading sermons:', error);
    } finally {
      setIsLoading(false);
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

  const getDayTypeLabel = (dayType) => {
    const labels = {
      'sunday': 'Sunday Service',
      'weekday': 'Weekday Service',
      'wednesday': 'Wednesday Service',
      'friday': 'Friday Service',
      'special': 'Special Service'
    };
    return labels[dayType] || dayType;
  };

  const getDayTypeColor = (dayType) => {
    const colors = {
      'sunday': '#4CAF50',
      'weekday': '#2196F3',
      'wednesday': '#FF9800',
      'friday': '#9C27B0',
      'special': '#E91E63'
    };
    return colors[dayType] || '#666';
  };

  const filteredSermons = selectedDayType === 'all' 
    ? sermons 
    : sermons.filter(sermon => sermon.day_type === selectedDayType);

  const dayTypes = ['all', 'sunday', 'weekday', 'wednesday', 'friday', 'special'];

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Loading sermons...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <h1><i className="fas fa-book"></i> Sermons</h1>
          <p>View upcoming and scheduled sermons</p>
        </header>

        <div className="sermons-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'upcoming' ? 'active' : ''}`}
              onClick={() => setViewMode('upcoming')}
            >
              <i className="fas fa-clock"></i> Upcoming
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              <i className="fas fa-list"></i> All Sermons
            </button>
          </div>

          <div className="sermons-filter">
            <label>Filter by Service:</label>
            <select 
              value={selectedDayType} 
              onChange={(e) => setSelectedDayType(e.target.value)}
            >
              {dayTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Services' : getDayTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredSermons.length === 0 ? (
          <div className="no-sermons">
            <i className="fas fa-book-open"></i>
            <h3>No sermons found</h3>
            <p>{viewMode === 'upcoming' ? 'No upcoming sermons scheduled at this time.' : 'No sermons available.'}</p>
          </div>
        ) : (
          <div className="sermons-grid">
            {filteredSermons.map(sermon => (
              <div key={sermon.id} className="sermon-card">
                <div 
                  className="sermon-day-type" 
                  style={{ backgroundColor: getDayTypeColor(sermon.day_type) }}
                >
                  {getDayTypeLabel(sermon.day_type)}
                </div>
                
                <h3 className="sermon-title">{sermon.title}</h3>
                
                {sermon.series_name && (
                  <div className="sermon-series">
                    <i className="fas fa-layer-group"></i> {sermon.series_name}
                  </div>
                )}
                
                <div className="sermon-preacher">
                  <i className="fas fa-user-tie"></i> {sermon.preacher}
                </div>

                <div className="sermon-details">
                  <p><i className="fas fa-calendar"></i> {formatDate(sermon.date)}</p>
                  <p><i className="fas fa-clock"></i> {formatTime(sermon.time)}</p>
                </div>

                {sermon.scripture_reference && (
                  <div className="sermon-scripture">
                    <i className="fas fa-bible"></i> {sermon.scripture_reference}
                  </div>
                )}

                {sermon.description && (
                  <p className="sermon-description">{sermon.description}</p>
                )}

                <div className="sermon-media">
                  {sermon.video_url && (
                    <a 
                      href={sermon.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="media-btn video-btn"
                    >
                      <i className="fas fa-video"></i> Watch
                    </a>
                  )}
                  {sermon.audio_url && (
                    <a 
                      href={sermon.audio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="media-btn audio-btn"
                    >
                      <i className="fas fa-headphones"></i> Listen
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Sermons;
