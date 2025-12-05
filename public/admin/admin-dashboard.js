// Check if admin is logged in with valid token
const adminToken = localStorage.getItem('adminToken');
const adminData = JSON.parse(localStorage.getItem('adminData'));

if (!adminToken || !adminData || !adminData.email) {
    window.location.href = '/admin/admin-login.html';
}

// Verify token on page load
async function verifyAdminSession() {
    try {
        const response = await fetch('http://localhost:8000/api/verify-token', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();
        
        if (!data.success || data.user.role !== 'admin') {
            handleSessionExpired();
        }
    } catch (error) {
        console.error('Session verification failed:', error);
        handleSessionExpired();
    }
}

// Handle expired session
function handleSessionExpired() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    alert('Your session has expired. Please log in again.');
    window.location.href = '/admin/admin-login.html';
}

// Refresh token periodically (every 20 minutes)
setInterval(async () => {
    try {
        const response = await fetch('http://localhost:8000/api/refresh-token', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await response.json();
        
        if (data.success && data.token) {
            localStorage.setItem('adminToken', data.token);
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
    }
}, 20 * 60 * 1000);

// Display admin name
document.getElementById('adminName').textContent = adminData.userName || 'Admin';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    verifyAdminSession();
    initHamburgerMenu();
    loadDashboardStats();
    setupNavigation();
    setupModals();
    loadAllEvents();
    loadAllAnnouncements();
});

// Hamburger Menu
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    
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
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            
            if (href.startsWith('#')) {
                const sectionName = href.substring(1);
                showSection(sectionName);
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu
                if (window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.remove('active');
                    document.getElementById('hamburgerMenu').classList.remove('active');
                    document.querySelector('.sidebar-overlay').classList.remove('active');
                }
            }
        });
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        window.location.href = '/admin/admin-login.html';
    });
}

// Show Section
function showSection(sectionName, shouldAddNew = false) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load data based on section
        if (sectionName === 'manage-events') {
            loadAllEvents();
            if (shouldAddNew) {
                openEventModal();
            }
        } else if (sectionName === 'manage-announcements') {
            loadAllAnnouncements();
            if (shouldAddNew) {
                openAnnouncementModal();
            }
        } else if (sectionName === 'view-members') {
            loadMembers();
        } else if (sectionName === 'view-rsvps') {
            loadRSVPs();
            loadEventsForFilter();
        }
    } else {
        document.getElementById('dashboard-section').classList.add('active');
    }
}

