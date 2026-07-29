// ============================================================
// DINESH RAM S P — PORTFOLIO MAIN JS
// ============================================================

(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isProjectPage = location.pathname.includes('/projects/');
  const rootPrefix = isProjectPage ? '../' : './';

  // ---------------------------------------------------------
  // THEME MANAGEMENT
  // ---------------------------------------------------------
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
  const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(savedTheme);

  function toggleTheme(originEvent) {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    const doSwap = () => { applyTheme(next); localStorage.setItem('theme', next); };

    if (prefersReduced || !document.startViewTransition) { doSwap(); return; }

    let x = window.innerWidth - 40, y = 30;
    if (originEvent && originEvent.currentTarget) {
      const rect = originEvent.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top  + rect.height / 2;
    }
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(doSwap);
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 480, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  }

  // ---------------------------------------------------------
  // AURORA ATMOSPHERIC ENGINE
  //
  // System 1 — Continuous autonomous atmospheric evolution (always alive).
  //            Momentum-based random walks. No sine waves. No repeating
  //            patterns. Each band independently stretches, folds, drifts,
  //            breathes. Bands fade in, sustain, and fade out like regions
  //            of aurora appearing and disappearing.
  //
  // System 2 — Mouse as a local magnetic disturbance (secondary, decoupled).
  //            Nearby light bends, swirls, stretches, compresses and ripples
  //            softly. The disturbance dissipates. System 1 continues beneath
  //            it completely unaffected.
  //
  // Colour — Deep teal (#0f766e) through emerald teal, brand teal (#00E6C3),
  //          bright cyan (#22d3ee), brand cyan (#2DD4FF), soft aqua (#67e8f9).
  //          Bands independently blend through the palette over time.
  // ---------------------------------------------------------
  function initAuroraCanvas() {
    const bgContainer = document.querySelector('.ambient-bg');
    if (!bgContainer) return;

    let canvas = document.getElementById('auroraCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'auroraCanvas';
      canvas.className = 'aurora-canvas';
      bgContainer.insertBefore(canvas, bgContainer.firstChild);
    }

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Smoothed mouse state
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0 };
    window.addEventListener('mousemove', (e) => {
      mouse.vx = (e.clientX - mouse.x) * 0.45 + mouse.vx * 0.55;
      mouse.vy = (e.clientY - mouse.y) * 0.45 + mouse.vy * 0.55;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    // Teal → Cyan colour palette
    const PAL = [
      [15,  118, 110],  // #0f766e  deep teal
      [17,  155, 140],  // mid teal
      [20,  184, 166],  // #14b8a6  emerald teal
      [0,   210, 180],  // teal-aqua bridge
      [0,   230, 195],  // #00E6C3  brand accent teal
      [34,  211, 238],  // #22d3ee  bright cyan
      [45,  212, 255],  // #2DD4FF  brand accent-2 cyan
      [103, 232, 249],  // #67e8f9  soft aqua highlight
    ];

    function rnd(lo, hi) { return lo + Math.random() * (hi - lo); }
    function jit(s)       { return (Math.random() - 0.5) * s; }

    function makeBand(ageOffset) {
      const ci1 = Math.floor(Math.random() * PAL.length);
      const ci2 = (ci1 + 1 + Math.floor(Math.random() * (PAL.length - 1))) % PAL.length;
      return {
        x: rnd(W * -0.1, W * 1.1),
        y: rnd(-H * 0.22, H * -0.02),
        w: rnd(90, 260),
        h: rnd(H * 0.38, H * 0.72),
        tw: rnd(90, 260),
        th: rnd(H * 0.38, H * 0.72),
        lean: jit(0.14), leanTarget: jit(0.14),
        vx: jit(0.10),   vy: jit(0.025),
        ax: 0,            ay: 0,
        alpha: 0,
        peakAlpha: rnd(0.14, 0.30),
        fadeIn:  Math.floor(rnd(250, 500)),
        fadeOut: Math.floor(rnd(350, 600)),
        age: ageOffset || 0,
        lifespan: Math.floor(rnd(4500, 11000)),
        ci1, ci2,
        ct: Math.random(),
        cs: rnd(0.00018, 0.00042),
        // Mouse disturbance (System 2 — fully decoupled from System 1)
        dx: 0, dy: 0, dvx: 0, dvy: 0, dw: 0,
      };
    }

    const MAX_BANDS = 8;
    let bands = [];
    for (let i = 0; i < MAX_BANDS; i++) {
      const b = makeBand(Math.random() * 3000);
      b.alpha = Math.random() * b.peakAlpha * 0.7;
      bands.push(b);
    }

    let frame = 0, nextSpawn = 300;

    function updateBand(b) {
      b.age++;

      // ── System 1: Autonomous atmospheric motion ──────────────
      // Small random accelerations accumulate into organic non-repeating drift.
      b.ax += jit(0.007); b.ay += jit(0.0025);
      b.ax *= 0.93;       b.ay *= 0.93;
      b.vx = (b.vx + b.ax) * 0.989;
      b.vy = (b.vy + b.ay) * 0.989;
      b.x += b.vx;
      b.y += b.vy;

      // Stretching / contracting
      b.w += (b.tw - b.w) * 0.0035;
      b.h += (b.th - b.h) * 0.0028;
      if (Math.random() < 0.004) b.tw = rnd(90, 260);
      if (Math.random() < 0.003) b.th = rnd(H * 0.34, H * 0.76);

      // Folding / bending (lean evolution)
      b.lean += (b.leanTarget - b.lean) * 0.0025;
      if (Math.random() < 0.0035) b.leanTarget = jit(0.20);

      // Colour drift through teal-cyan spectrum
      b.ct += b.cs;
      if (b.ct >= 1) {
        b.ct = 0;
        b.ci1 = b.ci2;
        b.ci2 = Math.floor(Math.random() * PAL.length);
      }

      // Lifecycle opacity: fade in → gentle breathing → fade out
      let targetA;
      if (b.age < b.fadeIn) {
        targetA = b.peakAlpha * (b.age / b.fadeIn);
      } else if (b.age > b.lifespan - b.fadeOut) {
        targetA = b.peakAlpha * Math.max(0, (b.lifespan - b.age) / b.fadeOut);
      } else {
        // Slow irregular breathing — two incommensurable frequencies
        // ensure it never perfectly repeats
        const breathe = 0.72
          + 0.18 * Math.sin(b.age * 0.0013 + b.x * 0.001)
          + 0.10 * Math.sin(b.age * 0.0021 + b.y * 0.0007);
        targetA = b.peakAlpha * breathe;
      }
      b.alpha += (targetA - b.alpha) * 0.018;

      // ── System 2: Mouse magnetic disturbance (local, decoupled) ──
      // Cursor behaves like a weak field passing through mist.
      // Only nearby regions are disturbed; autonomous flow continues beneath.
      const cx = b.x + b.dx;
      const cy = b.y + b.h * 0.45 + b.dy;
      const d  = Math.hypot(cx - mouse.x, cy - mouse.y);
      const R  = 270;
      if (d < R) {
        const force = 1 - d / R;
        const spd   = Math.hypot(mouse.vx, mouse.vy);
        if (spd > 0.4) {
          b.dvx += mouse.vx * 0.025 * force;
          b.dvy += mouse.vy * 0.025 * force;
          b.dw  += spd * 0.35 * force;
        }
      }
      // Disturbance dissipates — band resumes its autonomous trajectory
      b.dx += b.dvx;  b.dy += b.dvy;
      b.dvx *= 0.89;  b.dvy *= 0.89;
      b.dx  *= 0.93;  b.dy  *= 0.93;
      b.dw  *= 0.91;

      return b.age < b.lifespan;
    }

    function drawBand(b) {
      if (b.alpha < 0.003) return;

      const p1 = PAL[b.ci1], p2 = PAL[b.ci2], t = b.ct;
      const r  = Math.round(p1[0] + (p2[0] - p1[0]) * t);
      const g  = Math.round(p1[1] + (p2[1] - p1[1]) * t);
      const bl = Math.round(p1[2] + (p2[2] - p1[2]) * t);

      const cx = b.x + b.dx;
      const cy = b.y + b.dy;
      const bw = Math.max(18, b.w + b.dw);
      const bh = b.h;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(b.lean);
      ctx.translate(-cx, -cy);

      const grad = ctx.createLinearGradient(cx, cy, cx, cy + bh);
      grad.addColorStop(0.00, `rgba(${r},${g},${bl},0)`);
      grad.addColorStop(0.10, `rgba(${r},${g},${bl},${b.alpha.toFixed(4)})`);
      grad.addColorStop(0.50, `rgba(${r},${g},${bl},${(b.alpha * 0.88).toFixed(4)})`);
      grad.addColorStop(0.82, `rgba(${r},${g},${bl},${(b.alpha * 0.45).toFixed(4)})`);
      grad.addColorStop(1.00, `rgba(${r},${g},${bl},0)`);

      ctx.fillStyle = grad;
      // Tall ellipse (height >> width) = vertical curtain of suspended light.
      // CSS blur(45px) on the canvas softens all edges into atmospheric diffusion.
      ctx.beginPath();
      ctx.ellipse(cx, cy + bh * 0.5, bw * 0.5, bh * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen'; // overlapping bands add luminously

      mouse.vx *= 0.82;
      mouse.vy *= 0.82;

      frame++;

      bands = bands.filter(b => updateBand(b));

      if (frame >= nextSpawn && bands.length < MAX_BANDS) {
        bands.push(makeBand(0));
        nextSpawn = frame + Math.floor(rnd(220, 420));
      }

      bands.forEach(drawBand);

      if (!prefersReduced) requestAnimationFrame(render);
    }

    if (prefersReduced) { render(); }
    else                 { requestAnimationFrame(render); }
  }

  // ---------------------------------------------------------
  // PARTIALS (nav + footer)
  // ---------------------------------------------------------
  async function loadPartial(url, mountSelector) {
    const mount = document.querySelector(mountSelector);
    if (!mount) return;
    try {
      const res = await fetch(url);
      const html = await res.text();
      mount.innerHTML = html;
    } catch (e) {
      console.error('Partial load failed:', url, e);
    }
  }

  function rewriteNavLinks() {
    document.querySelectorAll('[data-section-link]').forEach((a) => {
      const section = a.getAttribute('data-section-link');
      a.setAttribute('href', isProjectPage ? `../index.html#${section}` : `#${section}`);
    });
    document.querySelectorAll('[data-home-link]').forEach((a) => {
      a.setAttribute('href', isProjectPage ? '../index.html' : './index.html');
    });
    document.querySelectorAll('[data-asset-link]').forEach((a) => {
      const rel = a.getAttribute('data-asset-link');
      a.setAttribute('href', rootPrefix + rel);
    });
  }

  // ---------------------------------------------------------
  // HEADER: Sticky hide/reveal + ScrollSpy active link
  // ---------------------------------------------------------
  function wireNav() {
    rewriteNavLinks();

    const menuBtn    = document.getElementById('menuBtn');
    const menuClose  = document.getElementById('menuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click',  () => mobileMenu.classList.add('open'));
      menuClose.addEventListener('click',() => mobileMenu.classList.remove('open'));
      mobileMenu.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => mobileMenu.classList.remove('open'))
      );
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', e => toggleTheme(e));

    const searchTrigger = document.getElementById('searchTrigger');
    if (searchTrigger) searchTrigger.addEventListener('click', () => openPalette());

    const navHeader = document.getElementById('navHeader');
    if (navHeader) {
      let lastScrollY = window.scrollY;
      window.addEventListener('scroll', () => {
        const currentY = window.scrollY;
        navHeader.classList.toggle('scrolled', currentY > 10);
        if (currentY > 140 && currentY - lastScrollY > 8) {
          navHeader.classList.add('nav-hidden');
        } else if (lastScrollY - currentY > 6 || currentY < 80) {
          navHeader.classList.remove('nav-hidden');
        }
        lastScrollY = currentY;
      }, { passive: true });
    }

    if (!isProjectPage) initScrollSpy();
  }

  function initScrollSpy() {
    const sectionIds = ['about','skills','projects','publication','leadership','credentials','education','contact'];
    const navAnchors = document.querySelectorAll('.nav-links a[data-section-link], .mobile-menu a[data-section-link]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAnchors.forEach(a => {
            const ls = a.getAttribute('data-section-link');
            if (ls === id || (id === 'education' && ls === 'certifications')) {
              a.classList.add('active');
            } else {
              a.classList.remove('active');
            }
          });
        }
      });
    }, { threshold: 0.25, rootMargin: '-10% 0px -40% 0px' });

    sectionIds.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
  }

  // ---------------------------------------------------------
  // BUTTON INTERACTIONS (magnetic hover + spotlight shimmer)
  // ---------------------------------------------------------
  function initMagneticButtons() {
    if (prefersReduced) return;
    document.querySelectorAll('.btn, .nav-cta, .search-trigger, .theme-toggle').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        btn.style.setProperty('--btn-x', `${(x / rect.width)  * 100}%`);
        btn.style.setProperty('--btn-y', `${(y / rect.height) * 100}%`);
        const dx = (x - rect.width / 2)  * 0.12;
        const dy = (y - rect.height / 2) * 0.12;
        btn.style.transform = `translate3d(${dx}px,${dy}px,0) scale(1.015)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0,0,0) scale(1)';
      });
    });
  }

  // ---------------------------------------------------------
  // CARD INTERACTIONS (3D parallax tilt + radial spotlight)
  // ---------------------------------------------------------
  function initCardTilt() {
    if (prefersReduced) return;
    document.querySelectorAll('.project-card, .pub-card, .lead-card, .stat-item').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        const rx = -((y - rect.height / 2) / rect.height) * 6;
        const ry =  ((x - rect.width  / 2) / rect.width)  * 6;
        card.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // ---------------------------------------------------------
  // STAGGERED REVEAL INDEXING
  // ---------------------------------------------------------
  function initStaggeredReveals() {
    document.querySelectorAll('.chip-row, .projects-grid, .stats-inner, .skills-tiers').forEach(container => {
      Array.from(container.children).forEach((child, i) => child.style.setProperty('--i', i));
    });
  }

  // ---------------------------------------------------------
  // SCROLL REVEAL
  // ---------------------------------------------------------
  function initReveal() {
    const revealEls = document.querySelectorAll('.reveal, .site-footer');
    if (prefersReduced) { revealEls.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  // ---------------------------------------------------------
  // IMAGE FALLBACKS
  // ---------------------------------------------------------
  function initImageFallbacks() {
    document.querySelectorAll('img[data-fallback-icon]').forEach(img => {
      img.addEventListener('error', function handler() {
        const wrap = img.closest('.project-cover, .proj-cover-hero');
        if (wrap) {
          wrap.classList.add('img-fallback');
          wrap.setAttribute('data-icon',  img.getAttribute('data-fallback-icon'));
          wrap.setAttribute('data-label', img.getAttribute('data-fallback-label') || 'Cover pending');
          img.remove();
        }
        img.removeEventListener('error', handler);
      });
    });
  }

  // ---------------------------------------------------------
  // COMMAND PALETTE (Cmd / Ctrl + K)
  // ---------------------------------------------------------
  const PALETTE_ITEMS = [
    { label: 'About',               tag: 'Section',  href: () => isProjectPage ? '../index.html#about'          : '#about' },
    { label: 'Skills',              tag: 'Section',  href: () => isProjectPage ? '../index.html#skills'         : '#skills' },
    { label: 'Projects',            tag: 'Section',  href: () => isProjectPage ? '../index.html#projects'       : '#projects' },
    { label: 'Research Publication',tag: 'Section',  href: () => isProjectPage ? '../index.html#publication'    : '#publication' },
    { label: 'Leadership',          tag: 'Section',  href: () => isProjectPage ? '../index.html#leadership'     : '#leadership' },
    { label: 'Certifications',      tag: 'Section',  href: () => isProjectPage ? '../index.html#certifications' : '#certifications' },
    { label: 'Education',           tag: 'Section',  href: () => isProjectPage ? '../index.html#education'      : '#education' },
    { label: 'Contact',             tag: 'Section',  href: () => isProjectPage ? '../index.html#contact'        : '#contact' },
    { label: 'Smart Water IoT Monitoring System', tag: 'Project', href: () => isProjectPage ? 'smart-water-quality-monitoring.html'    : 'projects/smart-water-quality-monitoring.html' },
    { label: 'Land Cover Classification (GCP)',   tag: 'Project', href: () => isProjectPage ? 'land-cover-classification-gcp.html'     : 'projects/land-cover-classification-gcp.html' },
    { label: 'Oral Cancer Classification',        tag: 'Project', href: () => isProjectPage ? 'oral-cancer-classification.html'        : 'projects/oral-cancer-classification.html' },
    { label: 'Download Resume',  tag: 'File',     href: () => rootPrefix + 'assets/Dinesh_Ram_S_P_Resume.pdf' },
    { label: 'GitHub Profile',   tag: 'External', href: () => 'https://github.com/Dreamfyre23' },
    { label: 'LinkedIn Profile', tag: 'External', href: () => 'https://www.linkedin.com/in/dineshramsp' },
  ];

  let paletteOpen = false, activeIndex = 0, filteredItems = PALETTE_ITEMS;

  function buildPaletteDOM() {
    if (document.getElementById('cmdkOverlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'cmdk-overlay';
    overlay.id = 'cmdkOverlay';
    overlay.innerHTML = `
      <div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Quick navigation">
        <div class="cmdk-input-row">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="cmdkInput" type="text" placeholder="Jump to a section, project, or link…" autocomplete="off" />
          <kbd style="font-family:var(--font-mono);font-size:11px;color:var(--text-dimmer);border:1px solid var(--border);border-radius:4px;padding:1px 6px;">Esc</kbd>
        </div>
        <div class="cmdk-list" id="cmdkList"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closePalette(); });
    document.getElementById('cmdkInput').addEventListener('input', e => filterPalette(e.target.value));
    document.addEventListener('keydown', e => {
      if (!paletteOpen) return;
      if (e.key === 'Escape')    { closePalette(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); moveActive(-1); }
      if (e.key === 'Enter')     { e.preventDefault(); selectActive(); }
    });
  }

  function renderPaletteList() {
    const list = document.getElementById('cmdkList');
    if (!list) return;
    if (filteredItems.length === 0) { list.innerHTML = `<div class="cmdk-empty">No matches found.</div>`; return; }
    list.innerHTML = filteredItems.map((item, i) => `
      <div class="cmdk-item ${i === activeIndex ? 'active' : ''}" data-index="${i}">
        <span class="cmdk-item-label">${item.label}</span>
        <span class="cmdk-item-tag">${item.tag}</span>
      </div>`).join('');
    list.querySelectorAll('.cmdk-item').forEach(el =>
      el.addEventListener('click', () => { activeIndex = parseInt(el.getAttribute('data-index'), 10); selectActive(); })
    );
  }

  function filterPalette(query) {
    const q = query.trim().toLowerCase();
    filteredItems = q ? PALETTE_ITEMS.filter(i => i.label.toLowerCase().includes(q)) : PALETTE_ITEMS;
    activeIndex = 0;
    renderPaletteList();
  }

  function moveActive(delta) {
    if (!filteredItems.length) return;
    activeIndex = (activeIndex + delta + filteredItems.length) % filteredItems.length;
    renderPaletteList();
  }

  function selectActive() {
    const item = filteredItems[activeIndex];
    if (item) window.location.href = item.href();
  }

  function openPalette() {
    buildPaletteDOM();
    filteredItems = PALETTE_ITEMS;
    activeIndex = 0;
    renderPaletteList();
    document.getElementById('cmdkOverlay').classList.add('open');
    paletteOpen = true;
    setTimeout(() => document.getElementById('cmdkInput').focus(), 50);
  }

  function closePalette() {
    const overlay = document.getElementById('cmdkOverlay');
    if (overlay) overlay.classList.remove('open');
    paletteOpen = false;
  }

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      paletteOpen ? closePalette() : openPalette();
    }
  });

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------
  document.addEventListener('DOMContentLoaded', async () => {
    await loadPartial(rootPrefix + 'assets/partials/nav.html',    '#navMount');
    await loadPartial(rootPrefix + 'assets/partials/footer.html', '#footerMount');
    wireNav();
    initAuroraCanvas();
    initMagneticButtons();
    initCardTilt();
    initStaggeredReveals();
    initReveal();
    initImageFallbacks();
  });
})();
