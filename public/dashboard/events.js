// Check if user is logged in
const userData = JSON.parse(localStorage.getItem('userData'));
if (!userData || !userData.email) {
    window.location.href = '/logins/login.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initHamburgerMenu();
    initTabs();
    loadEvents();
    loadAnnouncements();
    setupEventListeners();
});

// Hamburger Menu
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        hamburger.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        hamburger.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Close sidebar when clicking links on mobile
    const navLinks = sidebar.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                hamburger.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    });
}

// Tabs Functionality
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // Load data if needed
            if (targetTab === 'past') {
                loadPastEvents();
            }
        });
    });
}

// Load Events
async function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    
    try {
        const response = await fetch('http://localhost:8000/api/events/upcoming');
        const events = await response.json();
        
        if (events.length === 0) {
            eventsGrid.innerHTML = `
                <div class="no-events">
                    <h3>No Upcoming Events</h3>
                    <p>Check back soon for new events!</p>
                </div>
            `;
            return;
        }
        
        eventsGrid.innerHTML = events.map(event => createEventCard(event)).join('');
        
        // Add click listeners to cards
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('rsvp-btn')) {
                    const eventId = card.getAttribute('data-event-id');
                    showEventDetails(eventId);
                }
            });
        });
        
        // Add RSVP listeners
        document.querySelectorAll('.rsvp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = btn.getAttribute('data-event-id');
                handleRSVP(eventId, btn);
            });
        });
        
    } catch (error) {
        console.error('Error loading events:', error);
        eventsGrid.innerHTML = `
            <div class="no-events">
                <h3>Unable to load events</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// Load Past Events
async function loadPastEvents() {
    const pastEventsGrid = document.getElementById('pastEventsGrid');
    
    if (pastEventsGrid.querySelector('.event-card')) {
        return; // Already loaded
    }
    
    try {
        const response = await fetch('http://localhost:8000/api/events/past');
        const events = await response.json();
        
        if (events.length === 0) {
            pastEventsGrid.innerHTML = `
                <div class="no-events">
                    <h3>No Past Events</h3>
                    <p>Past events will appear here.</p>
                </div>
            `;
            return;
        }
        
        pastEventsGrid.innerHTML = events.map(event => createEventCard(event, true)).join('');
        
    } catch (error) {
        console.error('Error loading past events:', error);
        pastEventsGrid.innerHTML = `
            <div class="no-events">
                <h3>Unable to load past events</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// Create Event Card HTML
function createEventCard(event, isPast = false) {
    const userRSVP = checkUserRSVP(event.id);
    const rsvpText = userRSVP ? 'Registered ✓' : 'RSVP';
    const rsvpClass = userRSVP ? 'registered' : '';
    
    return `
        <div class="event-card" data-event-id="${event.id}">
            <img src="${event.image || 'https://via.placeholder.com/400x200?text=Church+Event'}" 
                 alt="${event.title}" 
                 class="event-image">
            <div class="event-content">
                <span class="event-category">${event.category}</span>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-date">${formatDate(event.date)}</div>
                <div class="event-time">${event.time}</div>
                <div class="event-location">${event.location}</div>
                <p class="event-description">${truncateText(event.description, 100)}</p>
                ${!isPast ? `
                    <div class="event-footer">
                        <span class="attendees-count">${event.attendees || 0} attending</span>
                        <button class="rsvp-btn ${rsvpClass}" data-event-id="${event.id}">
                            ${rsvpText}
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Load Announcements
async function loadAnnouncements() {
    const announcementsList = document.getElementById('announcementsList');
    
    try {
        const response = await fetch('http://localhost:8000/api/announcements');
        const announcements = await response.json();
        
        if (announcements.length === 0) {
            announcementsList.innerHTML = `
                <div class="no-events">
                    <h3>No Announcements</h3>
                    <p>Check back soon for updates!</p>
                </div>
            `;
            return;
        }
        
        announcementsList.innerHTML = announcements.map(announcement => createAnnouncementCard(announcement)).join('');
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        announcementsList.innerHTML = `
            <div class="no-events">
                <h3>Unable to load announcements</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// Create Announcement Card HTML
function createAnnouncementCard(announcement) {
    return `
        <div class="announcement-card">
            <div class="announcement-header">
                <div>
                    <h3 class="announcement-title">${announcement.title}</h3>
                    <div class="announcement-date">${formatDate(announcement.date)}</div>
                </div>
                <span class="announcement-badge ${announcement.priority}">${announcement.priority}</span>
            </div>
            <div class="announcement-content">${announcement.content}</div>
            <div class="announcement-footer">
                <span class="announcement-author">Posted by ${announcement.author}</span>
            </div>
        </div>
    `;
}

// Show Event Details Modal
async function showEventDetails(eventId) {
    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');
    
    try {
        const response = await fetch(`http://localhost:8000/api/events/${eventId}`);
        const event = await response.json();
        
        const userRSVP = checkUserRSVP(eventId);
        const rsvpText = userRSVP ? 'You are registered ✓' : 'RSVP for this event';
        const rsvpClass = userRSVP ? 'registered' : '';
        
        modalBody.innerHTML = `
            <h2 class="modal-event-title">${event.title}</h2>
            <div class="modal-event-details">
                <div class="event-category">${event.category}</div>
                <div class="event-date">${formatDate(event.date)}</div>
                <div class="event-time">${event.time}</div>
                <div class="event-location">${event.location}</div>
            </div>
            <div class="modal-event-description">${event.description}</div>
            ${event.additionalInfo ? `<div class="modal-event-description">${event.additionalInfo}</div>` : ''}
            <div class="modal-rsvp-section">
                <button class="modal-rsvp-btn ${rsvpClass}" data-event-id="${event.id}">
                    ${rsvpText}
                </button>
            </div>
        `;
        
        // Add RSVP listener
        modalBody.querySelector('.modal-rsvp-btn').addEventListener('click', (e) => {
            handleRSVP(event.id, e.target);
        });
        
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading event details:', error);
        alert('Unable to load event details. Please try again.');
    }
}

// Handle RSVP
async function handleRSVP(eventId, button) {
    const userRSVP = checkUserRSVP(eventId);
    
    if (userRSVP) {
        // Cancel RSVP
        if (confirm('Do you want to cancel your registration?')) {
            try {
                const response = await fetch('http://localhost:8000/api/events/rsvp', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        eventId: eventId,
                        email: userData.email
                    })
                });
                
                if (response.ok) {
                    removeUserRSVP(eventId);
                    button.classList.remove('registered');
                    button.textContent = 'RSVP';
                    alert('Registration cancelled successfully!');
                    loadEvents(); // Refresh to update attendee count
                }
            } catch (error) {
                console.error('Error cancelling RSVP:', error);
                alert('Unable to cancel registration. Please try again.');
            }
        }
    } else {
        // Register for event
        try {
            const response = await fetch('http://localhost:8000/api/events/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventId: eventId,
                    email: userData.email,
                    userName: userData.userName
                })
            });
            
            if (response.ok) {
                saveUserRSVP(eventId);
                button.classList.add('registered');
                button.textContent = 'Registered ✓';
                alert('Successfully registered for the event!');
                loadEvents(); // Refresh to update attendee count
            }
        } catch (error) {
            console.error('Error registering for event:', error);
            alert('Unable to register. Please try again.');
        }
    }
}

