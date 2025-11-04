const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageEl = document.getElementById('message');

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
      
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify({
        userName: data.userName || email.split('@')[0],
        email: email
      }));
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = 'http://localhost:8000/dashboard/dashboard.html';
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