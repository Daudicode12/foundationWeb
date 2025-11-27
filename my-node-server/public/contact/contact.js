// Handle contact form submission
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    const formMessage = document.getElementById('formMessage');
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            formMessage.textContent = data.message;
            formMessage.className = 'success';
            document.getElementById('contactForm').reset();
        } else {
            formMessage.textContent = data.message || 'Failed to send message. Please try again.';
            formMessage.className = 'error';
        }
    } catch (error) {
        console.error('Error:', error);
        formMessage.textContent = 'An error occurred. Please try again later.';
        formMessage.className = 'error';
    }

    // Clear message after 5 seconds
    setTimeout(() => {
        formMessage.textContent = '';
        formMessage.className = '';
    }, 5000);
});

// Navigation toggle for mobile
const menuBar = document.getElementById('menu-bar');
const timesBar = document.getElementById('times-bar');
const navLinks = document.getElementById('nav-links');

if (menuBar) {
    menuBar.addEventListener('click', function() {
        navLinks.style.right = '0';
    });
}

if (timesBar) {
    timesBar.addEventListener('click', function() {
        navLinks.style.right = '-200px';
    });
}
