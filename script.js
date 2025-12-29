// Timer functionality
let timeLeft = 35;
let timerInterval;
let isRecording = false;

const timerValue = document.querySelector('.timer-value');
const timerCircle = document.querySelector('.timer-circle');
const recordBtn = document.querySelector('.record-btn');
const statusMessage = document.querySelector('.status-message');
const soundWaves = document.querySelector('.sound-waves');

// Update timer display
function updateTimer() {
    const percentage = (timeLeft / 35) * 100;
    const degrees = (percentage / 100) * 360;

    timerCircle.style.background = `conic-gradient(#FF9600 0deg ${degrees}deg, #E5E5E5 ${degrees}deg 360deg)`;
    timerValue.textContent = timeLeft;

    if (timeLeft <= 0) {
        stopTimer();
        stopRecording();
    }
}

// Start timer
function startTimer() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
    }, 1000);
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Reset timer
function resetTimer() {
    stopTimer();
    timeLeft = 35;
    updateTimer();
}

// Recording functionality
function startRecording() {
    isRecording = true;
    recordBtn.innerHTML = `
        <svg class="mic-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="6" width="12" height="12" rx="2" fill="white"/>
        </svg>
        PARAR GRAVAÇÃO
    `;
    recordBtn.style.background = 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)';
    statusMessage.textContent = 'GRAVANDO...';
    statusMessage.style.color = '#DC2626';

    // Animate sound waves
    soundWaves.querySelectorAll('.wave').forEach(wave => {
        wave.style.background = '#FF9600';
    });

    startTimer();

    // Request microphone permission (simulation)
    console.log('Recording started...');
}

function stopRecording() {
    isRecording = false;
    recordBtn.innerHTML = `
        <svg class="mic-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="white"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="white"/>
        </svg>
        GRAVAR RESPOSTA
    `;
    recordBtn.style.background = 'linear-gradient(135deg, #FF9600 0%, #FF8000 100%)';
    statusMessage.textContent = 'AGUARDANDO...';
    statusMessage.style.color = '#999';

    // Reset sound waves
    soundWaves.querySelectorAll('.wave').forEach(wave => {
        wave.style.background = '#DDD';
    });

    stopTimer();

    console.log('Recording stopped...');
}

// Record button click handler
recordBtn.addEventListener('click', () => {
    if (isRecording) {
        stopRecording();
        resetTimer();
    } else {
        startRecording();
    }
});

// Close button
document.querySelector('.close-btn').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja sair?')) {
        window.close();
    }
});

// Check microphone permission on load
window.addEventListener('load', () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                console.log('Microphone access granted');
                stream.getTracks().forEach(track => track.stop());
            })
            .catch(err => {
                console.error('Microphone access denied:', err);
                alert('Por favor, permita o acesso ao microfone para usar este aplicativo.');
            });
    }
});

// Initialize timer display
updateTimer();
