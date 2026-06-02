/* ============================================
   SMART STUDENT PORTAL — Global Script
   ============================================ */

// ─── HAMBURGER MENU ─────────────────────────
// Toggle the mobile navigation menu open/closed
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is clicked (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ─── ACTIVE NAV LINK ────────────────────────
// Highlight the link that matches the current page
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page || a.getAttribute('href') === '../' + page) {
      a.classList.add('active');
    }
  });
})();

// ─── SHOW TOAST ─────────────────────────────
// Shows a small popup message at the bottom-right
function showToast(message, type = 'success') {
  // Create the container div if it doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create and show the toast
  const toast = document.createElement('div');
  toast.className = 'toast' + (type === 'error' ? ' error' : '');
  toast.textContent = message;
  container.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => toast.remove(), 3000);
}

// ─── VALIDATE A SINGLE FIELD ────────────────
// Checks one input using a rule function
// Returns true if valid, false if not
function validateField(input, errorEl, rule) {
  const value = input.value.trim();
  const errorMessage = rule(value);

  if (errorMessage) {
    // Show error: highlight input and show message
    input.style.borderColor = '#e53e3e';
    if (errorEl) {
      errorEl.textContent = errorMessage;
      errorEl.classList.add('show');
    }
    return false;
  }

  // No error: clear styles
  input.style.borderColor = '';
  if (errorEl) errorEl.classList.remove('show');
  return true;
}

// ─── VALIDATION RULES ───────────────────────
// Each rule is a function: takes a value, returns '' (valid) or an error string
const rules = {
  required: value => value ? '' : 'This field is required.',
  email:    value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address.',
  minLen:   n => value => value.length >= n ? '' : `Minimum ${n} characters required.`,
};
