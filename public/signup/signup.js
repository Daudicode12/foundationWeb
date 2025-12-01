const signupFormEl = document.getElementById("signupForm");
const messageEl = document.getElementById("message");

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? 'red' : 'green';
}

signupFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userName = document.getElementById("userName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phonenumber").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("comfirmpassword").value.trim();

  // Validate all fields
  if (!userName || !email || !phone || !password || !confirmPassword) {
    showMessage('Please fill in all fields.', true);
    return;
  }

  if (password.length < 8) {
    showMessage('Password must be at least 8 characters.', true);
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Passwords do not match.', true);
    return;
  }

  showMessage('Sending signup request...', false);

  try {
    const res = await fetch("http://localhost:8000/api/signup", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, email, phone, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showMessage(data.message, false);
      signupFormEl.reset();

      // Redirect to login page after 1 second
      setTimeout(() => {
        window.location.href = 'http://localhost:8000/logins/login.html';
      }, 1000);
    } else {
      showMessage(data.message || 'Signup failed', true);
    }
  } catch (err) {
    console.error('Signup error:', err);
    showMessage('Network error. Please try again later.', true);
  }
});