// Check if user has RSVP'd
function checkUserRSVP(eventId) {
    const rsvps = JSON.parse(localStorage.getItem('userRSVPs') || '[]');
    return rsvps.includes(eventId.toString());
}

// Save user RSVP
function saveUserRSVP(eventId) {
    const rsvps = JSON.parse(localStorage.getItem('userRSVPs') || '[]');
    if (!rsvps.includes(eventId.toString())) {
        rsvps.push(eventId.toString());
        localStorage.setItem('userRSVPs', JSON.stringify(rsvps));
    }
}

// Remove user RSVP
function removeUserRSVP(eventId) {
    let rsvps = JSON.parse(localStorage.getItem('userRSVPs') || '[]');
    rsvps = rsvps.filter(id => id !== eventId.toString());
    localStorage.setItem('userRSVPs', JSON.stringify(rsvps));
}

// Setup Event Listeners
function setupEventListeners() {
    // Category filter
    const categoryFilter = document.getElementById('eventCategory');
    categoryFilter.addEventListener('change', (e) => {
        filterEvents(e.target.value);
    });
    
    // Modal close
    const modal = document.getElementById('eventModal');
    const closeBtn = document.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userData');
        window.location.href = '/logins/login.html';
    });
}

// Filter Events by Category
function filterEvents(category) {
    const eventCards = document.querySelectorAll('#eventsGrid .event-card');
    
    eventCards.forEach(card => {
        const eventCategory = card.querySelector('.event-category').textContent.toLowerCase();
        
        if (category === 'all' || eventCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
