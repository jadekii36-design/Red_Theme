/* ============================================================
   RED DRAGON — Theme Studio
   Access Gate · Portal Background · Chinese Dragon · Sequence
   ============================================================ */
'use strict';

/* ════════════════════════════════════════════════════════════
   ACCESS GATE — Premium Splash
════════════════════════════════════════════════════════════ */
const gateEl      = document.getElementById('access-gate');
const mainSiteEl  = document.getElementById('main-site');
const gateEnterBtn= document.getElementById('gateEnterBtn');


function enterSite() {
  if (gateEl.classList.contains('fade-out')) return;

  // 1. Gate fades out
  gateEl.classList.add('fade-out');

  // 2. Curtain splits open
  setTimeout(() => {
    const veil = document.getElementById('realm-veil');
    const rc   = document.getElementById('realmCanvas');
    veil.classList.add('opening');

    // Ember particles only — NO seam line
    rc.width  = window.innerWidth;
    rc.height = window.innerHeight;
    const rctx = rc.getContext('2d');
    const cx   = rc.width * 0.5;

    const embers = [];
    for (let i = 0; i < 60; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      embers.push({
        x: cx + (Math.random() - 0.5) * 6,
        y: rc.height * (0.05 + Math.random() * 0.9),
        vx: side * (Math.random() * 5 + 2),
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 0.8,
        life: Math.random() * 0.3,
        hue: Math.random() * 25 + 5
      });
    }

    let alpha = 1;

    function drawEmbers() {
      if (alpha <= 0) return;
      rctx.clearRect(0, 0, rc.width, rc.height);

      // Ember particles only — no line
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x    += e.vx;
        e.y    += e.vy;
        e.life += 0.016;
        if (e.life >= 1) { embers.splice(i, 1); continue; }
        const a = Math.sin(e.life * Math.PI) * alpha;
        rctx.shadowColor = `hsl(${e.hue}, 100%, 65%)`;
        rctx.shadowBlur  = e.size * 4;
        rctx.fillStyle   = `hsla(${e.hue}, 100%, 75%, ${a})`;
        rctx.beginPath();
        rctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        rctx.fill();
        rctx.shadowBlur = 0;
      }

      alpha -= 0.008;
      requestAnimationFrame(drawEmbers);
    }
    drawEmbers();

    // 3. Reveal main site as curtains open
    setTimeout(() => {
      mainSiteEl.classList.remove('hidden');
      setTimeout(() => mainSiteEl.classList.add('visible'), 60);
    }, 700);

    // 4. Clean up
    setTimeout(() => { veil.style.display = 'none'; }, 2000);
  }, 200);
}

gateEnterBtn.addEventListener('click', enterSite);

window.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') enterSite();
});

window.addEventListener('load', () => {
  // Reveal body smoothly — no flash
  document.body.style.visibility = 'visible';
  startEyeOpenAnimation();
});