// Load Dashboard Stats
async function loadDashboardStats() {
    try {
        const adminEmail = encodeURIComponent(adminData.email);
        const [eventsRes, announcementsRes, membersRes, rsvpsRes] = await Promise.all([
            fetch(`http://localhost:8000/api/admin/events/count?adminEmail=${adminEmail}`),
            fetch(`http://localhost:8000/api/admin/announcements/count?adminEmail=${adminEmail}`),
            fetch(`http://localhost:8000/api/admin/members/count?adminEmail=${adminEmail}`),
            fetch(`http://localhost:8000/api/admin/rsvps/count?adminEmail=${adminEmail}`)
        ]);
        
        const eventsData = await eventsRes.json();
        const announcementsData = await announcementsRes.json();
        const membersData = await membersRes.json();
        const rsvpsData = await rsvpsRes.json();
        
        document.getElementById('totalEvents').textContent = eventsData.count || 0;
        document.getElementById('totalAnnouncements').textContent = announcementsData.count || 0;
        document.getElementById('totalMembers').textContent = membersData.count || 0;
        document.getElementById('totalRSVPs').textContent = rsvpsData.count || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load All Events
async function loadAllEvents() {
    const tableBody = document.getElementById('eventsTableBody');
    
    try {
        const response = await fetch(`http://localhost:8000/api/admin/events?adminEmail=${encodeURIComponent(adminData.email)}`);
        const result = await response.json();
        const events = result.data || result; // Handle both response formats
        
        if (events.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="loading">No events found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = events.map(event => `
            <tr>
                <td>${event.title}</td>
                <td><span class="category-badge category-${event.category}">${formatCategory(event.category)}</span></td>
                <td>${formatDate(event.date)}</td>
                <td>${event.time}</td>
                <td>${event.location}</td>
                <td>${event.attendees || 0}</td>
                <td>
                    <div class="table-actions">
                        <button class="edit-btn" onclick="editEvent(${event.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteEvent(${event.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="loading">Error loading events</td></tr>';
    }
}

// Load All Announcements
async function loadAllAnnouncements() {
    const tableBody = document.getElementById('announcementsTableBody');
    
    try {
        const response = await fetch(`http://localhost:8000/api/admin/announcements?adminEmail=${encodeURIComponent(adminData.email)}`);
        const result = await response.json();
        const announcements = result.data || result; // Handle both response formats
        
        if (announcements.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="loading">No announcements found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = announcements.map(announcement => `
            <tr>
                <td>${announcement.title}</td>
                <td><span class="priority-badge priority-${announcement.priority}">${announcement.priority}</span></td>
                <td>${announcement.author}</td>
                <td>${formatDate(announcement.date)}</td>
                <td>
                    <div class="table-actions">
                        <button class="edit-btn" onclick="editAnnouncement(${announcement.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteAnnouncement(${announcement.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading announcements:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="loading">Error loading announcements</td></tr>';
    }
}

// Load Members
async function loadMembers() {
    const tableBody = document.getElementById('membersTableBody');
    const memberCountEl = document.getElementById('memberCount');
    
    try {
        const response = await fetch(`/api/admin/members?adminEmail=${encodeURIComponent(adminData.email)}`);
        const result = await response.json();
        
        console.log('Members response:', result);
        
        if (!result.success) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading">Error: ' + (result.message || 'Failed to load members') + '</td></tr>';
            if (memberCountEl) memberCountEl.textContent = '0';
            return;
        }
        
        const members = result.data || [];
        
        if (members.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading">No registered members found</td></tr>';
            if (memberCountEl) memberCountEl.textContent = '0';
            return;
        }
        
        // Update member count
        if (memberCountEl) memberCountEl.textContent = members.length;
        
        // Display members in table
        tableBody.innerHTML = members.map(member => `
            <tr>
                <td><strong>${member.name || 'N/A'}</strong></td>
                <td>${member.email}</td>
                <td>${member.phone || 'N/A'}</td>
                <td>${member.created_at ? formatDate(member.created_at) : 'N/A'}</td>
                <td><span class="role-badge ${member.role === 'admin' ? 'role-admin' : 'role-member'}">${member.role || 'member'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="edit-btn" onclick="editMember('${member.email}')">Edit</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading members:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="loading">Error loading members</td></tr>';
        if (memberCountEl) memberCountEl.textContent = '0';
    }
}

// Load RSVPs
async function loadRSVPs() {
    const tableBody = document.getElementById('rsvpsTableBody');
    
    try {
        const response = await fetch(`http://localhost:8000/api/admin/rsvps?adminEmail=${encodeURIComponent(adminData.email)}`);
        const result = await response.json();
        const rsvps = result.data || result; // Handle both response formats
        
        if (!rsvps || rsvps.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="loading">No RSVPs found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = rsvps.map(rsvp => `
            <tr data-event-id="${rsvp.eventId}">
                <td>${rsvp.eventTitle || 'Unknown Event'}</td>
                <td>${rsvp.userName || 'N/A'}</td>
                <td>${rsvp.email}</td>
                <td>${formatDateTime(rsvp.rsvp_date)}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading RSVPs:', error);
        tableBody.innerHTML = '<tr><td colspan="4" class="loading">Error loading RSVPs</td></tr>';
    }
}

// Load Events for Filter
async function loadEventsForFilter() {
    try {
        const response = await fetch(`http://localhost:8000/api/admin/events?adminEmail=${encodeURIComponent(adminData.email)}`);
        const result = await response.json();
        const events = result.data || result; // Handle both response formats
        
        const select = document.getElementById('eventFilter');
        select.innerHTML = '<option value="all">All Events</option>' +
            events.map(event => `<option value="${event.id}">${event.title}</option>`).join('');
        
        select.addEventListener('change', (e) => {
            const eventId = e.target.value;
            const rows = document.querySelectorAll('#rsvpsTableBody tr');
            
            rows.forEach(row => {
                if (eventId === 'all' || row.getAttribute('data-event-id') === eventId) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    } catch (error) {
        console.error('Error loading events for filter:', error);
    }
}

// Setup Modals
function setupModals() {
    // Event modal
    document.getElementById('addEventBtn').addEventListener('click', openEventModal);
    document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);
    
    // Announcement modal
    document.getElementById('addAnnouncementBtn').addEventListener('click', openAnnouncementModal);
    document.getElementById('announcementForm').addEventListener('submit', handleAnnouncementSubmit);
    
    // Member modal
    document.getElementById('memberForm').addEventListener('submit', handleMemberSubmit);
    
    // Close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Event Modal Functions
function openEventModal(eventData = null) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const title = document.getElementById('eventModalTitle');
    
    if (eventData) {
        title.textContent = 'Edit Event';
        document.getElementById('eventId').value = eventData.id;
        document.getElementById('eventTitle').value = eventData.title;
        document.getElementById('eventCategory').value = eventData.category;
        // Format date properly for input field
        const dateValue = eventData.date ? eventData.date.split('T')[0] : '';
        document.getElementById('eventDate').value = dateValue;
        document.getElementById('eventTime').value = eventData.time;
        document.getElementById('eventLocation').value = eventData.location;
        document.getElementById('eventDescription').value = eventData.description;
        document.getElementById('eventAdditionalInfo').value = eventData.additionalInfo || '';
        document.getElementById('eventImage').value = eventData.image || '';
    } else {
        title.textContent = 'Add New Event';
        form.reset();
        document.getElementById('eventId').value = '';
    }
    
    modal.style.display = 'block';
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
}

async function handleEventSubmit(e) {
    e.preventDefault();
    
    const eventId = document.getElementById('eventId').value;
    const eventData = {
        adminEmail: adminData.email, // Add admin authentication
        title: document.getElementById('eventTitle').value,
        category: document.getElementById('eventCategory').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        additionalInfo: document.getElementById('eventAdditionalInfo').value,
        image: document.getElementById('eventImage').value
    };
    
    try {
        const url = eventId 
            ? `http://localhost:8000/api/admin/events/${eventId}`
            : 'http://localhost:8000/api/admin/events';
        
        const response = await fetch(url, {
            method: eventId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });
        
        if (response.ok) {
            showSuccessMessage(eventId ? 'Event updated successfully!' : 'Event created successfully!');
            closeEventModal();
            loadAllEvents();
            loadDashboardStats();
        } else {
            const error = await response.json();
            showErrorMessage('Error: ' + (error.message || 'Failed to save event'));
        }
    } catch (error) {
        console.error('Error saving event:', error);
        showErrorMessage('An error occurred. Please try again.');
    }
}

async function editEvent(eventId) {
    try {
        const response = await fetch(`http://localhost:8000/api/admin/events/${eventId}?adminEmail=${encodeURIComponent(adminData.email)}`);
        const result = await response.json();
        const event = result.data || result; // Handle both response formats
        openEventModal(event);
    } catch (error) {
        console.error('Error loading event:', error);
        showErrorMessage('Unable to load event details');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? All RSVPs will also be deleted.')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8000/api/admin/events/${eventId}?adminEmail=${encodeURIComponent(adminData.email)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccessMessage('Event deleted successfully!');
            loadAllEvents();
            loadDashboardStats();
        } else {
            showErrorMessage('Failed to delete event');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        showErrorMessage('An error occurred. Please try again.');
    }
}

// Announcement Modal Functions
function openAnnouncementModal(announcementData = null) {
    const modal = document.getElementById('announcementModal');
    const form = document.getElementById('announcementForm');
    const title = document.getElementById('announcementModalTitle');
    
    if (announcementData) {
        title.textContent = 'Edit Announcement';
        document.getElementById('announcementId').value = announcementData.id;
        document.getElementById('announcementTitle').value = announcementData.title;
        document.getElementById('announcementPriority').value = announcementData.priority;
        // Format date properly for input field
        const dateValue = announcementData.date ? announcementData.date.split('T')[0] : '';
        document.getElementById('announcementDate').value = dateValue;
        document.getElementById('announcementAuthor').value = announcementData.author;
        document.getElementById('announcementContent').value = announcementData.content;
    } else {
        title.textContent = 'Add New Announcement';
        form.reset();
        document.getElementById('announcementId').value = '';
        // Set default author to current admin
        document.getElementById('announcementAuthor').value = adminData.userName || 'Admin';
        // Set default date to today
        document.getElementById('announcementDate').value = new Date().toISOString().split('T')[0];
    }
    
    modal.style.display = 'block';
}

function closeAnnouncementModal() {
    document.getElementById('announcementModal').style.display = 'none';
}

async function handleAnnouncementSubmit(e) {
    e.preventDefault();
    
    const announcementId = document.getElementById('announcementId').value;
    const announcementData = {
        adminEmail: adminData.email, // Add admin authentication
        title: document.getElementById('announcementTitle').value,
        priority: document.getElementById('announcementPriority').value,
        date: document.getElementById('announcementDate').value,
        author: document.getElementById('announcementAuthor').value,
        content: document.getElementById('announcementContent').value
    };
    
    try {
        const url = announcementId 
            ? `http://localhost:8000/api/admin/announcements/${announcementId}`
            : 'http://localhost:8000/api/admin/announcements';
        
        const response = await fetch(url, {
            method: announcementId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(announcementData)
        });
        
        if (response.ok) {
            showSuccessMessage(announcementId ? 'Announcement updated successfully!' : 'Announcement created successfully!');
            closeAnnouncementModal();
            loadAllAnnouncements();
            loadDashboardStats();
        } else {
            const error = await response.json();
            showErrorMessage('Error: ' + (error.message || 'Failed to save announcement'));
        }
    } catch (error) {
        console.error('Error saving announcement:', error);
        showErrorMessage('An error occurred. Please try again.');
    }
}

async function editAnnouncement(announcementId) {
    try {
        const response = await fetch(`http://localhost:8000/api/admin/announcements/${announcementId}?adminEmail=${encodeURIComponent(adminData.email)}`);
        const result = await response.json();
        const announcement = result.data || result; // Handle both response formats
        openAnnouncementModal(announcement);
    } catch (error) {
        console.error('Error loading announcement:', error);
        showErrorMessage('Unable to load announcement details');
    }
}

async function deleteAnnouncement(announcementId) {
    if (!confirm('Are you sure you want to delete this announcement?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8000/api/admin/announcements/${announcementId}?adminEmail=${encodeURIComponent(adminData.email)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccessMessage('Announcement deleted successfully!');
            loadAllAnnouncements();
            loadDashboardStats();
        } else {
            showErrorMessage('Failed to delete announcement');
        }
    } catch (error) {
        console.error('Error deleting announcement:', error);
        showErrorMessage('An error occurred. Please try again.');
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCategory(category) {
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Member Modal Functions
async function editMember(email) {
    try {
        const response = await fetch(`http://localhost:8000/api/profile?email=${encodeURIComponent(email)}`);
        const result = await response.json();
        
        if (result.success && result.profile) {
            openMemberModal(result.profile);
        } else {
            showErrorMessage('Unable to load member details');
        }
    } catch (error) {
        console.error('Error loading member:', error);
        showErrorMessage('Unable to load member details');
    }
}

function openMemberModal(memberData) {
    const modal = document.getElementById('memberModal');
    const form = document.getElementById('memberForm');
    
    // Populate form with member data
    document.getElementById('memberId').value = memberData.id || '';
    document.getElementById('memberEmail').value = memberData.email;
    document.getElementById('memberName').value = memberData.userName || '';
    document.getElementById('memberPhone').value = memberData.phone || '';
    document.getElementById('memberDateOfBirth').value = memberData.dateOfBirth || '';
    document.getElementById('memberGender').value = memberData.gender || '';
    document.getElementById('memberMaritalStatus').value = memberData.maritalStatus || '';
    document.getElementById('memberRole').value = memberData.role || 'member';
    document.getElementById('memberAddress').value = memberData.address || '';
    document.getElementById('memberCity').value = memberData.city || '';
    document.getElementById('memberState').value = memberData.state || '';
    document.getElementById('memberZipCode').value = memberData.zipCode || '';
    document.getElementById('memberCountry').value = memberData.country || '';
    document.getElementById('memberSince').value = memberData.memberSince || '';
    document.getElementById('memberMinistry').value = memberData.ministry || '';
    document.getElementById('memberNotes').value = memberData.notes || '';
    
    modal.style.display = 'block';
}

function closeMemberModal() {
    document.getElementById('memberModal').style.display = 'none';
}

async function handleMemberSubmit(e) {
    e.preventDefault();
    
    const memberData = {
        email: document.getElementById('memberEmail').value,
        userName: document.getElementById('memberName').value,
        phone: document.getElementById('memberPhone').value,
        dateOfBirth: document.getElementById('memberDateOfBirth').value,
        gender: document.getElementById('memberGender').value,
        maritalStatus: document.getElementById('memberMaritalStatus').value,
        role: document.getElementById('memberRole').value,
        address: document.getElementById('memberAddress').value,
        city: document.getElementById('memberCity').value,
        state: document.getElementById('memberState').value,
        zipCode: document.getElementById('memberZipCode').value,
        country: document.getElementById('memberCountry').value,
        memberSince: document.getElementById('memberSince').value,
        ministry: document.getElementById('memberMinistry').value,
        notes: document.getElementById('memberNotes').value
    };
    
    try {
        const response = await fetch('http://localhost:8000/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
        });
        
        if (response.ok) {
            showSuccessMessage('Member updated successfully!');
            closeMemberModal();
            loadMembers();
        } else {
            const error = await response.json();
            showErrorMessage('Error: ' + (error.message || 'Failed to update member'));
        }
    } catch (error) {
        console.error('Error updating member:', error);
        showErrorMessage('An error occurred. Please try again.');
    }
}

// Notification Functions
function showSuccessMessage(message) {
    showNotification(message, 'success');
}

function showErrorMessage(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
