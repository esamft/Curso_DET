// Words database - mix of real and fake words
const words = [
    { word: 'UNFLAPTION', isReal: false, current: 3 },
    { word: 'EPHEMERAL', isReal: true, current: 4 },
    { word: 'SERENDIPITY', isReal: true, current: 5 },
    { word: 'QUIXOTIC', isReal: true, current: 6 },
    { word: 'CROMULENT', isReal: false, current: 7 },
    { word: 'MAGNANIMOUS', isReal: true, current: 8 },
    { word: 'PERSPICACIOUS', isReal: true, current: 9 },
    { word: 'FLIBBERTIGIBBET', isReal: true, current: 10 },
    { word: 'SURREPTITIOUS', isReal: true, current: 11 },
    { word: 'EMBIGGEN', isReal: false, current: 12 },
    { word: 'UBIQUITOUS', isReal: true, current: 13 },
    { word: 'MELLIFLUOUS', isReal: true, current: 14 },
    { word: 'PULCHRITUDINOUS', isReal: true, current: 15 },
    { word: 'RECALCITRANT', isReal: true, current: 16 },
    { word: 'DEFENESTRATION', isReal: true, current: 17 },
    { word: 'SUPERCALIFRAGILISTICEXPIALIDOCIOUS', isReal: true, current: 18 }
];

let currentWordIndex = 0;
let timeLeft = 4;
let timerInterval;
let score = 0;

// Elements
const wordElement = document.getElementById('currentWord');
const timerValue = document.querySelector('.timer-value');
const progressFill = document.querySelector('.progress-fill');
const wordCounter = document.querySelector('.word-counter');
const choiceButtons = document.querySelectorAll('.choice-btn');

// Initialize
function init() {
    displayWord();
    startTimer();
}

// Display current word
function displayWord() {
    const currentWord = words[currentWordIndex];
    wordElement.textContent = currentWord.word;
    wordCounter.textContent = `PALAVRA ${currentWord.current} DE 18`;

    // Update progress
    const progress = (currentWord.current / 18) * 100;
    progressFill.style.width = `${progress}%`;

    // Reset buttons
    choiceButtons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect', 'selected');
        btn.disabled = false;
    });

    // Reset timer
    timeLeft = 4;
    updateTimerDisplay();
}

// Timer functions
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            handleTimeout();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function handleTimeout() {
    clearInterval(timerInterval);
    choiceButtons.forEach(btn => btn.disabled = true);

    setTimeout(() => {
        nextWord();
    }, 1000);
}

// Choice selection
choiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const choice = btn.dataset.choice;
        const currentWord = words[currentWordIndex];
        const isCorrect = (choice === 'yes' && currentWord.isReal) ||
                         (choice === 'no' && !currentWord.isReal);

        // Stop timer
        clearInterval(timerInterval);

        // Disable all buttons
        choiceButtons.forEach(b => b.disabled = true);

        // Show feedback
        if (isCorrect) {
            btn.classList.add('correct');
            score++;
            console.log('Correct! Score:', score);
        } else {
            btn.classList.add('incorrect');

            // Highlight correct answer
            const correctChoice = currentWord.isReal ? 'yes' : 'no';
            const correctBtn = document.querySelector(`[data-choice="${correctChoice}"]`);
            setTimeout(() => {
                correctBtn.classList.add('correct');
            }, 300);
        }

        // Move to next word
        setTimeout(() => {
            nextWord();
        }, 1500);
    });
});

// Next word
function nextWord() {
    currentWordIndex++;

    if (currentWordIndex >= words.length) {
        // End of test
        showResults();
    } else {
        displayWord();
        startTimer();
    }
}

// Show results
function showResults() {
    const percentage = Math.round((score / words.length) * 100);
    alert(`Teste concluído!\n\nPontuação: ${score}/${words.length} (${percentage}%)`);
    window.location.href = 'interactive-writing.html';
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === '1' || e.key.toLowerCase() === 'n') {
        document.querySelector('.no-btn').click();
    } else if (e.key === '2' || e.key.toLowerCase() === 'y') {
        document.querySelector('.yes-btn').click();
    }
});

// Initialize on load
init();
