/* ============================================
   QUIZ SCRIPT
   ============================================ */

// ─── QUESTION DATA ──────────────────────────
// Each object holds: category, question text, 4 options,
// the index of the correct answer (0-3), and an explanation
const QUESTIONS = [
  {
    category: 'HTML',
    text: 'What does the <canvas> element in HTML5 allow you to do?',
    options: ['Draw graphics via JavaScript', 'Embed audio files', 'Create database connections', 'Define CSS styles'],
    answer: 0,
    explanation: 'The <canvas> element lets you draw 2D and 3D graphics using the JavaScript Canvas API.'
  },
  {
    category: 'CSS',
    text: 'Which CSS property creates a flexible box layout container?',
    options: ['display: block', 'display: flex', 'display: grid', 'display: inline'],
    answer: 1,
    explanation: '"display: flex" enables the Flexbox layout model, making child elements easy to align.'
  },
  {
    category: 'JavaScript',
    text: 'Which method adds an element to the END of an array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    answer: 0,
    explanation: 'push() appends one or more elements to the end of an array and returns the new length.'
  },
  {
    category: 'CSS',
    text: 'What is the CSS box model order from inside out?',
    options: ['Content → Border → Padding → Margin', 'Content → Padding → Border → Margin', 'Margin → Border → Padding → Content', 'Padding → Content → Border → Margin'],
    answer: 1,
    explanation: 'The CSS box model layers are: Content → Padding → Border → Margin.'
  },
  {
    category: 'JavaScript',
    text: 'What does DOM stand for?',
    options: ['Document Object Model', 'Data Output Manager', 'Dynamic Object Management', 'Document Output Module'],
    answer: 0,
    explanation: 'DOM = Document Object Model. It is a programming interface that represents the HTML page as a tree of objects.'
  },
  {
    category: 'HTML',
    text: 'Which HTML5 input type is used for date selection?',
    options: ['type="calendar"', 'type="datetime"', 'type="date"', 'type="time"'],
    answer: 2,
    explanation: 'type="date" creates a native date picker widget in the browser.'
  },
  {
    category: 'JavaScript',
    text: 'Which method converts a JSON string into a JavaScript object?',
    options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.toObject()'],
    answer: 1,
    explanation: 'JSON.parse() turns a JSON string into a JS object. JSON.stringify() does the reverse.'
  },
  {
    category: 'CSS',
    text: 'Which CSS unit is relative to the viewport width?',
    options: ['em', 'rem', 'vw', 'px'],
    answer: 2,
    explanation: '"vw" means viewport width. 1vw = 1% of the browser window\'s width.'
  },
  {
    category: 'HTML',
    text: 'What is the correct way to link an external CSS file?',
    options: ['<style href="style.css">', '<link rel="stylesheet" href="style.css">', '<css src="style.css">', '<script type="css" src="style.css">'],
    answer: 1,
    explanation: 'The <link> tag with rel="stylesheet" is the standard HTML way to include external CSS.'
  },
  {
    category: 'JavaScript',
    text: 'What does localStorage.setItem() do?',
    options: ['Reads data from the server', 'Stores data persistently in the browser', 'Creates a session cookie', 'Sends data to an API'],
    answer: 1,
    explanation: 'localStorage stores key-value pairs in the browser persistently — even after closing the tab.'
  },
];

// ─── STATE ──────────────────────────────────
// All quiz data is kept in this one object for clarity
let state = {
  current:      0,      // Index of the current question (0–9)
  score:        0,      // Total points accumulated
  correctCount: 0,      // How many questions answered correctly
  wrongCount:   0,      // How many questions answered wrong or expired
  answered:     null,   // null = not yet answered; index or -1 = answered
  timerVal:     30,     // Seconds remaining for current question
  timerInterval: null,  // Reference to the setInterval so we can clear it
};

// ─── SHOW/HIDE SCREENS ──────────────────────
// Only one screen is visible at a time: start, quiz, or result
function showScreen(id) {
  ['quizStart', 'quizScreen', 'quizResult'].forEach(screenId => {
    const el = document.getElementById(screenId);
    if (el) el.style.display = (screenId === id) ? 'block' : 'none';
  });
}

// ─── START QUIZ ─────────────────────────────
// Resets state and begins from question 0
function startQuiz() {
  state.current      = 0;
  state.score        = 0;
  state.correctCount = 0;
  state.wrongCount   = 0;
  state.answered     = null;

  showScreen('quizScreen');
  renderQuestion();
}

