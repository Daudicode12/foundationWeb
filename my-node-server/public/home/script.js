// Mobile navigation toggle
var navLinksEl = document.querySelector('#nav-links');
var menuBarEl = document.querySelector('#menu-bar');
var timesBarEl = document.querySelector('#times-bar');

if (menuBarEl) {
    menuBarEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Menu button clicked');
        showMenu(); 
    });
}

if (timesBarEl) {
    timesBarEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button clicked');
        hideMenu();
    });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinksEl && navLinksEl.classList.contains('active')) {
        if (!navLinksEl.contains(e.target) && !menuBarEl.contains(e.target)) {
            hideMenu();
        }
    }
});

// Close menu when clicking a link
if (navLinksEl) {
    const links = navLinksEl.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            hideMenu();
        });
    });
}

function showMenu(){
    if (navLinksEl) {
        navLinksEl.classList.add('active');
        navLinksEl.style.right = '0';
        console.log('Menu opened');
    }
}

function hideMenu(){
    if (navLinksEl) {
        navLinksEl.classList.remove('active');
        navLinksEl.style.right = '-200px';
        console.log('Menu closed');
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.nav-section');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(127, 124, 124, 0.98)';
            header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)';
        } else {
            header.style.background = 'rgba(127, 124, 124, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        }
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards
document.querySelectorAll('.service-col').forEach(card => {
    observer.observe(card);
});

// Scroll to top button functionality
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 700) {
            hideMenu();
        }
    });
});

// Smooth scroll to services section when clicking scroll indicator
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', function() {
        document.querySelector('.services').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
}

// Hide scroll indicator when scrolling down
window.addEventListener('scroll', function() {
    if (scrollIndicator) {
        if (window.scrollY > 200) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.visibility = 'hidden';
        } else {
            scrollIndicator.style.opacity = '1';
            scrollIndicator.style.visibility = 'visible';
        }
    }
});

// Add parallax effect to hero section
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header && window.scrollY < window.innerHeight) {
        const scrolled = window.scrollY;
        header.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Animate info cards on hover
document.querySelectorAll('.info-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});



