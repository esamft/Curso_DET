// Timer functionality
let timeLeft = 300; // 5:00
const timerValue = document.querySelector('.timer-value');
const progressFill = document.querySelector('.progress-fill');

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update progress based on time remaining
    const progress = 60 + ((300 - timeLeft) / 300) * 40; // Start at 60%, go to 100%
    progressFill.style.width = `${progress}%`;

    // Change color when time is low
    if (timeLeft <= 60) {
        document.querySelector('.timer').style.background = '#FFEBEE';
        timerValue.style.color = '#F44336';
        const timerSvg = document.querySelector('.timer svg circle, .timer svg path');
        if (timerSvg) {
            timerSvg.setAttribute('stroke', '#F44336');
        }
    }

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimeOut();
    }
}

const timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
}, 1000);

function handleTimeOut() {
    const writingArea = document.querySelector('.writing-area');
    writingArea.disabled = true;
    writingArea.style.background = '#F5F5F5';

    alert('Tempo esgotado! Sua resposta foi salva automaticamente.');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Word count functionality
const writingArea = document.querySelector('.writing-area');
const wordCountElement = document.querySelector('.count');
const wordCountContainer = document.querySelector('.word-count');
const statusIndicator = document.querySelector('.status-indicator');
const statusText = document.querySelector('.status-text');

let typingTimer;
const typingDelay = 1000;

writingArea.addEventListener('input', () => {
    // Update word count
    const text = writingArea.value.trim();
    const words = text.length > 0 ? text.split(/\s+/).filter(word => word.length > 0) : [];
    const wordCount = words.length;

    wordCountElement.textContent = wordCount;

    // Show typing indicator
    statusIndicator.classList.add('typing');
    statusText.textContent = 'Escrevendo...';

    // Clear previous timer
    clearTimeout(typingTimer);

    // Set new timer
    typingTimer = setTimeout(() => {
        statusIndicator.classList.remove('typing');
        statusText.textContent = 'Salvo automaticamente';

        setTimeout(() => {
            statusText.textContent = 'Escrevendo...';
        }, 2000);
    }, typingDelay);

    // Warning if word count is low
    if (wordCount < 50 && wordCount > 0) {
        wordCountContainer.classList.add('warning');
    } else {
        wordCountContainer.classList.remove('warning');
    }

    // Save to localStorage
    localStorage.setItem('writingDraft', writingArea.value);
});

// Load saved draft
window.addEventListener('load', () => {
    const savedDraft = localStorage.getItem('writingDraft');
    if (savedDraft) {
        writingArea.value = savedDraft;
        writingArea.dispatchEvent(new Event('input'));
    }
});

// Auto-save every 10 seconds
setInterval(() => {
    if (writingArea.value.trim().length > 0) {
        localStorage.setItem('writingDraft', writingArea.value);
        console.log('Draft auto-saved');
    }
}, 10000);

// Next button
const nextBtn = document.querySelector('.next-btn-header');

nextBtn.addEventListener('click', () => {
    const text = writingArea.value.trim();
    const words = text.length > 0 ? text.split(/\s+/).filter(word => word.length > 0) : [];
    const wordCount = words.length;

    if (wordCount < 20) {
        alert('Por favor, escreva pelo menos 20 palavras antes de continuar.');
        return;
    }

    if (confirm('Tem certeza que deseja finalizar? Você não poderá mais editar sua resposta.')) {
        localStorage.removeItem('writingDraft');
        clearInterval(timerInterval);

        // Calculate preliminary score based on word count and time
        const timeSpent = 300 - timeLeft; // seconds spent
        const baseScore = Math.min(140, 100 + (wordCount * 0.5));

        // Show success message
        alert(`Resposta submetida com sucesso!\n\nTotal de palavras: ${wordCount}`);

        // Redirect to results with score
        window.location.href = `resultados.html?score=${Math.floor(baseScore)}`;
    }
});

// Prevent accidental page close
window.addEventListener('beforeunload', (e) => {
    if (writingArea.value.trim().length > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Focus writing area on load
writingArea.focus();

// Character counter (optional)
function addCharacterCounter() {
    const charCount = document.createElement('div');
    charCount.className = 'char-count';
    charCount.style.cssText = 'font-size: 12px; color: #999;';

    writingArea.addEventListener('input', () => {
        const chars = writingArea.value.length;
        charCount.textContent = `${chars} caracteres`;
    });

    document.querySelector('.footer-info').appendChild(charCount);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        nextBtn.click();
    }

    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        localStorage.setItem('writingDraft', writingArea.value);
        statusText.textContent = 'Salvo!';
        setTimeout(() => {
            statusText.textContent = 'Escrevendo...';
        }, 1500);
    }
});

// Spell check toggle (optional)
function toggleSpellCheck() {
    const currentState = writingArea.getAttribute('spellcheck');
    writingArea.setAttribute('spellcheck', currentState === 'true' ? 'false' : 'true');
}
