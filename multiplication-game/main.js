// Multiplication Game JavaScript

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');
const adminPanelScreen = document.getElementById('admin-panel-screen');

const playerNameInput = document.getElementById('player-name');
const startGameBtn = document.getElementById('start-game-btn');

const displayPlayerName = document.getElementById('display-player-name');
const strikesEl = document.getElementById('strikes');
const scoreEl = document.getElementById('score');
const timerBar = document.getElementById('timer-bar');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const scorePopup = document.getElementById('score-popup');

const finalScoreEl = document.getElementById('final-score');
const finalTimeEl = document.getElementById('final-time');
const finalCorrectEl = document.getElementById('final-correct');
const playAgainBtn = document.getElementById('play-again-btn');
const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');

const leaderboardList = document.getElementById('leaderboard-list');
const backToWelcomeBtn = document.getElementById('back-to-welcome-btn');

const adminLeaderboardList = document.getElementById('admin-leaderboard-list');
const clearLeaderboardBtn = document.getElementById('clear-leaderboard-btn');
const exportLeaderboardBtn = document.getElementById('export-leaderboard-btn');
const adminBackBtn = document.getElementById('admin-back-btn');

// Game variables
let playerName = '';
let score = 0;
let strikes = 0;
let correctAnswers = 0;
let maxStrikes = 5;
let questionTimer = 10; // seconds
let timerInterval = null;
let timeLeft = questionTimer;
let gameStartTime = null;
let gameEndTime = null;
let currentQuestion = null;
let isGameOver = false;

// Sound effects (optional)
const correctSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
const wrongSound = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');

// Utility: shuffle array
function shuffleArray(array) {
  for (let i = array.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Generate a random multiplication question and answers
function generateQuestion() {
  const a = Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;
  const correctAnswer = a * b;

  // Generate 3 wrong answers
  const answers = new Set();
  answers.add(correctAnswer);
  while (answers.size < 4) {
    let wrong = Math.floor(Math.random() * 144) + 1; // 12*12=144 max
    if (wrong !== correctAnswer) {
      answers.add(wrong);
    }
  }

  const answersArray = shuffleArray(Array.from(answers));

  return {
    questionText: `${a} × ${b}`,
    correctAnswer,
    answers: answersArray
  };
}

// Start the timer for each question
function startTimer() {
  timeLeft = questionTimer;
  updateTimerBar();
  timerInterval = setInterval(() => {
    timeLeft -= 0.1;
    if (timeLeft <= 0) {
      timeLeft = 0;
      clearInterval(timerInterval);
      handleAnswer(null); // no answer = wrong
    }
    updateTimerBar();
  }, 100);
}

// Update the timer bar width and color
function updateTimerBar() {
  const percent = (timeLeft / questionTimer) * 100;
  timerBar.style.width = percent + '%';
  if (percent > 60) {
    timerBar.classList.remove('bg-yellow-400', 'bg-red-500');
    timerBar.classList.add('bg-green-500');
  } else if (percent > 30) {
    timerBar.classList.remove('bg-green-500', 'bg-red-500');
    timerBar.classList.add('bg-yellow-400');
  } else {
    timerBar.classList.remove('bg-green-500', 'bg-yellow-400');
    timerBar.classList.add('bg-red-500');
  }
}

// Show the question and answers on screen
function showQuestion() {
  currentQuestion = generateQuestion();
  questionEl.textContent = currentQuestion.questionText;
  answersEl.innerHTML = '';
  currentQuestion.answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.textContent = answer;
    btn.className = 'bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition';
    btn.addEventListener('click', () => handleAnswer(answer));
    answersEl.appendChild(btn);
  });
}

// Handle answer selection or timeout
function handleAnswer(selectedAnswer) {
  clearInterval(timerInterval);
  if (isGameOver) return;

  if (selectedAnswer === currentQuestion.correctAnswer) {
    score++;
    correctAnswers++;
    showScorePopup('+1');
    playSound(correctSound);
  } else {
    strikes++;
    playSound(wrongSound);
  }
  updateScoreAndStrikes();

  if (strikes >= maxStrikes) {
    endGame();
  } else {
    showQuestion();
    startTimer();
  }
}

// Update score and strikes display
function updateScoreAndStrikes() {
  scoreEl.textContent = score;
  strikesEl.textContent = strikes;
}

// Show score popup animation
function showScorePopup(text) {
  scorePopup.textContent = text;
  scorePopup.classList.add('score-popup');
  scorePopup.style.opacity = '1';
  setTimeout(() => {
    scorePopup.style.opacity = '0';
    scorePopup.classList.remove('score-popup');
  }, 600);
}

