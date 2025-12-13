// Get user info from session/localStorage
const userData = JSON.parse(localStorage.getItem('userData') || '{}');

// Session Management Functions
async function verifyMemberSession() {
    const token = localStorage.getItem('memberToken');
    
    // If no token, just redirect without alert (first visit)
    if (!token) {
        console.log('No member token found, redirecting to login');
        window.location.href = '/logins/login.html';
        return false;
    }
    
    try {
        const response = await fetch('/api/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        console.log('Token verification response:', data);
        
        if (!response.ok || !data.valid) {
            console.log('Token invalid, showing session expired');
            handleSessionExpired();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Session verification error:', error);
        // Network error - don't expire session, just log it
        console.log('Network error during verification, allowing access');
        return true;
    }
}

async function refreshMemberToken() {
    const token = localStorage.getItem('memberToken');
    
    if (!token) return;
    
    try {
        const response = await fetch('/api/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (data.success && data.token) {
            localStorage.setItem('memberToken', data.token);
            console.log('Member token refreshed successfully');
        }
    } catch (error) {
        console.error('Token refresh error:', error);
    }
}

function handleSessionExpired() {
    // Clear all session data
    localStorage.removeItem('memberToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    
    // Show session expired message
    alert('Your session has expired. Please log in again.');
    
    // Redirect to login
    window.location.href = '/logins/login.html';
}

// Display user name
document.addEventListener('DOMContentLoaded', async () => {
    const userNameEl = document.getElementById('userName');
    const currentDateEl = document.getElementById('currentDate');
    
    // Verify session first
    const isValid = await verifyMemberSession();
    if (!isValid) return;
    
    // Set user name
    if (userData.userName) {
        userNameEl.textContent = userData.userName;
        
        // Update localStorage with latest data
        localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
    
    // Check if user is logged in
    if (!userData.userName && !userData.email) {
        // Redirect to login if not logged in
        window.location.href = '/logins/login.html';
    }

    // Initialize hamburger menu
    initHamburgerMenu();
    
    // Load upcoming events
    loadUpcomingEvents();
    
    // Set up token refresh interval (every 20 minutes)
    setInterval(refreshMemberToken, 20 * 60 * 1000);
});

// Hamburger Menu functionality
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Toggle menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Close menu when clicking a nav link (mobile only)
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                hamburger.classList.remove('active');
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    });
}

// Load Upcoming Events
async function loadUpcomingEvents() {
    const eventsList = document.getElementById('upcomingEventsList');
    
    try {
        const response = await fetch('/api/events/upcoming');
        const data = await response.json();
        
        console.log('Upcoming events response:', data);
        
        if (data.success && data.events && data.events.length > 0) {
            const totalEvents = data.events.length;
            // Display first 3 upcoming events
            const upcomingEvents = data.events.slice(0, 3);
            
            eventsList.innerHTML = upcomingEvents.map(event => {
                // Combine date and time
                const eventDateTime = new Date(`${event.date}T${event.time}`);
                const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
                const formattedDate = eventDateTime.toLocaleDateString('en-US', dateOptions);
                
                // Format time
                const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
                const eventTime = eventDateTime.toLocaleTimeString('en-US', timeOptions);
                
                return `
                    <div class="event-item">
                        <p class="event-date">${formattedDate}</p>
                        <p class="event-title">${event.title}</p>
                        <p class="event-time">${eventTime}</p>
                        ${event.location ? `<p class="event-location">📍 ${event.location}</p>` : ''}
                    </div>
                `;
            }).join('');
            
            // Add event count and view button if there are more events
            if (totalEvents > 3) {
                eventsList.innerHTML += `
                    <div class="events-summary">
                        <p class="event-count">+${totalEvents - 3} more event${totalEvents - 3 > 1 ? 's' : ''}</p>
                        <button class="view-events-btn" onclick="window.location.href='events.html'">View All Events</button>
                    </div>
                `;
            }
        } else {
            eventsList.innerHTML = '<p class="no-events">No upcoming events at this time.</p>';
        }
    } catch (error) {
        console.error('Error loading upcoming events:', error);
        eventsList.innerHTML = '<p class="error-message">Unable to load events. Please try again later.</p>';
    }
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        // Clear user data and token
        localStorage.removeItem('userData');
        localStorage.removeItem('memberToken');
        sessionStorage.clear();
        
        // Redirect to home or login
        window.location.href = '/logins/login.html';
    }
});

// Navigation functionality (you can expand this)
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Only prevent default for hash links (like #events, #sermons)
        // Allow real page links (like profile.html) to navigate normally
        if (href.startsWith('#')) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // You can add more functionality here to load different sections
            const section = href.substring(1);
            console.log('Navigate to:', section);
            // Future: load different dashboard sections based on the clicked link
        }
        // If href doesn't start with #, let it navigate normally (like profile.html)
    });
});
