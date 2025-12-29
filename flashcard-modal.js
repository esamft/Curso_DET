// Close modal functionality
const closeModalBtn = document.querySelector('.close-modal');
const cancelBtn = document.querySelector('.btn-cancel');
const overlay = document.querySelector('.overlay');

function closeModal() {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        window.close();
    }, 300);
}

closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Click outside to close
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        closeModal();
    }
});

// Form submission
const form = document.querySelector('.flashcard-form');
const inputs = document.querySelectorAll('.input-field, .textarea-field');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        word: document.querySelector('.input-field').value,
        meaning: document.querySelectorAll('.input-field')[1].value,
        context: document.querySelector('.textarea-field').value,
        isAcademic: document.querySelector('.checkbox').checked
    };

    console.log('Flashcard saved:', formData);

    // Show success message
    const saveBtn = document.querySelector('.btn-save');
    const originalText = saveBtn.innerHTML;

    saveBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="white" stroke-width="2"/>
            <path d="M7 10l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        SALVO COM SUCESSO!
    `;
    saveBtn.style.background = '#48A802';

    setTimeout(() => {
        closeModal();
    }, 1500);
});

// Checkbox toggle
const checkbox = document.querySelector('.checkbox');
const checkboxIcon = document.querySelector('.checkbox-icon');

checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
        checkboxIcon.innerHTML = `
            <rect width="20" height="20" rx="4" fill="#2196F3"/>
            <path d="M7 10l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round"/>
        `;
    } else {
        checkboxIcon.innerHTML = `
            <rect width="20" height="20" rx="4" fill="#E3F2FD"/>
        `;
    }
});

// Input focus effects
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.classList.add('active');
    });

    input.addEventListener('blur', () => {
        if (!input.value) {
            input.classList.remove('active');
        }
    });
});

// ESC key to close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
