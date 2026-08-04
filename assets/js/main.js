// ============================================================
// DINESH RAM S P — PORTFOLIO MAIN JS
// Design foundation: Sathyam Auto Finance design language
// Background: Interactive glowing square grid (mouse-tracked)
// ============================================================

(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isProjectPage = location.pathname.includes('/projects/');
  const rootPrefix = isProjectPage ? '../' : './';

  // ---------------------------------------------------------
  // THEME MANAGEMENT — Radial clip-path transition
  // ---------------------------------------------------------
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }
  const savedTheme = localStorage.getItem('portfolio-theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(savedTheme);

  function toggleTheme(originEvent) {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';

    // Determine click origin — expressed as percentage strings for CSS custom props
    let ox = '50%', oy = '50%';
    if (originEvent && originEvent.currentTarget) {
      const rect = originEvent.currentTarget.getBoundingClientRect();
      ox = (((rect.left + rect.width  / 2) / window.innerWidth)  * 100).toFixed(1) + '%';
      oy = (((rect.top  + rect.height / 2) / window.innerHeight) * 100).toFixed(1) + '%';
    }

    const overlay = document.getElementById('theme-overlay');
    if (overlay && !prefersReduced) {
      const overlayColor = next === 'light' ? '#f0f2f8' : '#0d0f14';

      // Set origin via CSS custom properties — this is key: transform-origin reads
      // these vars in CSS, so it never conflicts with the transform transition itself.
      overlay.style.setProperty('--origin-x', ox);
      overlay.style.setProperty('--origin-y', oy);
      overlay.style.background = overlayColor;
      overlay.style.transform = 'scale(0)';
      overlay.style.transition = 'none';

      // Force reflow so browser registers the scale(0) start state
      overlay.offsetHeight;

      // Trigger the expanding animation (defined entirely in CSS)
      overlay.classList.add('expanding');

      // Switch theme halfway through the 550ms animation
      setTimeout(() => {
        applyTheme(next);
        localStorage.setItem('portfolio-theme', next);
        if (typeof updateGridColor === 'function') updateGridColor(next);
      }, 275);

      // Collapse after transition completes — transitionend is reliable here because
      // transform-origin is set via CSS vars (not inline), so there's no style conflict
      overlay.addEventListener('transitionend', function handler() {
        overlay.classList.remove('expanding');
        overlay.style.transform = 'scale(0)';
        overlay.removeEventListener('transitionend', handler);
      });

    } else {
      // Reduced motion — instant swap
      applyTheme(next);
      localStorage.setItem('portfolio-theme', next);
      if (typeof updateGridColor === 'function') updateGridColor(next);
    }
  }

  // ---------------------------------------------------------
  // INTERACTIVE SQUARE GRID CANVAS
  // Direct port of the Sathyam Auto Finance grid system —
  // every square brightens as the cursor approaches, creating
  // a glowing field of light that follows the mouse.
  //
  // Color: Crimson/red glow in dark mode; blue glow in light.
  // ---------------------------------------------------------
  let mouse = { x: -9999, y: -9999 };
  let currentGlow = { r: 230, g: 57,  b: 70  }; // crimson (dark)
  let targetGlow  = { r: 230, g: 57,  b: 70  };

  function updateGridColor(theme) {
    if (theme === 'light') {
      targetGlow = { r: 59, g: 130, b: 246 };  // blue glow in light mode
    } else {
      targetGlow = { r: 230, g: 57, b: 70 };   // crimson glow in dark mode
    }
  }
  updateGridColor(document.documentElement.getAttribute('data-theme'));

  function initGridCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let squares = [];
    let cols, rows, cellSize;
    let raf;
    let brightnesses = [];

    function isMobile() { return window.innerWidth < 768; }
    function isTablet() { return window.innerWidth < 1024; }

    function calcGrid() {
      const mobile = isMobile();
      const tablet = isTablet();
      cellSize = mobile ? 42 : tablet ? 52 : 64;
      cols = Math.ceil(canvas.width / cellSize) + 2;
      rows = Math.ceil(canvas.height / cellSize) + 2;

      brightnesses = [];
      squares = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          brightnesses.push(0);
          squares.push({ r, c });
        }
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
      calcGrid();
    }

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    function lerp(a, b, t) { return a + (b - a) * t; }

    const MAX_DIST = isMobile() ? 100 : 180;

    function draw() {
      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);

      // Smooth glow color transition between themes
      currentGlow.r = lerp(currentGlow.r, targetGlow.r, 0.04);
      currentGlow.g = lerp(currentGlow.g, targetGlow.g, 0.04);
      currentGlow.b = lerp(currentGlow.b, targetGlow.b, 0.04);

      const { r: gr, g: gg, b: gb } = currentGlow;
      const maxDist = isMobile() ? 100 : 180;
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

      for (let i = 0; i < squares.length; i++) {
        const { r, c } = squares[i];
        const x = c * cellSize - cellSize;
        const y = r * cellSize - cellSize;
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;

        const dist  = Math.hypot(cx - mouse.x, cy - mouse.y);
        const glow  = Math.max(0, 1 - dist / maxDist);
        const target = glow * glow; // quadratic falloff for sharper focus
        brightnesses[i] = lerp(brightnesses[i], target, 0.14);

        const brt = brightnesses[i];
        if (brt < 0.003) continue;

        // Base grid square (always very dim)
        const baseOpacity = isDark ? 0.03 : 0.04;
        ctx.fillStyle = isDark
          ? `rgba(255,255,255,${baseOpacity + brt * 0.18})`
          : `rgba(0,0,0,${baseOpacity + brt * 0.06})`;
        ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

        // Glow overlay on illuminated squares
        if (brt > 0.01) {
          ctx.fillStyle = `rgba(${gr},${gg},${gb},${brt * 0.75})`;
          ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

          // Inner bright core for squares very close to cursor
          if (brt > 0.25) {
            const coreSize = (cellSize - 1) * 0.6;
            const offset = (cellSize - coreSize) / 2;
            ctx.fillStyle = `rgba(${gr},${gg},${gb},${(brt - 0.25) * 0.5})`;
            ctx.fillRect(x + offset, y + offset, coreSize, coreSize);
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', () => { resize(); }, { passive: true });

    if (!prefersReduced) {
      raf = requestAnimationFrame(draw);
    } else {
      // Static render only — no animation
      draw();
      cancelAnimationFrame(raf);
    }
  }

  // ---------------------------------------------------------
  // PARTIALS (nav + footer)
  // ---------------------------------------------------------
  async function loadPartial(url, mountSelector) {
    const mount = document.querySelector(mountSelector);
    if (!mount) return;
    try {
      const res  = await fetch(url);
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
  // BUTTON INTERACTIONS — Cursor spotlight shimmer + spring lift
  // Same technique as the finance app: --btn-x/y CSS vars
  // drive the ::before radial gradient in CSS
  // ---------------------------------------------------------
  function initMagneticButtons() {
    if (prefersReduced) return;
    document.querySelectorAll('.btn, .nav-cta, .search-trigger').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty('--btn-x', `${(x / rect.width)  * 100}%`);
        btn.style.setProperty('--btn-y', `${(y / rect.height) * 100}%`);
        // Subtle magnetic push toward cursor
        const dx = (x - rect.width  / 2) * 0.10;
        const dy = (y - rect.height / 2) * 0.10;
        btn.style.transform = `translate3d(${dx}px,${dy}px,0)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // ---------------------------------------------------------
  // CARD INTERACTIONS — 3D tilt + radial cursor spotlight
  // Same as finance app: --mouse-x/y drive the ::after
  // radial gradient in CSS, creating a "light source" effect
  // ---------------------------------------------------------
  function initCardTilt() {
    if (prefersReduced) return;
    document.querySelectorAll('.project-card, .pub-card, .lead-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Update spotlight position
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        // 3D tilt
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
  // STAGGERED REVEAL INDEX — assigns --i custom property
  // so CSS transition-delay can cascade child elements
  // ---------------------------------------------------------
  function initStaggeredReveals() {
    document.querySelectorAll('.chip-row, .projects-grid, .stats-inner, .skills-tiers').forEach(container => {
      Array.from(container.children).forEach((child, i) => child.style.setProperty('--i', i));
    });
  }

  // ---------------------------------------------------------
  // SCROLL REVEAL — IntersectionObserver fade-in
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
    initGridCanvas();
    initMagneticButtons();
    initCardTilt();
    initStaggeredReveals();
    initReveal();
    initImageFallbacks();
  });
})();
