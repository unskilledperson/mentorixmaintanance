/* ==========================================================================
   MENTORIX - Maintenance Page Interactive Engine & Particle System
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initCountdown();
  initYear();
  initCardParallax();
});

/* --------------------------------------------------------------------------
   1. Interactive Particle Network System
   -------------------------------------------------------------------------- */
function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  // Configuration
  const particleCount = Math.min(Math.floor(window.innerWidth / 15), 65);
  const connectionDistance = 140;
  const mouse = { x: null, y: null, radius: 150 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce on edges
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 2;
          this.y -= Math.sin(angle) * force * 2;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129, 140, 248, ${this.alpha})`;
      ctx.fill();
    }
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const opacity = (1 - dist / connectionDistance) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw individual particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();
}

/* --------------------------------------------------------------------------
   2. Target Countdown Timer
   -------------------------------------------------------------------------- */
function initCountdown() {
  // Set launch target to 14 days from current load time (or configure specific ISO date)
  let targetDate = localStorage.getItem('mentorix_launch_date');
  if (!targetDate) {
    const future = new Date();
    future.setDate(future.getDate() + 12);
    future.setHours(future.getHours() + 8);
    targetDate = future.getTime();
    localStorage.setItem('mentorix_launch_date', targetDate);
  } else {
    targetDate = parseInt(targetDate, 10);
  }

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateTimer() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      if (daysEl) daysEl.innerText = '00';
      if (hoursEl) hoursEl.innerText = '00';
      if (minutesEl) minutesEl.innerText = '00';
      if (secondsEl) secondsEl.innerText = '00';
      return;
    }

    const d = Math.floor(difference / (1000 * 60 * 60 * 24));
    const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((difference % (1000 * 60)) / 1000);

    if (daysEl) daysEl.innerText = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.innerText = String(h).padStart(2, '0');
    if (minutesEl) minutesEl.innerText = String(m).padStart(2, '0');
    if (secondsEl) secondsEl.innerText = String(s).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* --------------------------------------------------------------------------
   3. VIP Newsletter / Notify-Me Submission
   -------------------------------------------------------------------------- */
function handleSubscribe(e) {
  e.preventDefault();
  const emailInput = document.getElementById('email-input');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');

  if (!emailInput || !emailInput.value.trim()) return;

  const email = emailInput.value.trim();

  // Basic email pattern validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFeedback('Please enter a valid email address.', 'error');
    return;
  }

  // Visual loading state
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Saving...</span>`;

  setTimeout(() => {
    // Save locally for demonstration or hook to a remote webhook/API
    try {
      const storedEmails = JSON.parse(localStorage.getItem('mentorix_subscribers') || '[]');
      if (!storedEmails.includes(email)) {
        storedEmails.push(email);
        localStorage.setItem('mentorix_subscribers', JSON.stringify(storedEmails));
      }
    } catch (err) {
      console.error(err);
    }

    emailInput.value = '';
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Subscribed! ✓</span>`;
    showFeedback("🎉 You're on the list! We will notify you the moment we launch.", 'success');

    setTimeout(() => {
      submitBtn.innerHTML = originalBtnContent;
    }, 4000);
  }, 700);
}

function showFeedback(msg, type) {
  const feedback = document.getElementById('form-feedback');
  if (!feedback) return;
  feedback.textContent = msg;
  feedback.className = `form-feedback ${type}`;
}

/* --------------------------------------------------------------------------
   4. Current Year & 3D Tilt Effect
   -------------------------------------------------------------------------- */
function initYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function initCardParallax() {
  const card = document.querySelector('.glass-card');
  if (!card || window.innerWidth < 768) return;

  window.addEventListener('mousemove', (e) => {
    const xAxis = (window.innerWidth / 2 - e.clientX) / 45;
    const yAxis = (window.innerHeight / 2 - e.clientY) / 45;
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  });

  window.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}