/* ════════════════════════════════════════════════════════════
   STARTUP — Black → Circular Iris Open → Full Scene
════════════════════════════════════════════════════════════ */
function startEyeOpenAnimation() {
  const gate  = document.getElementById('access-gate');
  const video = document.getElementById('gateBgVideo');
  const ui    = document.querySelector('.gate-ui');

  // Hide video and UI initially
  if (video) { video.style.opacity = '0'; video.style.transition = 'none'; }
  if (ui)    { ui.style.animation  = 'none'; ui.style.opacity = '0'; }

  // Canvas covers entire gate
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:absolute;inset:0;z-index:50;pointer-events:none;';
  cv.width  = window.innerWidth;
  cv.height = window.innerHeight;
  gate.appendChild(cv);

  const ctx = cv.getContext('2d');
  const W   = cv.width,  H = cv.height;
  const cx  = W / 2,    cy = H / 2;
  const maxR = Math.sqrt(cx*cx + cy*cy) + 10; // radius to cover full screen

  let startTime = null;

  // Easing: ease-in-out cubic
  function easeInOut(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
  }

  function frame(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;

    ctx.clearRect(0, 0, W, H);

    // ── Phase 1: Hold black (0–600ms) ──
    if (elapsed < 600) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      requestAnimationFrame(frame);
      return;
    }

    // ── Phase 2: Iris circle opens (600–2200ms) ──
    if (elapsed < 2200) {
      const p = easeInOut(Math.min((elapsed - 600) / 1600, 1));
      const r = maxR * p;

      // Draw black with circular cutout (the "open eye" reveal)
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // Cut the circle out using composite
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();

      // Glowing ring at edge of opening circle
      if (p > 0.05 && p < 0.98) {
        const ringAlpha = Math.sin(p * Math.PI) * 0.9;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 120, 30, ${ringAlpha})`;
        ctx.lineWidth   = 6;
        ctx.shadowColor = `rgba(255, 80, 0, ${ringAlpha})`;
        ctx.shadowBlur  = 40;
        ctx.stroke();
        ctx.shadowBlur  = 0;
      }

      // Fade in video as circle opens (after 30%)
      if (p > 0.3 && video) {
        video.style.opacity = String(Math.min((p - 0.3) / 0.7, 1) * 0.85);
      }

      requestAnimationFrame(frame);
      return;
    }

    // ── Phase 3: All revealed — show UI (2200ms+) ──
    if (video) video.style.opacity = '0.85';
    cv.remove();

    if (ui) {
      ui.style.transition = 'opacity 1.4s ease';
      ui.style.opacity    = '1';
    }
  }

  requestAnimationFrame(frame);
}

/* ════════════════════════════════════════════════════════════
   GATE PARTICLES — Lively Fire & Ember System (DISABLED)
════════════════════════════════════════════════════════════ */
function startGateParticles() {
  const canvas = document.getElementById('gateParticles');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── TAIJI PARTICLE SYSTEM ──
     YIN  = large dark-red soft orbs (slow, heavy, deep)
     YANG = small bright orange sparks (fast, sharp, explosive)
     CHI  = expanding energy rings (circular pulse waves)
     STARS= fixed field with flowing wave-pulse across screen
  ─────────────────────────────────────────────────────── */
  const stars  = [];   // fixed field — wave pulse
  const rising = [];   // yin/yang rising particles
  const rings  = [];   // chi energy rings

  for (let i = 0; i < 95; i++) stars.push(makeStar());
  for (let i = 0; i < 90; i++) rising.push(makeRising(true));

  function makeStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 2.4 + 0.4,
      hue: Math.random() < 0.65
        ? Math.random() * 18 + 2        // yin: deep red
        : Math.random() * 22 + 12,      // yang: orange
      waveOff: Math.random() * Math.PI * 2,
      base: Math.random() * 0.35 + 0.1
    };
  }

  function makeRising(rand = false) {
    const yin = Math.random() < 0.38;
    return {
      yin,
      x:  W * (0.02 + Math.random() * 0.96),
      y:  rand ? Math.random() * H : H + 5,
      vx: (Math.random() - 0.5) * (yin ? 0.5 : 1.9),
      vy: yin ? -(Math.random() * 0.9 + 0.35)
              : -(Math.random() * 3.2 + 1.4),
      size: yin ? Math.random() * 9 + 5
                : Math.random() * 2.6 + 0.5,
      life:  rand ? Math.random() * 0.65 : 0,
      speed: yin ? 0.0028 : Math.random() * 0.007 + 0.005,
      hue:   yin ? Math.random() * 12 + 0
                 : Math.random() * 24 + 8,
      wobble: Math.random() * Math.PI * 2,
      wSpd:   (Math.random() - 0.5) * 0.09
    };
  }

  function makeRing() {
    return {
      x: W * (0.08 + Math.random() * 0.84),
      y: H * (0.08 + Math.random() * 0.84),
      r: 2, maxR: Math.random() * 90 + 35,
      life: 0, speed: 0.007 + Math.random() * 0.007,
      hue: Math.random() * 22 + 4,
      lw: Math.random() * 1.4 + 0.4
    };
  }

  let t = 0;
  let running = true;

  function loopGate() {
    if (!running) return;
    t++;
    ctx.clearRect(0, 0, W, H);

    /* ── 1. STAR FIELD with flowing Taiji wave ── */
    const wt = t * 0.007;
    for (const s of stars) {
      // Wave travels left→right carrying brightness
      const pulse = Math.sin(wt - s.x * 0.0045 + s.waveOff);
      const alpha = Math.max(0, s.base + pulse * s.base * 0.95);
      const sz    = Math.max(0.1, s.size * (0.55 + (pulse + 1) * 0.28));
      ctx.shadowColor = `hsl(${s.hue}, 100%, 65%)`;
      ctx.shadowBlur  = sz * 3.5;
      ctx.fillStyle   = `hsla(${s.hue}, 100%, 75%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    /* ── 2. CHI RINGS ── */
    if (Math.random() < 0.018) rings.push(makeRing());
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.life += r.speed;
      r.r = r.maxR * r.life;
      if (r.life >= 1) { rings.splice(i, 1); continue; }
      const a = Math.sin(r.life * Math.PI) * 0.55;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${r.hue}, 100%, 62%, ${a})`;
      ctx.lineWidth   = r.lw * (1 - r.life * 0.6);
      ctx.shadowColor = `hsl(${r.hue}, 100%, 55%)`;
      ctx.shadowBlur  = 10;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }

    /* ── 3. YIN / YANG RISING PARTICLES ── */
    if (Math.random() < 0.78) rising.push(makeRising());

    // Taiji chi burst every ~5s — spirals outward from center
    if (t % 300 === 0) {
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const spd = Math.random() * 3.5 + 1.8;
        rising.push({
          yin: false,
          x: W * 0.5, y: H * 0.55,
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 1.5,
          size: Math.random() * 2.2 + 0.8,
          life: 0, speed: 0.02,
          hue: Math.random() * 22 + 5,
          wobble: a, wSpd: 0
        });
      }
      rings.push({ x: W*0.5, y: H*0.55, r:5, maxR:160, life:0, speed:0.012, hue:10, lw:1.5 });
    }

    for (let i = rising.length - 1; i >= 0; i--) {
      const p = rising[i];
      p.wobble += p.wSpd;
      p.x += p.vx + Math.sin(p.wobble) * 0.5;
      p.y += p.vy;
      p.life += p.speed;
      if (p.life >= 1) { rising.splice(i, 1); continue; }

      const alpha = Math.sin(p.life * Math.PI);

      if (p.yin) {
        // YIN — large soft dark-crimson orb (heavy, slow, deep glow)
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        g.addColorStop(0,   `hsla(${p.hue}, 90%, 52%, ${alpha * 0.55})`);
        g.addColorStop(0.5, `hsla(${p.hue}, 80%, 32%, ${alpha * 0.22})`);
        g.addColorStop(1,   'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      } else {
        // YANG — sharp bright spark (fast, intense, fiery)
        ctx.shadowColor = `hsl(${p.hue}, 100%, 68%)`;
        ctx.shadowBlur  = p.size * 7;
        ctx.fillStyle   = `hsla(${p.hue}, 100%, 80%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    requestAnimationFrame(loopGate);
  }
  loopGate();

  // Only stop when the FADE-OUT animation ends (user clicked Enter), not gateReveal
  gateEl.addEventListener('animationend', (e) => {
    if (e.animationName === 'gateFadeOut') running = false;
  });
}





/* ════════════════════════════════════════════════════════════
   MAIN SITE — Filter + Scroll Reveal
════════════════════════════════════════════════════════════ */

// Filter tabs
const filterBtns = document.querySelectorAll('.filter-btn');
const themeCards = document.querySelectorAll('.theme-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    themeCards.forEach(card => {
      card.classList.toggle('hidden-card', f !== 'all' && card.dataset.category !== f);
    });
  });
});

