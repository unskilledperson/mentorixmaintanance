/* ==========================================================================
   MENTORIX INSTITUTE - Maintenance Page Interactive Engine & Visual Canvas
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  initCountdown();
  initPhaseSimulator();
  initParallax3D();
  initCurrentYear();
});

/* --------------------------------------------------------------------------
   1. Interactive Ambient Brand Canvas
   -------------------------------------------------------------------------- */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let nodes = [];

  // Theme color pool (Navy, Azure Blue, Sky Blue)
  const brandColors = [
    'rgba(36, 136, 229, ',   // Azure Blue
    'rgba(143, 190, 238, ',  // Sky Blue
    'rgba(24, 51, 84, '      // Deep Navy
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', () => {
    resize();
    createNodes();
  });

  const mouse = { x: null, y: null, radius: 160 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Node {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 3 + 1.5;
      this.baseColor = brandColors[Math.floor(Math.random() * brandColors.length)];
      this.alpha = Math.random() * 0.45 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion/interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 3;
          this.y -= Math.sin(angle) * force * 3;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${this.baseColor}${this.alpha})`;
      ctx.fill();
    }
  }

  function createNodes() {
    nodes = [];
    const count = Math.min(Math.floor(window.innerWidth / 20), 45);
    for (let i = 0; i < count; i++) {
      nodes.push(new Node());
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting geometry lines
    const maxDistance = 150;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const lineAlpha = (1 - dist / maxDistance) * 0.18;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(36, 136, 229, ${lineAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    nodes.forEach(node => {
      node.update();
      node.draw();
    });

    requestAnimationFrame(render);
  }

  resize();
  createNodes();
  render();
}

/* --------------------------------------------------------------------------
   2. Live Countdown Timer
   -------------------------------------------------------------------------- */
function initCountdown() {
  let targetDate = localStorage.getItem('mentorix_launch_timestamp');
  if (!targetDate) {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    future.setHours(future.getHours() + 14);
    targetDate = future.getTime();
    localStorage.setItem('mentorix_launch_timestamp', targetDate);
  } else {
    targetDate = parseInt(targetDate, 10);
  }

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function update() {
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

  update();
  setInterval(update, 1000);
}

/* --------------------------------------------------------------------------
   3. Phase & Progress Simulator
   -------------------------------------------------------------------------- */
function initPhaseSimulator() {
  const phaseEl = document.getElementById('status-phase');
  const phases = [
    'Finalizing Database Sync',
    'Optimizing Academic Portal',
    'Deploying Cloud CDN & SSL',
    'Configuring Student Dashboards'
  ];
  let index = 0;

  if (phaseEl) {
    setInterval(() => {
      index = (index + 1) % phases.length;
      phaseEl.style.opacity = '0';
      setTimeout(() => {
        phaseEl.textContent = phases[index];
        phaseEl.style.opacity = '1';
      }, 300);
    }, 4500);
  }
}

/* --------------------------------------------------------------------------
   4. 3D Card Parallax on Mouse Movement
   -------------------------------------------------------------------------- */
function initParallax3D() {
  const card = document.querySelector('.maintenance-card');
  if (!card || window.innerWidth < 768) return;

  window.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth / 2 - e.clientX) / 55;
    const y = (window.innerHeight / 2 - e.clientY) / 55;
    card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg)`;
  });

  window.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
  });
}

/* --------------------------------------------------------------------------
   5. Dynamic Copyright Year
   -------------------------------------------------------------------------- */
function initCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
