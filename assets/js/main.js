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
  // Rendering: Each band is a THICK quadratic-bezier stroke — a wide
  // sweeping arc ribbon of light spanning most of the screen width.
  // lineWidth 200–380 px, lineCap 'round', gradient fade along the arc.
  // CSS blur(60px) dissolves all edges into atmospheric diffusion.
  // screen-blend lets overlapping arcs brighten luminously.
  //
  // System 1 — Continuous autonomous drift.
  //   Control points and endpoints evolve via momentum random walks —
  //   no sine waves, no repeating period. The arch bulges and contracts,
  //   arcs drift laterally, thickness breathes. Bands fade in, sustain
  //   with organic breathing, then fade out. New bands replace dead ones.
  //
  // System 2 — Mouse as localised magnetic disturbance (decoupled).
  //   The cursor bends the nearest arc slightly. The disturbance decays.
  //   Autonomous drift continues completely beneath it.
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
    window.addEventListener('resize', () => { resize(); bands.forEach(b => resetBandGeometry(b)); }, { passive: true });

    // Smoothed mouse
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0 };
    window.addEventListener('mousemove', (e) => {
      mouse.vx = (e.clientX - mouse.x) * 0.4 + mouse.vx * 0.6;
      mouse.vy = (e.clientY - mouse.y) * 0.4 + mouse.vy * 0.6;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    // ── Teal-to-Cyan colour palette ──────────────────────────
    const PAL = [
      [10,  110, 100],  // deep teal
      [15,  150, 130],  // mid teal
      [20,  184, 166],  // #14b8a6 emerald teal
      [0,   200, 170],  // teal-bridge
      [0,   230, 195],  // #00E6C3 brand accent teal
      [34,  211, 238],  // #22d3ee bright cyan
      [45,  212, 255],  // #2DD4FF brand accent-2 cyan
      [103, 232, 249],  // #67e8f9 soft aqua
    ];

    function rnd(lo, hi) { return lo + Math.random() * (hi - lo); }
    function jit(s)       { return (Math.random() - 0.5) * s; }

    // ── Band factory ─────────────────────────────────────────
    // Each band is a thick arc ribbon defined by two endpoints and a
    // bezier control point. The control point sits ABOVE the midpoint
    // of the two endpoints, creating the natural upward arch of aurora.
    function resetBandGeometry(b) {
      // Endpoints: arc sweeps from left side to right side of screen
      // with slight vertical stagger to create depth
      b.x1   = rnd(-W * 0.25, W * 0.30);
      b.y1   = rnd(-H * 0.05, H * 0.45);
      b.x2   = rnd(W * 0.70, W * 1.25);
      b.y2   = rnd(-H * 0.05, H * 0.45);
      // Control point: pulled upward to create the arch / sweep curvature
      b.cpx  = rnd(W * 0.25, W * 0.75);
      b.cpy  = rnd(-H * 0.30, H * 0.08);
      // Velocity and acceleration for each control point (random walk)
      b.vy1  = jit(0.04);  b.ay1  = 0;
      b.vy2  = jit(0.04);  b.ay2  = 0;
      b.vcpy = jit(0.06);  b.acpy = 0;
      b.vcpx = jit(0.04);  b.acpx = 0;
      b.vx1  = jit(0.03);  b.ax1  = 0;
      b.vx2  = jit(0.03);  b.ax2  = 0;
      return b;
    }

    function makeBand(ageOffset) {
      const ci1 = Math.floor(Math.random() * PAL.length);
      const ci2 = (ci1 + 1 + Math.floor(Math.random() * (PAL.length - 1))) % PAL.length;
      const b = {
        // Geometry — set by resetBandGeometry
        x1:0, y1:0, x2:0, y2:0, cpx:0, cpy:0,
        vy1:0, ay1:0, vy2:0, ay2:0,
        vcpy:0, acpy:0, vcpx:0, acpx:0,
        vx1:0, ax1:0, vx2:0, ax2:0,
        // Stroke thickness (width of the sweeping ribbon)
        thickness: rnd(200, 380),
        tThickness: rnd(200, 380),
        // Opacity lifecycle
        alpha: 0,
        peakAlpha: rnd(0.22, 0.42),
        fadeIn:    Math.floor(rnd(400, 700)),
        fadeOut:   Math.floor(rnd(500, 800)),
        age:       ageOffset || 0,
        lifespan:  Math.floor(rnd(6000, 14000)),
        // Colour
        ci1, ci2,
        ct: Math.random(),
        cs: rnd(0.00012, 0.00032),
        // Mouse disturbance offsets (System 2 — decoupled from System 1)
        dCpx: 0, dCpy: 0, dvCpx: 0, dvCpy: 0,
        dY1: 0, dY2: 0, dvY1: 0, dvY2: 0,
      };
      resetBandGeometry(b);
      return b;
    }

    const MAX_BANDS = 4;
    let bands = [];
    // Initialise with staggered ages so they don't all peak together
    for (let i = 0; i < MAX_BANDS; i++) {
      const b = makeBand(Math.random() * 4000);
      b.alpha = Math.random() * b.peakAlpha * 0.6;
      bands.push(b);
    }

    let frame = 0, nextSpawn = 500;

    // ── Per-frame update ──────────────────────────────────────
    function updateBand(b) {
      b.age++;

      // ═══ System 1 — Autonomous atmospheric evolution ══════
      // Endpoints drift slowly (the arc translates over time)
      b.ay1 += jit(0.005); b.ay1 *= 0.93; b.vy1 = (b.vy1 + b.ay1) * 0.988; b.y1 += b.vy1;
      b.ay2 += jit(0.005); b.ay2 *= 0.93; b.vy2 = (b.vy2 + b.ay2) * 0.988; b.y2 += b.vy2;
      b.ax1 += jit(0.004); b.ax1 *= 0.94; b.vx1 = (b.vx1 + b.ax1) * 0.990; b.x1 += b.vx1;
      b.ax2 += jit(0.004); b.ax2 *= 0.94; b.vx2 = (b.vx2 + b.ax2) * 0.990; b.x2 += b.vx2;

      // Control point drifts (arch height breathes, sweeping shape morphs)
      b.acpy += jit(0.012); b.acpy *= 0.92; b.vcpy = (b.vcpy + b.acpy) * 0.986; b.cpy += b.vcpy;
      b.acpx += jit(0.006); b.acpx *= 0.94; b.vcpx = (b.vcpx + b.acpx) * 0.989; b.cpx += b.vcpx;

      // Thickness morphing (ribbon breathes wider and narrower)
      b.thickness += (b.tThickness - b.thickness) * 0.004;
      if (Math.random() < 0.003) b.tThickness = rnd(180, 400);

      // Colour interpolation
      b.ct += b.cs;
      if (b.ct >= 1) {
        b.ct = 0;
        b.ci1 = b.ci2;
        b.ci2 = Math.floor(Math.random() * PAL.length);
      }

      // Opacity lifecycle: fade-in → organic breathing sustain → fade-out
      let targetA;
      if (b.age < b.fadeIn) {
        targetA = b.peakAlpha * (b.age / b.fadeIn);
      } else if (b.age > b.lifespan - b.fadeOut) {
        targetA = b.peakAlpha * Math.max(0, (b.lifespan - b.age) / b.fadeOut);
      } else {
        // Two incommensurable breathing frequencies → never perfectly repeats
        const breathe = 0.70
          + 0.20 * Math.sin(b.age * 0.00095 + b.x1 * 0.0005)
          + 0.10 * Math.sin(b.age * 0.00173 + b.cpy * 0.0004);
        targetA = b.peakAlpha * breathe;
      }
      b.alpha += (targetA - b.alpha) * 0.015;

      // ═══ System 2 — Mouse magnetic disturbance (decoupled) ════
      // Find the midpoint of the arc and check proximity to cursor
      const midX = 0.5 * b.x1 + 0.5 * b.x2;
      const midY = 0.25 * b.y1 + 0.5 * b.cpy + 0.25 * b.y2;
      const dist = Math.hypot(midX - mouse.x, midY - mouse.y);
      const R = 300;
      if (dist < R) {
        const force = (1 - dist / R);
        const spd   = Math.hypot(mouse.vx, mouse.vy);
        if (spd > 0.5) {
          // Bend the control point and tug the nearest endpoint
          b.dvCpy += mouse.vy * 0.06 * force;
          b.dvCpx += mouse.vx * 0.04 * force;
          b.dvY1  += mouse.vy * 0.025 * force;
          b.dvY2  += mouse.vy * 0.025 * force;
        }
      }
      // Disturbance decays — arc springs back to autonomous path
      b.dCpx += b.dvCpx; b.dCpy += b.dvCpy;
      b.dY1  += b.dvY1;  b.dY2  += b.dvY2;
      b.dvCpx *= 0.88;   b.dvCpy *= 0.88;
      b.dvY1  *= 0.90;   b.dvY2  *= 0.90;
      b.dCpx  *= 0.92;   b.dCpy  *= 0.92;
      b.dY1   *= 0.93;   b.dY2   *= 0.93;

      return b.age < b.lifespan;
    }

    // ── Per-frame draw ────────────────────────────────────────
    function drawBand(b) {
      if (b.alpha < 0.004) return;

      // Interpolate colour
      const p1 = PAL[b.ci1], p2 = PAL[b.ci2], t = b.ct;
      const r  = Math.round(p1[0] + (p2[0] - p1[0]) * t);
      const g  = Math.round(p1[1] + (p2[1] - p1[1]) * t);
      const bl = Math.round(p1[2] + (p2[2] - p1[2]) * t);

      // Apply disturbance offsets on top of autonomous position
      const ax1  = b.x1,  ay1  = b.y1  + b.dY1;
      const ax2  = b.x2,  ay2  = b.y2  + b.dY2;
      const acpx = b.cpx + b.dCpx;
      const acpy = b.cpy + b.dCpy;

      // Gradient runs from start-point to end-point of the arc,
      // fading in at the left and out at the right with a peak in between.
      // This mimics how real aurora ribbons are brightest in the middle
      // and dissolve toward the edges of each curtain.
      const grad = ctx.createLinearGradient(ax1, ay1, ax2, ay2);
      grad.addColorStop(0.00, `rgba(${r},${g},${bl},0)`);
      grad.addColorStop(0.18, `rgba(${r},${g},${bl},${b.alpha.toFixed(4)})`);
      grad.addColorStop(0.50, `rgba(${r},${g},${bl},${(b.alpha * 0.92).toFixed(4)})`);
      grad.addColorStop(0.82, `rgba(${r},${g},${bl},${(b.alpha * 0.70).toFixed(4)})`);
      grad.addColorStop(1.00, `rgba(${r},${g},${bl},0)`);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ax1, ay1);
      ctx.quadraticCurveTo(acpx, acpy, ax2, ay2);
      // The thick stroke IS the aurora ribbon — lineWidth controls its height
      ctx.lineWidth   = b.thickness;
      ctx.lineCap     = 'round';   // natural dissolving ends, no hard cut-offs
      ctx.strokeStyle = grad;
      ctx.stroke();
      ctx.restore();
    }

    // ── Render loop ───────────────────────────────────────────
    function render() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen'; // overlapping arcs add luminously

      mouse.vx *= 0.80;
      mouse.vy *= 0.80;

      frame++;

      bands = bands.filter(b => updateBand(b));

      if (frame >= nextSpawn && bands.length < MAX_BANDS) {
        bands.push(makeBand(0));
        nextSpawn = frame + Math.floor(rnd(300, 600));
      }

      // Sort by alpha ascending so brightest arcs render on top
      bands.sort((a, b) => a.alpha - b.alpha);
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
      menuBtn.addEventListener('click',   () => mobileMenu.classList.add('open'));
      menuClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
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
            a.classList.toggle('active', ls === id || (id === 'education' && ls === 'certifications'));
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
        const dx = (x - rect.width  / 2) * 0.12;
        const dy = (y - rect.height / 2) * 0.12;
        btn.style.transform = `translate3d(${dx}px,${dy}px,0) scale(1.015)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
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
        card.style.transform = '';
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
    { label: 'About',                tag: 'Section',  href: () => isProjectPage ? '../index.html#about'          : '#about' },
    { label: 'Skills',               tag: 'Section',  href: () => isProjectPage ? '../index.html#skills'         : '#skills' },
    { label: 'Projects',             tag: 'Section',  href: () => isProjectPage ? '../index.html#projects'       : '#projects' },
    { label: 'Research Publication', tag: 'Section',  href: () => isProjectPage ? '../index.html#publication'    : '#publication' },
    { label: 'Leadership',           tag: 'Section',  href: () => isProjectPage ? '../index.html#leadership'     : '#leadership' },
    { label: 'Certifications',       tag: 'Section',  href: () => isProjectPage ? '../index.html#certifications' : '#certifications' },
    { label: 'Education',            tag: 'Section',  href: () => isProjectPage ? '../index.html#education'      : '#education' },
    { label: 'Contact',              tag: 'Section',  href: () => isProjectPage ? '../index.html#contact'        : '#contact' },
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
