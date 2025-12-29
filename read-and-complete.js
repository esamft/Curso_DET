// Timer functionality
let timeLeft = 178; // 2:58
const timerValue = document.querySelector('.timer-value');

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        alert('Tempo esgotado!');
    }
}

const timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
}, 1000);

// Exit button
document.querySelector('.exit-btn').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja sair? Seu progresso será perdido.')) {
        clearInterval(timerInterval);
        window.location.href = 'index.html';
    }
});

// Blank input handling
const blanks = document.querySelectorAll('.blank');
const nextBtn = document.querySelector('.next-btn');

blanks.forEach((blank, index) => {
    blank.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        const answer = e.target.dataset.answer.toLowerCase();

        // Auto-advance to next input
        if (value.length === parseInt(e.target.maxLength)) {
            if (index < blanks.length - 1) {
                blanks[index + 1].focus();
            }
        }

        checkCompletion();
    });

    blank.addEventListener('keydown', (e) => {
        // Backspace to previous input
        if (e.key === 'Backspace' && !blank.value && index > 0) {
            blanks[index - 1].focus();
        }
    });

    blank.addEventListener('blur', (e) => {
        validateBlank(e.target);
    });
});

function validateBlank(blank) {
    const value = blank.value.toLowerCase().trim();
    const answer = blank.dataset.answer.toLowerCase();

    if (value === '') {
        blank.classList.remove('correct', 'incorrect');
        return;
    }

    if (value === answer) {
        blank.classList.remove('incorrect');
        blank.classList.add('correct');
    } else {
        blank.classList.remove('correct');
        blank.classList.add('incorrect');
    }
}

function checkCompletion() {
    let allFilled = true;
    let allCorrect = true;

    blanks.forEach(blank => {
        if (!blank.value) {
            allFilled = false;
        }
        if (!blank.classList.contains('correct')) {
            allCorrect = false;
        }
    });

    nextBtn.disabled = !allFilled;
}

// Next button
nextBtn.addEventListener('click', () => {
    let allCorrect = true;

    blanks.forEach(blank => {
        validateBlank(blank);
        if (!blank.classList.contains('correct')) {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        alert('Parabéns! Você completou a tarefa corretamente!');
        window.location.href = 'read-and-select.html';
    } else {
        alert('Algumas respostas estão incorretas. Por favor, revise.');
    }
});

// Hint button
document.querySelector('.hint-btn').addEventListener('click', () => {
    const hints = [];
    blanks.forEach(blank => {
        if (!blank.classList.contains('correct')) {
            const answer = blank.dataset.answer;
            const firstLetter = answer[0].toUpperCase();
            hints.push(firstLetter);
        }
    });

    if (hints.length > 0) {
        alert(`Dica: As primeiras letras são: ${hints.join(', ')}`);
    } else {
        alert('Todas as respostas estão corretas!');
    }
});

// Focus first blank on load
blanks[0].focus();

// Update progress bar
const progressFill = document.querySelector('.progress-fill');
let progress = 20;

function updateProgress() {
    const filledBlanks = Array.from(blanks).filter(blank => blank.value).length;
    const totalBlanks = blanks.length;
    progress = 20 + (filledBlanks / totalBlanks) * 30; // 20% base + up to 30% for completion
    progressFill.style.width = `${progress}%`;
}

blanks.forEach(blank => {
    blank.addEventListener('input', updateProgress);
});
