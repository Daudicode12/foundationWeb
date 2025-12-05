const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageEl = document.getElementById('message');

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('memberToken');
  if (token) {
    // Verify token is still valid
    fetch('/api/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        window.location.href = '/dashboard/dashboard.html';
      }
    })
    .catch(() => {
      localStorage.removeItem('memberToken');
      localStorage.removeItem('userData');
    });
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    messageEl.textContent = 'Please fill in all fields.';
    return;
  }

  // Perform login logic here
  try {
    const res = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    
    if (data.success) {
      messageEl.textContent = data.message;
      messageEl.style.color = 'green';
      
      // Store token and user data
      localStorage.setItem('memberToken', data.token);
      localStorage.setItem('userData', JSON.stringify({
        userName: data.userName || email.split('@')[0],
        email: email,
        phone: data.phone,
        role: data.role || 'member'
      }));
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = '/dashboard/dashboard.html';
      }, 1000);
    } else {
      messageEl.textContent = 'Login failed: ' + data.message;
      messageEl.style.color = 'red';
    }
  } catch (error) {
    console.error('Login error:', error);
    messageEl.textContent = 'An error occurred. Please try again later.';
    messageEl.style.color = 'red';
  }
});