// Dashboard functionality

// Animate numbers on load
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = end === parseInt(end) ? value : value + '%';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Animate stats on page load
window.addEventListener('load', () => {
    const stats = [
        { selector: '.stat-item:nth-child(1) .stat-value', value: 15 },
        { selector: '.stat-item:nth-child(2) .stat-value', value: 4 },
        { selector: '.stat-item:nth-child(3) .stat-value', value: 87, isPercent: true },
        { selector: '.stat-item:nth-child(4) .stat-value', value: 12, prefix: '+' }
    ];

    stats.forEach(stat => {
        const element = document.querySelector(stat.selector);
        if (element) {
            const originalText = element.textContent;
            element.textContent = '0';
            animateValue(element, 0, stat.value, 1500);

            if (stat.prefix) {
                setTimeout(() => {
                    element.textContent = stat.prefix + element.textContent;
                }, 1500);
            }
        }
    });
});

// Simulate real-time data update (optional)
function updateScores() {
    // This could fetch real data from an API
    console.log('Dashboard loaded with latest scores');
}

// Card animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.5s ease forwards';
        }
    });
}, observerOptions);

document.querySelectorAll('.card').forEach(card => {
    observer.observe(card);
});

// Gauge needle animation based on score
function updateGaugeNeedle(score) {
    // Score range: 10-160
    // Angle range: -90deg to 90deg
    const minScore = 10;
    const maxScore = 160;
    const minAngle = -90;
    const maxAngle = 90;

    const angle = ((score - minScore) / (maxScore - minScore)) * (maxAngle - minAngle) + minAngle;

    const needle = document.querySelector('.needle');
    if (needle) {
        needle.style.transform = `rotate(${angle}deg)`;
        needle.style.transformOrigin = '100px 100px';
    }
}

// Set initial score (average of range 115-125)
updateGaugeNeedle(120);

// Handle action button clicks with analytics
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const action = this.querySelector('.btn-title').textContent;
        console.log('Action clicked:', action);

        // Add ripple effect
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255,255,255,0.5)';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.animation = 'ripple 0.6s ease-out';

        const rect = this.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left - 10) + 'px';
        ripple.style.top = (e.clientY - rect.top - 10) + 'px';

        this.style.position = 'relative';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// View all history
document.querySelector('.view-all-btn')?.addEventListener('click', () => {
    alert('Funcionalidade em desenvolvimento: Visualizar histórico completo');
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Update user greeting based on time of day
function updateGreeting() {
    const hour = new Date().getHours();
    const userName = document.querySelector('.user-name');

    if (hour < 12) {
        userName.textContent = 'Bom dia, Aluno';
    } else if (hour < 18) {
        userName.textContent = 'Boa tarde, Aluno';
    } else {
        userName.textContent = 'Boa noite, Aluno';
    }
}

updateGreeting();

// Refresh data periodically (every 30 seconds)
setInterval(updateScores, 30000);
