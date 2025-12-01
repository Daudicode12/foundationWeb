// Get user info from session/localStorage
const userData = JSON.parse(localStorage.getItem('userData') || '{}');

// Display user name
document.addEventListener('DOMContentLoaded', () => {
    const userNameEl = document.getElementById('userName');
    const currentDateEl = document.getElementById('currentDate');
    
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
        // Clear user data
        localStorage.removeItem('userData');
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