// ─── RENDER QUESTION ────────────────────────
// Displays the current question, options, and starts the timer
function renderQuestion() {
  clearInterval(state.timerInterval);   // Stop any existing timer
  state.answered = null;
  state.timerVal = 30;

  const q     = QUESTIONS[state.current];
  const total = QUESTIONS.length;

  // Update header: "Question 3 / 10", score
  document.getElementById('qProgress').textContent = `${state.current + 1} / ${total}`;
  document.getElementById('qScore').textContent    = state.score;

  // Update progress bar width
  document.getElementById('progressFill').style.width =
    ((state.current / total) * 100) + '%';

  // Show category and question text
  document.getElementById('qCategory').textContent = q.category;
  document.getElementById('qText').textContent     = q.text;

  // Build the 4 option buttons (A B C D)
  const letters = ['A', 'B', 'C', 'D'];
  document.getElementById('optionsList').innerHTML = q.options.map((opt, i) => `
    <button class="option-btn" id="opt_${i}" onclick="selectOption(${i})">
      <span class="opt-letter">${letters[i]}</span>
      <span>${opt}</span>
    </button>
  `).join('');

  // Hide explanation from previous question
  const exp = document.getElementById('explanation');
  if (exp) exp.classList.remove('show');

  // Reset Next button
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.disabled    = true;
    nextBtn.textContent = (state.current === total - 1) ? '🏁 Finish Quiz' : 'Next →';
  }

  // Start the countdown timer
  updateTimer();
  state.timerInterval = setInterval(() => {
    state.timerVal--;
    updateTimer();

    if (state.timerVal <= 0) {
      // Time ran out — auto-expire the question
      clearInterval(state.timerInterval);
      if (state.answered === null) autoExpire();
    }
  }, 1000);
}

// ─── UPDATE TIMER DISPLAY ───────────────────
// Changes the timer text and adds warning/danger class when low
function updateTimer() {
  const el = document.getElementById('qTimer');
  if (!el) return;
  el.textContent = '⏱ ' + state.timerVal + 's';
  el.className = 'timer';
  if (state.timerVal <= 10) el.classList.add('warning');
  if (state.timerVal <= 5)  el.classList.add('danger');
}

// ─── AUTO EXPIRE ────────────────────────────
// Called when timer hits 0 without the user answering
function autoExpire() {
  if (state.answered !== null) return;  // Guard: already answered
  state.answered = -1;   // -1 means "expired, no answer selected"
  state.wrongCount++;
  highlightAnswers(null); // Show the correct answer in green
  document.getElementById('nextBtn').disabled = false;
}

// ─── SELECT OPTION ──────────────────────────
// Called when the user clicks one of the 4 answer buttons
function selectOption(index) {
  if (state.answered !== null) return;  // Ignore clicks after answering
  clearInterval(state.timerInterval);

  const q       = QUESTIONS[state.current];
  const correct = (index === q.answer);

  state.answered = index;

  if (correct) {
    // Bonus points for answering quickly (max ~6 bonus points)
    const bonus = Math.ceil(state.timerVal / 5);
    state.score += 10 + bonus;
    state.correctCount++;
  } else {
    state.wrongCount++;
  }

  // Update score display
  document.getElementById('qScore').textContent = state.score;

  // Highlight which answer was right/wrong
  highlightAnswers(index);

  // Show explanation
  const exp = document.getElementById('explanation');
  if (exp) {
    exp.innerHTML = `<strong>${correct ? '✅ Correct!' : '❌ Wrong!'}</strong> ${q.explanation}`;
    exp.classList.add('show');
  }

  // Enable the Next button
  document.getElementById('nextBtn').disabled = false;
}

// ─── HIGHLIGHT ANSWERS ──────────────────────
// After answering: green = correct, red = wrong choice
function highlightAnswers(selectedIndex) {
  const q = QUESTIONS[state.current];
  q.options.forEach((_, i) => {
    const btn = document.getElementById('opt_' + i);
    if (!btn) return;
    btn.disabled = true;                             // Disable all buttons
    if (i === q.answer) btn.classList.add('correct'); // Always show correct
    if (i === selectedIndex && i !== q.answer) btn.classList.add('wrong'); // Mark wrong pick
  });
}

// ─── NEXT QUESTION ──────────────────────────
// Moves to the next question, or shows results if quiz is done
function nextQuestion() {
  if (state.current < QUESTIONS.length - 1) {
    state.current++;
    renderQuestion();
  } else {
    showResult();
  }
}

// ─── SHOW RESULT ────────────────────────────
// Calculates grade and fills in the result screen
function showResult() {
  clearInterval(state.timerInterval);
  showScreen('quizResult');

  const total = QUESTIONS.length;
  const pct   = Math.round((state.correctCount / total) * 100);

  // Pick grade and message based on percentage
  let grade = 'F', msg = '😕 Keep practicing!';
  if      (pct >= 90) { grade = 'A+'; msg = '🎉 Outstanding! Perfect performance!'; }
  else if (pct >= 80) { grade = 'A';  msg = '🌟 Excellent work!'; }
  else if (pct >= 70) { grade = 'B';  msg = '👍 Good job! Room to grow.'; }
  else if (pct >= 60) { grade = 'C';  msg = '😊 Not bad — review weak areas.'; }
  else if (pct >= 50) { grade = 'D';  msg = '📖 Study more and try again!'; }

  // Fill in the result card
  document.getElementById('rPct').textContent     = pct + '%';
  document.getElementById('rGrade').textContent   = grade;
  document.getElementById('rMessage').textContent = msg;
  document.getElementById('rScore').textContent   = state.score;
  document.getElementById('rCorrect').textContent = state.correctCount;
  document.getElementById('rWrong').textContent   = state.wrongCount;
}

// ─── INIT ────────────────────────────────────
// Show the start screen when the page loads
showScreen('quizStart');
