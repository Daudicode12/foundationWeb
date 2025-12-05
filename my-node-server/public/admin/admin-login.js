// Check if already logged in as admin
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Verify token is still valid
        fetch('http://localhost:8000/api/verify-token', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.user.role === 'admin') {
                window.location.href = '/admin/admin-dashboard.html';
            }
        })
        .catch(() => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
        });
    }
});

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const messageDiv = document.getElementById('message');
    
    try {
        const response = await fetch('http://localhost:8000/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            messageDiv.textContent = 'Login successful! Redirecting...';
            messageDiv.className = 'message success';
            
            // Store admin token and data
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminData', JSON.stringify({
                email: data.email,
                userName: data.userName,
                role: data.role
            }));
            
            // Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = '/admin/admin-dashboard.html';
            }, 1000);
        } else {
            messageDiv.textContent = data.message || 'Invalid admin credentials';
            messageDiv.className = 'message error';
        }
    } catch (error) {
        console.error('Login error:', error);
        messageDiv.textContent = 'An error occurred. Please try again.';
        messageDiv.className = 'message error';
    }
});
