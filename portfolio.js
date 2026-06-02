/* ============================================
   PORTFOLIO SCRIPT
   ============================================ */

// ─── ANIMATE SKILL BARS ─────────────────────
// Sets each skill bar's width to the value in data-pct
// e.g. <div class="skill-bar" data-pct="85"> → sets width to 85%
function animateSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');
  bars.forEach(bar => {
    const pct = bar.getAttribute('data-pct') || '70';
    bar.style.width = pct + '%';
  });
}

// Use IntersectionObserver to animate bars only when scrolled into view
// This creates a nice "fill up" effect when you reach the skills section
const skillsSection = document.querySelector('.skills-section');

if (skillsSection) {
  // Create an observer that watches for the skills section entering the viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Section is visible — animate the bars
          animateSkillBars();
          // Stop watching after the first time (animation only needs to run once)
          observer.disconnect();
        }
      });
    },
    { threshold: 0.2 }  // Trigger when 20% of the section is visible
  );

  observer.observe(skillsSection);
}

// ─── CONTACT FORM SUBMISSION ────────────────
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();  // Stop the form from actually submitting (no server)
    let valid = true;

    // List of fields to validate, with their IDs and which rule to apply
    const fields = [
      { inputId: 'cf-name',    errId: 'err-name',    rule: rules.required },
      { inputId: 'cf-email',   errId: 'err-email',   rule: rules.email },
      { inputId: 'cf-subject', errId: 'err-subject',  rule: rules.required },
      { inputId: 'cf-message', errId: 'err-message',  rule: rules.required },
    ];

    // Validate each field; if any fails, mark valid = false
    fields.forEach(f => {
      const input = document.getElementById(f.inputId);
      const errEl = document.getElementById(f.errId);
      if (!validateField(input, errEl, f.rule)) valid = false;
    });

    if (valid) {
      showToast("✅ Message sent! I'll get back to you soon.");
      contactForm.reset();  // Clear all form fields
    }
  });

  // Live validation: clear error as soon as the user starts typing
  contactForm.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.style.borderColor = '';  // Remove red border

      // Hide the error message below this input
      const errEl = input.parentElement.querySelector('.form-error');
      if (errEl) errEl.classList.remove('show');
    });
  });
}
