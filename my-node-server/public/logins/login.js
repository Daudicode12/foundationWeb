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
     alert(data.message);
        // redirect to dashboard or another page
        window.location.href = data.redirect;
    } else {
     alert('Login failed: ' + data.message);
    }
  } catch (error) {
    alert('An error occurred. Please try again later.');
  }
});