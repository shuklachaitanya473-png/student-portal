/* ============================================
   TO-DO LIST SCRIPT
   ============================================ */

// Load tasks from localStorage, or start with an empty array
let tasks = JSON.parse(localStorage.getItem('ssp_tasks') || '[]');

// Tracks which filter is currently active
let currentFilter = 'all';

// ─── SAVE TASKS ─────────────────────────────
// Save the tasks array to localStorage so data persists after refresh
function saveTasks() {
  localStorage.setItem('ssp_tasks', JSON.stringify(tasks));
}

// ─── RENDER TASKS ───────────────────────────
// Shows the correct tasks depending on the current filter
function renderTasks() {
  const list = document.getElementById('taskList');
  if (!list) return;

  // Filter the tasks array based on the selected filter
  let filtered = tasks;
  if (currentFilter === 'active')    filtered = tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') filtered = tasks.filter(t =>  t.completed);
  if (currentFilter === 'high')      filtered = tasks.filter(t => t.priority === 'high');
  if (currentFilter === 'medium')    filtered = tasks.filter(t => t.priority === 'medium');
  if (currentFilter === 'low')       filtered = tasks.filter(t => t.priority === 'low');

  // Show empty state if nothing to display
  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">No tasks here</div>
        <p>${currentFilter === 'all' ? 'Add your first task above!' : 'Nothing in this filter.'}</p>
      </div>`;
    updateStats();
    return;
  }

  // Build HTML for each task in the filtered list
  list.innerHTML = filtered.map(task => `
    <div class="task-item ${task.completed ? 'done' : ''}" data-id="${task.id}">

      <!-- Checkbox button: click to toggle done/undone -->
      <button
        class="check-btn ${task.completed ? 'checked' : ''}"
        onclick="toggleTask('${task.id}')"
        title="Mark complete"
      >${task.completed ? '✓' : ''}</button>

      <!-- Task text -->
      <span class="task-text">${escapeHtml(task.text)}</span>

      <!-- Coloured dot showing priority -->
      <span class="dot ${task.priority}" title="${task.priority} priority"></span>

      <!-- Date added -->
      <span class="task-date">${formatDate(task.created)}</span>

      <!-- Delete button -->
      <button class="del-btn" onclick="deleteTask('${task.id}')" title="Delete">✕</button>
    </div>
  `).join('');

  // Update the counter label
  document.getElementById('taskCounter').textContent = filtered.length + ' task(s)';

  updateStats();
}

// ─── UPDATE STATS ───────────────────────────
// Recalculates and updates the 4 numbers in the sidebar
function updateStats() {
  const total  = tasks.length;
  const done   = tasks.filter(t => t.completed).length;
  const active = total - done;
  const high   = tasks.filter(t => t.priority === 'high' && !t.completed).length;

  document.getElementById('statTotal').textContent  = total;
  document.getElementById('statDone').textContent   = done;
  document.getElementById('statActive').textContent = active;
  document.getElementById('statHigh').textContent   = high;
}

// ─── ADD TASK ────────────────────────────────
// Reads the input and creates a new task object
function addTask() {
  const input    = document.getElementById('taskInput');
  const priority = document.getElementById('taskPriority');
  const text     = input.value.trim();

  // Don't add blank tasks
  if (!text) {
    input.focus();
    input.style.borderColor = '#e53e3e';
    showToast('Please enter a task.', 'error');
    return;
  }

  // Clear any error styling
  input.style.borderColor = '';

  // Build a task object
  const task = {
    id:        'task_' + Date.now(),   // unique ID based on timestamp
    text:      text,
    priority:  priority.value,          // 'high', 'medium', or 'low'
    completed: false,
    created:   new Date().toISOString(),
  };

  // Add to the front of the array (newest first), save, and refresh
  tasks.unshift(task);
  saveTasks();
  renderTasks();

  // Clear input and refocus for fast entry
  input.value = '';
  input.focus();
  showToast('✅ Task added!');
}

// ─── TOGGLE TASK ────────────────────────────
// Marks a task as done or undone
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

// ─── DELETE TASK ────────────────────────────
// Removes a task from the array permanently
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  showToast('🗑️ Task removed.');
}

// ─── CLEAR COMPLETED ────────────────────────
// Removes all tasks that are marked as done
function clearCompleted() {
  const count = tasks.filter(t => t.completed).length;
  if (!count) {
    showToast('No completed tasks to clear.', 'error');
    return;
  }
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
  showToast(`Cleared ${count} completed task(s).`);
}

// ─── SET FILTER ─────────────────────────────
// Changes the active filter and highlights the right button
function setFilter(filter) {
  currentFilter = filter;

  // Update the active class on filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  renderTasks();
}

// ─── ENTER KEY SHORTCUT ─────────────────────
// Press Enter in the text input to add a task quickly
document.getElementById('taskInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// ─── UTILITY: FORMAT DATE ───────────────────
// Converts an ISO date string to "12 Jan" format
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ─── UTILITY: ESCAPE HTML ───────────────────
// Prevents XSS by turning < > & into safe HTML entities
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── INIT ────────────────────────────────────
// Run on page load to display any saved tasks
renderTasks();