// Scroll reveal
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

function initReveal() {
  themeCards.forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${i * 0.09}s, transform 0.6s ease ${i * 0.09}s`;
    revealObs.observe(card);
  });
}
setTimeout(initReveal, 1000);

/* ═══════════════════════════════════════════════════════════
   HERO SHOWCASE — cards are pure HTML/CSS, no canvas needed
═══════════════════════════════════════════════════════════ */


/* ════════════════════════════════════════════════════════════
   LAZY IFRAME LOADER — load iframes only when scrolled into view
════════════════════════════════════════════════════════════ */
(function lazyLoadIframes() {
  const iframeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const iframe = entry.target;
      const src = iframe.getAttribute('data-src');
      if (src && !iframe.src) {
        iframe.src = src;
      }
      iframeObs.unobserve(iframe);
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('iframe[data-src]').forEach(el => iframeObs.observe(el));
})();

/* ════════════════════════════════════════════════════════════
   PAGE VISIBILITY — pause all animations when tab is hidden
════════════════════════════════════════════════════════════ */
document.addEventListener('visibilitychange', () => {
  const paused = document.hidden ? 'paused' : 'running';
  document.querySelectorAll('.orb, .fire-dot, .gate-enter-btn, .logo-dragon')
    .forEach(el => { el.style.animationPlayState = paused; });
});

/* ── Dragon Collection — per-letter bounce animation ── */
(function() {
  const el = document.querySelector('.hero-word-collection');
  if (!el) return;
  const text = el.textContent.trim();
  el.textContent = '';
  text.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'dragon-letter';
    span.textContent = ch;
    // stagger each letter: delay cycles so they wave like a dragon body
    span.style.animationDelay = `${(i * 0.18) % 2}s`;
    el.appendChild(span);
  });
})();

// ── Throttled scroll for nav active link ──
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');
let _scrollTick = false;
window.addEventListener('scroll', () => {
  if (_scrollTick) return;
  _scrollTick = true;
  requestAnimationFrame(() => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.id; });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${cur}` ? 'var(--orange-hot)' : '';
    });
    _scrollTick = false;
  });
}, { passive: true });

