// Results page functionality

// Score value (can be passed via URL parameter or localStorage)
const urlParams = new URLSearchParams(window.location.search);
const finalScore = parseInt(urlParams.get('score')) || 135; // Default 135

// Update score display with animation
function animateScore() {
    const scoreElement = document.getElementById('scoreValue');
    let currentScore = 0;
    const increment = finalScore / 60; // 60 frames

    const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= finalScore) {
            currentScore = finalScore;
            clearInterval(timer);
        }
        scoreElement.textContent = Math.floor(currentScore);
    }, 25);
}

// Position score marker on scale
function positionScoreMarker() {
    const marker = document.getElementById('scoreMarker');
    const minScore = 10;
    const maxScore = 160;

    // Calculate percentage position (0-100%)
    const percentage = ((finalScore - minScore) / (maxScore - minScore)) * 100;

    marker.style.left = `${percentage}%`;
    marker.querySelector('.marker-label').textContent = finalScore;
}

// Confetti animation
class Confetti {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                r: Math.random() * 4 + 2,
                d: Math.random() * 100,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                tilt: Math.floor(Math.random() * 10) - 10,
                tiltAngleIncremental: Math.random() * 0.07 + 0.05,
                tiltAngle: 0
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            this.ctx.beginPath();
            this.ctx.lineWidth = p.r / 2;
            this.ctx.strokeStyle = p.color;
            this.ctx.moveTo(p.x + p.tilt + p.r, p.y);
            this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            this.ctx.stroke();

            // Update
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;

            // Reset if out of canvas
            if (p.y > this.canvas.height) {
                this.particles[i] = {
                    x: Math.random() * this.canvas.width,
                    y: -10,
                    r: p.r,
                    d: p.d,
                    color: p.color,
                    tilt: Math.floor(Math.random() * 10) - 10,
                    tiltAngleIncremental: p.tiltAngleIncremental,
                    tiltAngle: p.tiltAngle
                };
            }
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize confetti
const canvas = document.getElementById('confetti-canvas');
const confetti = new Confetti(canvas);

// Stop confetti after 5 seconds
setTimeout(() => {
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 1s';
    setTimeout(() => {
        canvas.style.display = 'none';
    }, 1000);
}, 5000);

// Animate progress bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');

    progressBars.forEach((bar, index) => {
        setTimeout(() => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
        }, index * 200);
    });
}

// Calculate level based on score
function getLevel(score) {
    if (score >= 140) return { name: 'C2 Proficiente', icon: '🏆' };
    if (score >= 125) return { name: 'C1 Proficiente', icon: '🎓' };
    if (score >= 105) return { name: 'B2 Avançado', icon: '⭐' };
    if (score >= 90) return { name: 'B1 Intermediário', icon: '📚' };
    if (score >= 70) return { name: 'A2 Básico', icon: '📖' };
    return { name: 'A1 Iniciante', icon: '🌱' };
}

// Update level badge
function updateLevelBadge() {
    const level = getLevel(finalScore);
    const badgeIcon = document.querySelector('.badge-icon');
    const badgeText = document.querySelector('.badge-text');

    badgeIcon.textContent = level.icon;
    badgeText.textContent = level.name;
}

// Save results to localStorage
function saveResults() {
    const results = {
        score: finalScore,
        date: new Date().toISOString(),
        sections: {
            literacy: 140,
            conversation: 125,
            comprehension: 130,
            production: 135
        },
        stats: {
            time: '42 min',
            accuracy: '89%',
            correct: '45/50'
        }
    };

    // Get existing history
    let history = JSON.parse(localStorage.getItem('testHistory') || '[]');

    // Add new result
    history.unshift(results);

    // Keep only last 10 results
    if (history.length > 10) {
        history = history.slice(0, 10);
    }

    localStorage.setItem('testHistory', JSON.stringify(history));
    console.log('Results saved to localStorage');
}

// Initialize page
window.addEventListener('load', () => {
    // Animate score
    animateScore();

    // Position marker
    positionScoreMarker();

    // Update level badge
    updateLevelBadge();

    // Animate progress bars
    setTimeout(animateProgressBars, 1000);

    // Save results
    saveResults();

    // Play success sound (optional)
    playSuccessSound();
});

// Optional: Play success sound
function playSuccessSound() {
    // Create AudioContext for success tone
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Share results functionality
function shareResults() {
    const text = `Consegui ${finalScore} pontos no DET Simulator! 🎉`;

    if (navigator.share) {
        navigator.share({
            title: 'Meu resultado DET',
            text: text,
            url: window.location.href
        });
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(text);
        alert('Resultado copiado para a área de transferência!');
    }
}

// Add share button (optional)
const shareBtn = document.createElement('button');
shareBtn.className = 'btn btn-share';
shareBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="currentColor"/>
    </svg>
    Compartilhar
`;
shareBtn.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
    border-radius: 50px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 100;
`;
shareBtn.onclick = shareResults;
document.body.appendChild(shareBtn);

// Keyboard shortcut: Press 'D' to go to Dashboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'd' || e.key === 'D') {
        window.location.href = 'dashboard.html';
    }
});
