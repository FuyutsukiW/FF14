let sequence = [];
let currentStep = 0;
let lastCorrectPrompt = '';


const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const optionsContainer = document.getElementById('options-container');
const correctModal = document.getElementById('correct-modal');
const correctText = document.getElementById('correct-text');
const correctImage = document.getElementById('correct-image');
const modalOkButton = document.getElementById('modal-ok-button');
const incorrectModal = document.getElementById('incorrect-modal');
const incorrectText = document.getElementById('incorrect-text');
const incorrectOkButton = document.getElementById('incorrect-ok-button');

document.getElementById('start-button').addEventListener('click', startQuiz);

modalOkButton.addEventListener('click', () => {
  correctModal.style.display = 'none';
  lastCorrectPrompt = sequence[currentStep].correctPrompt; // <-- track it
  currentStep++;
  if (currentStep >= sequence.length) {
    resetToStart();
  } else {
    showQuestion();
  }
});


function startQuiz() {
  fetch('sequence.json')
    .then(response => response.json())
    .then(data => {
      sequence = data;
      currentStep = 0;
      startScreen.classList.remove('active');
      quizScreen.classList.add('active');
      showQuestion();
    })
    .catch(error => {
      console.error('Failed to load sequence:', error);
    });
}

function showQuestion() {
  optionsContainer.innerHTML = '';
  const correct = sequence[currentStep];

  // Show last correct prompt above the buttons
  const prevEl = document.getElementById('previous-answer');
  if (lastCorrectPrompt) {
    prevEl.textContent = `Previous: ${lastCorrectPrompt}`;
  } else {
    prevEl.textContent = ''; // hide if first question
  }

  // Compute a window of 4 nearby steps
  let start = Math.max(0, Math.min(currentStep, sequence.length - 4));
  let rawWindow = sequence.slice(start, start + 4);

  // Filter out duplicate text entries
  const seen = new Set();
  let windowItems = [];

  for (let item of rawWindow) {
    if (!seen.has(item.text)) {
      seen.add(item.text);
      windowItems.push(item);
    }
  }

  // Ensure correct is included
  if (!windowItems.some(item => item.id === correct.id)) {
    if (windowItems.length >= 4) {
      // Replace one with correct
      windowItems[Math.floor(Math.random() * windowItems.length)] = correct;
    } else {
      // Add correct to make 4
      windowItems.push(correct);
    }
  }

  // Ensure exactly 4 unique items
  while (windowItems.length < 4) {
    // Fill with random non-duplicate texts from the rest of the sequence
    const filler = sequence[Math.floor(Math.random() * sequence.length)];
    if (
      !windowItems.some(item => item.text === filler.text) &&
      filler.text !== correct.text
    ) {
      windowItems.push(filler);
    }
  }

  // Shuffle final button order
  shuffle(windowItems);

  // Create buttons
  windowItems.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option.text;
    btn.addEventListener('click', () => handleAnswer(option));
    optionsContainer.appendChild(btn);
  });
}



function handleAnswer(selected) {
  const correct = sequence[currentStep];
  if (selected.id === correct.id) {
    correctText.textContent = correct.correctPrompt;
    correctImage.src = correct.image;
    correctImage.style.display = correct.image ? 'block' : 'none';
    correctModal.style.display = 'flex';
  } else {
    incorrectText.textContent = `Incorrect. The correct answer was: "${correct.text}".`;
    incorrectModal.style.display = 'flex';

  }
}

function resetToStart() {
  quizScreen.classList.remove('active');
  startScreen.classList.add('active');
  lastCorrectPrompt = ''; // <-- Clear previous answer
  document.getElementById('previous-answer').textContent = ''; // Clear display too
}


function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

document.getElementById('back-button').addEventListener('click', resetToStart);

incorrectOkButton.addEventListener('click', () => {
  incorrectModal.style.display = 'none';
  resetToStart();
});
