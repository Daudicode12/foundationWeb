// Get user info from localStorage
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

// Check if user is logged in
if (!userData.email) {
    window.location.href = '/logins/login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    // Verify session first
    const isValid = await verifyMemberSession();
    if (!isValid) return;
    
    initHamburgerMenu();
    loadUserProfile();
    setupFormHandlers();
    
    // Set up token refresh interval (every 20 minutes)
    setInterval(refreshMemberToken, 20 * 60 * 1000);
});

// Load user profile from database
async function loadUserProfile() {
    try {
        const res = await fetch(`http://localhost:8000/api/profile?email=${encodeURIComponent(userData.email)}`);
        const data = await res.json();

        if (data.success && data.profile) {
            populateForm(data.profile);
            updateAvatar(data.profile.userName);
            
            // Load profile photo from localStorage
            const savedPhoto = localStorage.getItem('profilePhoto_' + userData.email);
            if (savedPhoto) {
                displayProfilePhoto(savedPhoto);
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Populate form with user data
function populateForm(profile) {
    document.getElementById('userName').value = profile.userName || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('dateOfBirth').value = profile.dateOfBirth || '';
    document.getElementById('gender').value = profile.gender || '';
    document.getElementById('maritalStatus').value = profile.maritalStatus || '';
    document.getElementById('address').value = profile.address || '';
    document.getElementById('city').value = profile.city || '';
    document.getElementById('state').value = profile.state || '';
    document.getElementById('zipCode').value = profile.zipCode || '';
    document.getElementById('country').value = profile.country || '';
    document.getElementById('memberSince').value = profile.memberSince || '';
    document.getElementById('ministry').value = profile.ministry || '';
    document.getElementById('notes').value = profile.notes || '';
}

// Update avatar with initials
function updateAvatar(name) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    document.getElementById('avatarInitials').textContent = initials;
}

// Setup form handlers
function setupFormHandlers() {
    const form = document.getElementById('profileForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const photoInput = document.getElementById('photoInput');
    const removePhotoBtn = document.getElementById('removePhotoBtn');

    // Save profile
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProfile();
    });

    // Cancel changes
    cancelBtn.addEventListener('click', () => {
        if (confirm('Discard all changes?')) {
            loadUserProfile();
            showMessage('Changes discarded', 'success');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('userData');
            localStorage.removeItem('memberToken');
            sessionStorage.clear();
            window.location.href = '/logins/login.html';
        }
    });

    // Upload photo button triggers file input
    uploadPhotoBtn.addEventListener('click', () => {
        photoInput.click();
    });

    // Handle file selection
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // Remove photo
    removePhotoBtn.addEventListener('click', () => {
        if (confirm('Remove profile photo?')) {
            removeProfilePhoto();
        }
    });
}

// Handle image upload
function handleImageUpload(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showMessage('Please select an image file', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showMessage('Image size must be less than 5MB', 'error');
        return;
    }

    // Read and display the image
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = e.target.result;
        
        // Display the image
        displayProfilePhoto(imageData);
        
        // Save to localStorage
        localStorage.setItem('profilePhoto_' + userData.email, imageData);
        
        showMessage('Photo uploaded successfully! Click Save Changes to update.', 'success');
    };
    reader.readAsDataURL(file);
}

// Display profile photo
function displayProfilePhoto(imageData) {
    const profileImage = document.getElementById('profileImage');
    const avatarInitials = document.getElementById('avatarInitials');
    const removePhotoBtn = document.getElementById('removePhotoBtn');

    profileImage.src = imageData;
    profileImage.style.display = 'block';
    avatarInitials.style.display = 'none';
    removePhotoBtn.style.display = 'block';
}

// Remove profile photo
function removeProfilePhoto() {
    const profileImage = document.getElementById('profileImage');
    const avatarInitials = document.getElementById('avatarInitials');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    const photoInput = document.getElementById('photoInput');

    profileImage.style.display = 'none';
    profileImage.src = '';
    avatarInitials.style.display = 'block';
    removePhotoBtn.style.display = 'none';
    photoInput.value = '';

    // Remove from localStorage
    localStorage.removeItem('profilePhoto_' + userData.email);

    showMessage('Photo removed', 'success');
}

// Save profile to database
async function saveProfile() {
    const formData = {
        email: document.getElementById('email').value,
        userName: document.getElementById('userName').value,
        phone: document.getElementById('phone').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        maritalStatus: document.getElementById('maritalStatus').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value,
        memberSince: document.getElementById('memberSince').value,
        ministry: document.getElementById('ministry').value,
        notes: document.getElementById('notes').value
    };

    try {
        const res = await fetch('http://localhost:8000/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (data.success) {
            // Update localStorage
            userData.userName = formData.userName;
            localStorage.setItem('userData', JSON.stringify(userData));
            
            updateAvatar(formData.userName);
            showMessage('Profile updated successfully!', 'success');
        } else {
            showMessage(data.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Show message
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';

    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// Hamburger Menu functionality (same as dashboard)
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

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
