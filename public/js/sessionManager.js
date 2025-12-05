// Session Manager - Handles JWT token storage and validation
const SessionManager = {
    // Storage keys
    TOKEN_KEY: 'authToken',
    USER_KEY: 'userData',
    ADMIN_TOKEN_KEY: 'adminToken',
    ADMIN_KEY: 'adminData',
    
    // API base URL
    API_URL: 'http://localhost:8000/api',
    
    // Session timeout warning (5 minutes before expiry)
    WARNING_BEFORE_EXPIRY: 5 * 60 * 1000,
    
    // Check interval (every minute)
    CHECK_INTERVAL: 60 * 1000,
    
    // Timer reference
    sessionTimer: null,
    
    // Initialize session management
    init(isAdmin = false) {
        this.isAdmin = isAdmin;
        this.startSessionCheck();
        this.setupActivityListeners();
        return this.isLoggedIn();
    },
    
    // Get the appropriate keys based on user type
    getKeys() {
        return this.isAdmin 
            ? { token: this.ADMIN_TOKEN_KEY, user: this.ADMIN_KEY }
            : { token: this.TOKEN_KEY, user: this.USER_KEY };
    },
    
    // Save session after login
    saveSession(token, userData) {
        const keys = this.getKeys();
        localStorage.setItem(keys.token, token);
        localStorage.setItem(keys.user, JSON.stringify(userData));
        this.startSessionCheck();
    },
    
    // Get stored token
    getToken() {
        const keys = this.getKeys();
        return localStorage.getItem(keys.token);
    },
    
    // Get stored user data
    getUserData() {
        const keys = this.getKeys();
        const data = localStorage.getItem(keys.user);
        return data ? JSON.parse(data) : null;
    },
    
    // Check if user is logged in with valid token
    isLoggedIn() {
        const token = this.getToken();
        if (!token) return false;
        
        // Check if token is expired
        const payload = this.decodeToken(token);
        if (!payload) return false;
        
        const now = Date.now() / 1000;
        return payload.exp > now;
    },
    
    // Decode JWT token (without verification - just to read payload)
    decodeToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            
            const payload = JSON.parse(atob(parts[1]));
            return payload;
        } catch (e) {
            return null;
        }
    },
    
    // Get time until token expires (in milliseconds)
    getTimeUntilExpiry() {
        const token = this.getToken();
        if (!token) return 0;
        
        const payload = this.decodeToken(token);
        if (!payload || !payload.exp) return 0;
        
        const expiryTime = payload.exp * 1000;
        return expiryTime - Date.now();
    },
    
    // Start session monitoring
    startSessionCheck() {
        // Clear existing timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        
        // Check session every minute
        this.sessionTimer = setInterval(() => {
            this.checkSession();
        }, this.CHECK_INTERVAL);
        
        // Do an initial check
        this.checkSession();
    },
    
    // Check session status
    async checkSession() {
        const timeLeft = this.getTimeUntilExpiry();
        
        if (timeLeft <= 0) {
            // Session expired
            this.handleSessionExpired();
        } else if (timeLeft <= this.WARNING_BEFORE_EXPIRY) {
            // Session about to expire - try to refresh
            await this.refreshToken();
        }
    },
    
    // Refresh the token
    async refreshToken() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            const response = await fetch(`${this.API_URL}/refresh-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.token) {
                const keys = this.getKeys();
                localStorage.setItem(keys.token, data.token);
                console.log('Session refreshed successfully');
                return true;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
        
        return false;
    },
    
    // Verify token with server
    async verifyToken() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            const response = await fetch(`${this.API_URL}/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error verifying token:', error);
            return false;
        }
    },
    
    // Handle session expiration
    handleSessionExpired() {
        this.showSessionExpiredMessage();
        this.logout();
    },
    
    // Show session expired message
    showSessionExpiredMessage() {
        // Create notification if it doesn't exist
        let notification = document.getElementById('session-expired-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'session-expired-notification';
            notification.innerHTML = `
                <div class="session-notification">
                    <div class="session-notification-content">
                        <i class="fas fa-clock"></i>
                        <span>Your session has expired. Please log in again.</span>
                    </div>
                </div>
            `;
            notification.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
            `;
            
            const content = notification.querySelector('.session-notification-content');
            content.style.cssText = `
                background: white;
                padding: 2rem;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;
            
            document.body.appendChild(notification);
        }
    },
    
    // Setup activity listeners to extend session on user activity
    setupActivityListeners() {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        let lastActivity = Date.now();
        
        const handleActivity = () => {
            const now = Date.now();
            // Only refresh if last activity was more than 5 minutes ago
            if (now - lastActivity > 5 * 60 * 1000) {
                lastActivity = now;
                // Check if we should refresh the token
                const timeLeft = this.getTimeUntilExpiry();
                if (timeLeft > 0 && timeLeft < 30 * 60 * 1000) {
                    this.refreshToken();
                }
            }
        };
        
        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });
    },
    
    // Logout
    logout() {
        const keys = this.getKeys();
        localStorage.removeItem(keys.token);
        localStorage.removeItem(keys.user);
        
        // Clear timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        
        // Redirect to login page
        const loginPage = this.isAdmin ? '/admin/admin-login.html' : '/logins/login.html';
        window.location.href = loginPage;
    },
    
    // Get authorization header for API calls
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },
    
    // Make authenticated API call
    async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            this.logout();
            return null;
        }
        
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
        
        try {
            const response = await fetch(url, { ...options, headers });
            
            if (response.status === 401) {
                // Token invalid or expired
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // Retry the request with new token
                    headers['Authorization'] = `Bearer ${this.getToken()}`;
                    return fetch(url, { ...options, headers });
                } else {
                    this.handleSessionExpired();
                    return null;
                }
            }
            
            return response;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
}
