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