/* ════════════════════════════════════════════════════════════
   BLOCK HORIZONTAL SCROLL — mobile & desktop
   Detects any touch or scroll that goes outside the viewport
   and clamps it back to 0. Also fixes any overflowing element.
════════════════════════════════════════════════════════════ */
(function lockHorizontalScroll() {
  // 1. Always reset scrollX to 0
  window.addEventListener('scroll', function () {
    if (window.scrollX !== 0) {
      window.scrollTo(0, window.scrollY);
    }
  }, { passive: true });

  // 2. Block horizontal touch movement
  let _startX = 0;
  let _startY = 0;

  document.addEventListener('touchstart', function (e) {
    _startX = e.touches[0].clientX;
    _startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    const dx = Math.abs(e.touches[0].clientX - _startX);
    const dy = Math.abs(e.touches[0].clientY - _startY);
    // If the user is swiping more horizontally than vertically — block it
    if (dx > dy && dx > 5) {
      e.preventDefault();
    }
  }, { passive: false });

  // 3. Find & auto-fix any element wider than the viewport
  function fixOverflowingElements() {
    const vw = document.documentElement.clientWidth;
    document.querySelectorAll('*').forEach(function (el) {
      const rect = el.getBoundingClientRect();
      // If element right edge is beyond viewport
      if (rect.right > vw + 2) {
        el.style.maxWidth  = '100%';
        el.style.overflowX = 'hidden';
      }
    });
  }

  // Run once after load — no need to repeat
  window.addEventListener('load', fixOverflowingElements, { once: true });

  // Throttled resize
  let _resizeTick = false;
  window.addEventListener('resize', () => {
    if (_resizeTick) return;
    _resizeTick = true;
    setTimeout(() => { fixOverflowingElements(); _resizeTick = false; }, 200);
  });
})();