// Play sound effect safely
function playSound(sound) {
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

// Start the game
function startGame() {
  playerName = playerNameInput.value.trim();
  if (!playerName) {
    alert('Please enter your name to start the game.');
    return;
  }
  welcomeScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  leaderboardScreen.classList.add('hidden');
  adminPanelScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  displayPlayerName.textContent = playerName;
  score = 0;
  strikes = 0;
  correctAnswers = 0;
  updateScoreAndStrikes();
  isGameOver = false;
  gameStartTime = Date.now();

  showQuestion();
  startTimer();
}

// End the game and show game over screen
function endGame() {
  isGameOver = true;
  clearInterval(timerInterval);
  gameEndTime = Date.now();
  const timeSurvived = ((gameEndTime - gameStartTime) / 1000).toFixed(1);

  gameScreen.classList.add('hidden');
  gameOverScreen.classList.remove('hidden');

  finalScoreEl.textContent = score;
  finalTimeEl.textContent = timeSurvived;
  finalCorrectEl.textContent = correctAnswers;

  saveScore(playerName, score, timeSurvived);

  if (playerName.toLowerCase() === 'aziel') {
    showAdminPanel();
  }
}

// Save score to localStorage leaderboard
function saveScore(name, score, timeSurvived) {
  const leaderboard = getLeaderboard();
  leaderboard.push({ name, score, timeSurvived: parseFloat(timeSurvived) });
  leaderboard.sort((a, b) => b.score - a.score || b.timeSurvived - a.timeSurvived);
  localStorage.setItem('multiplicationGameLeaderboard', JSON.stringify(leaderboard));
}

// Get leaderboard from localStorage
function getLeaderboard() {
  const data = localStorage.getItem('multiplicationGameLeaderboard');
  return data ? JSON.parse(data) : [];
}

// Show leaderboard screen
function showLeaderboard() {
  welcomeScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  adminPanelScreen.classList.add('hidden');
  leaderboardScreen.classList.remove('hidden');

  renderLeaderboard();
}

// Render leaderboard table
function renderLeaderboard() {
  const leaderboard = getLeaderboard();
  leaderboardList.innerHTML = '';
  leaderboard.forEach(entry => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-gray-300';
    tr.innerHTML = `
      <td class="py-2 px-4">${entry.name}</td>
      <td class="py-2 px-4">${entry.score}</td>
      <td class="py-2 px-4">${entry.timeSurvived.toFixed(1)}</td>
    `;
    leaderboardList.appendChild(tr);
  });
}

// Show admin panel screen
function showAdminPanel() {
  gameOverScreen.classList.add('hidden');
  leaderboardScreen.classList.add('hidden');
  adminPanelScreen.classList.remove('hidden');

  renderAdminLeaderboard();
}

// Render admin leaderboard table with editable inputs
function renderAdminLeaderboard() {
  const leaderboard = getLeaderboard();
  adminLeaderboardList.innerHTML = '';
  leaderboard.forEach((entry, index) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-gray-300';

    // Create editable inputs for score and timeSurvived
    tr.innerHTML = `
      <td class="py-2 px-4">${entry.name}</td>
      <td class="py-2 px-4">
        <input type="number" min="0" value="${entry.score}" data-index="${index}" data-field="score" class="w-20 p-1 border border-gray-300 rounded" />
      </td>
      <td class="py-2 px-4">
        <input type="number" min="0" step="0.1" value="${entry.timeSurvived.toFixed(1)}" data-index="${index}" data-field="timeSurvived" class="w-24 p-1 border border-gray-300 rounded" />
      </td>
    `;
    adminLeaderboardList.appendChild(tr);
  });

  // Add event listeners to inputs for live update
  const inputs = adminLeaderboardList.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      const field = e.target.getAttribute('data-field');
      let value = e.target.value;

      if (field === 'score') {
        value = parseInt(value);
        if (isNaN(value) || value < 0) value = 0;
      } else if (field === 'timeSurvived') {
        value = parseFloat(value);
        if (isNaN(value) || value < 0) value = 0;
      }

      const leaderboard = getLeaderboard();
      if (field === 'score') {
        leaderboard[idx].score = value;
      } else if (field === 'timeSurvived') {
        leaderboard[idx].timeSurvived = value;
      }
      // Update localStorage immediately on input change
      localStorage.setItem('multiplicationGameLeaderboard', JSON.stringify(leaderboard));
    });
  });
}

// Clear leaderboard from localStorage
function clearLeaderboard() {
  if (confirm('Are you sure you want to clear the leaderboard?')) {
    localStorage.removeItem('multiplicationGameLeaderboard');
    renderAdminLeaderboard();
  }
}

// Export leaderboard as JSON file
function exportLeaderboard() {
  const leaderboard = getLeaderboard();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leaderboard, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "multiplication_game_leaderboard.json");
  document.body.appendChild(dlAnchorElem);
  dlAnchorElem.click();
  dlAnchorElem.remove();
}

// Event listeners
startGameBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', () => {
  gameOverScreen.classList.add('hidden');
  // Start game directly with existing playerName
  if (playerName) {
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    score = 0;
    strikes = 0;
    correctAnswers = 0;
    updateScoreAndStrikes();
    isGameOver = false;
    gameStartTime = Date.now();
    showQuestion();
    startTimer();
  } else {
    // fallback to welcome screen if no playerName
    welcomeScreen.classList.remove('hidden');
  }
});

viewLeaderboardBtn.addEventListener('click', showLeaderboard);
backToWelcomeBtn.addEventListener('click', () => {
  leaderboardScreen.classList.add('hidden');
  welcomeScreen.classList.remove('hidden');
  playerNameInput.value = '';
});
clearLeaderboardBtn.addEventListener('click', clearLeaderboard);
exportLeaderboardBtn.addEventListener('click', exportLeaderboard);
adminBackBtn.addEventListener('click', () => {
  adminPanelScreen.classList.add('hidden');
  leaderboardScreen.classList.remove('hidden');
});

// New event listener for Change Name button on Game Over screen
const changeNameBtn = document.getElementById('change-name-btn');
changeNameBtn.addEventListener('click', () => {
  gameOverScreen.classList.add('hidden');
  welcomeScreen.classList.remove('hidden');
  // Pre-fill the player name input with the last player name
  playerNameInput.value = playerName;
  playerNameInput.focus();
});

// Keyboard enter key to start game
playerNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    startGame();
  }
});
