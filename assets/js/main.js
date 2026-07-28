// ============================================================
// DINESH RAM S P — PORTFOLIO MAIN JS (MOTION & INTERACTION ENHANCED)
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

    const doSwap = () => {
      applyTheme(next);
      localStorage.setItem('theme', next);
    };

    if (prefersReduced || !document.startViewTransition) {
      doSwap();
      return;
    }

    let x = window.innerWidth - 40, y = 30;
    if (originEvent && originEvent.currentTarget) {
      const rect = originEvent.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(doSwap);
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 480,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  }

  // ---------------------------------------------------------
  // TWO INDEPENDENT ANIMATION SYSTEMS:
  // System 1: Continuous Autonomous Motion (Always Running, Idle or Active)
  // System 2: Mouse Interaction (Secondary Local Disturbance Layer)
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
    let width = 0, height = 0, dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Mouse tracking for magnetic disturbance (System 2)
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, px: -1000, py: -1000 };
    window.addEventListener('mousemove', (e) => {
      mouse.vx = e.clientX - mouse.px;
      mouse.vy = e.clientY - mouse.py;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.px = e.clientX;
      mouse.py = e.clientY;
    }, { passive: true });

    // Define 3 vertical light curtains hanging from the upper atmosphere
    const numRays = 40;
    const curtains = [
      { id: 0, topY: -40, bottomYRatio: 0.65, color: 'accent', baseAlpha: 0.08, speed: 0.0018 },
      { id: 1, topY: -80, bottomYRatio: 0.55, color: 'accent2', baseAlpha: 0.06, speed: 0.0014 },
      { id: 2, topY: 0,   bottomYRatio: 0.72, color: 'accent', baseAlpha: 0.05, speed: 0.0011 }
    ];

    curtains.forEach(c => {
      c.rays = [];
      for (let i = 0; i <= numRays; i++) {
        c.rays.push({
          xRatio: i / numRays,
          phase: (i / numRays) * Math.PI * 4 + Math.random(),
          ox: 0, oy: 0,   // mouse disturbance offsets
          vx: 0, vy: 0,   // mouse disturbance velocities
          shimmer: 1.0
        });
      }
    });

    let time = 0;

    function render() {
      ctx.clearRect(0, 0, width, height);

      const style = getComputedStyle(document.documentElement);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const accent = style.getPropertyValue('--accent').trim() || '#00E6C3';
      const accent2 = style.getPropertyValue('--accent-2').trim() || '#2DD4FF';

      ctx.globalCompositeOperation = isDark ? 'screen' : 'source-over';
      time += 1;

      curtains.forEach(c => {
        const colorHex = c.color === 'accent' ? accent : accent2;
        
        // SYSTEM 1: Continuous Autonomous Flow (Always running even when idle)
        const sheetDrift = Math.sin(time * c.speed * 0.4 + c.id) * 40;
        const currentBottomY = height * (c.bottomYRatio + Math.sin(time * c.speed * 0.6 + c.id) * 0.06);

        for (let i = 0; i < numRays; i++) {
          const r1 = c.rays[i];
          const r2 = c.rays[i + 1];

          // 1. Autonomous ray position (System 1)
          const baseX1 = r1.xRatio * (width + 160) - 80 + sheetDrift;
          const baseX2 = r2.xRatio * (width + 160) - 80 + sheetDrift;

          // 1. Autonomous vertical curtain sway & light ray evolution (System 1)
          const sway1 = Math.sin(time * c.speed + r1.phase) * 42 + Math.cos(time * c.speed * 1.3 + i * 0.25) * 22;
          const sway2 = Math.sin(time * c.speed + r2.phase) * 42 + Math.cos(time * c.speed * 1.3 + (i + 1) * 0.25) * 22;

          // 2. Mouse magnetic disturbance (System 2 - secondary layer)
          const rayCenterX = (baseX1 + baseX2) / 2 + (r1.ox + r2.ox) / 2;
          const rayCenterY = (c.topY + currentBottomY) / 2;
          const dist = Math.hypot(rayCenterX - mouse.x, rayCenterY - mouse.y);
          const radius = 280;

          if (dist < radius) {
            const force = (1 - dist / radius);
            r1.vx += (mouse.vx * 0.06 + (baseX1 - mouse.x) * 0.035) * force;
            r1.vy += (mouse.vy * 0.06 + (c.topY - mouse.y) * 0.02) * force;
            r1.shimmer += force * 0.35;
          }

          // System 2 disturbance decays smoothly back to System 1 continuous flow
          r1.ox += r1.vx;
          r1.oy += r1.vy;
          r1.vx *= 0.92;
          r1.vy *= 0.92;
          r1.ox *= 0.93;
          r1.oy *= 0.93;
          r1.shimmer += (1.0 - r1.shimmer) * 0.05;

          // Ray final positions (System 1 + System 2 offset)
          const x1 = baseX1 + r1.ox + sway1;
          const x2 = baseX2 + r2.ox + sway2;

          // System 1 autonomous ray breathing luminescence
          const rayAlpha = c.baseAlpha * (0.65 + 0.35 * Math.sin(time * 0.002 + r1.phase)) * r1.shimmer;

          // Draw vertical light curtain segment
          ctx.beginPath();
          ctx.moveTo(x1, c.topY + r1.oy);
          ctx.lineTo(x2, c.topY + r2.oy);
          ctx.lineTo(x2 * 0.95 + sway2 * 0.3, currentBottomY + r2.oy);
          ctx.lineTo(x1 * 0.95 + sway1 * 0.3, currentBottomY + r1.oy);
          ctx.closePath();

          // Soft volumetric vertical gradient
          const grad = ctx.createLinearGradient(0, c.topY, 0, currentBottomY);
          grad.addColorStop(0, hexToRgba(colorHex, 0));
          grad.addColorStop(0.2, hexToRgba(colorHex, rayAlpha));
          grad.addColorStop(0.7, hexToRgba(colorHex, rayAlpha * 0.65));
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.fill();
        }
      });

      if (!prefersReduced) {
        requestAnimationFrame(render);
      }
    }

    function hexToRgba(hex, alpha) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(ch => ch + ch).join('');
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    if (prefersReduced) {
      render();
    } else {
      requestAnimationFrame(render);
    }
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
  // HEADER STICKY HIDE/REVEAL & SCROLLSPY
  // ---------------------------------------------------------
  function wireNav() {
    rewriteNavLinks();

    const menuBtn = document.getElementById('menuBtn');
    const menuClose = document.getElementById('menuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => mobileMenu.classList.add('open'));
      menuClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
      mobileMenu.querySelectorAll('a').forEach((a) =>
        a.addEventListener('click', () => mobileMenu.classList.remove('open'))
      );
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', (e) => toggleTheme(e));
    }

    const searchTrigger = document.getElementById('searchTrigger');
    if (searchTrigger) {
      searchTrigger.addEventListener('click', () => openPalette());
    }

    const navHeader = document.getElementById('navHeader');
    if (navHeader) {
      let lastScrollY = window.scrollY;
      window.addEventListener(
        'scroll',
        () => {
          const currentY = window.scrollY;
          navHeader.classList.toggle('scrolled', currentY > 10);

          if (currentY > 140 && currentY - lastScrollY > 8) {
            navHeader.classList.add('nav-hidden');
          } else if (lastScrollY - currentY > 6 || currentY < 80) {
            navHeader.classList.remove('nav-hidden');
          }
          lastScrollY = currentY;
        },
        { passive: true }
      );
    }

    if (!isProjectPage) {
      initScrollSpy();
    }
  }

  function initScrollSpy() {
    const sectionIds = ['about', 'skills', 'projects', 'publication', 'leadership', 'credentials', 'education', 'contact'];
    const navAnchors = document.querySelectorAll('.nav-links a[data-section-link], .mobile-menu a[data-section-link]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navAnchors.forEach((a) => {
              const linkSection = a.getAttribute('data-section-link');
              if (linkSection === id || (id === 'education' && linkSection === 'certifications')) {
                a.classList.add('active');
              } else {
                a.classList.remove('active');
              }
            });
          }
        });
      },
      { threshold: 0.25, rootMargin: '-10% 0px -40% 0px' }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  // ---------------------------------------------------------
  // BUTTON INTERACTIONS (AWS-grade Magnetic & Spotlight)
  // ---------------------------------------------------------
  function initMagneticButtons() {
    if (prefersReduced) return;

    const buttons = document.querySelectorAll('.btn, .nav-cta, .search-trigger, .theme-toggle');
    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        btn.style.setProperty('--btn-x', `${(x / rect.width) * 100}%`);
        btn.style.setProperty('--btn-y', `${(y / rect.height) * 100}%`);

        const dx = (x - rect.width / 2) * 0.12;
        const dy = (y - rect.height / 2) * 0.12;
        btn.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.015)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0) scale(1)';
      });
    });
  }

  // ---------------------------------------------------------
  // CARD INTERACTIONS (AWS-grade 3D Parallax & Spotlight)
  // ---------------------------------------------------------
  function initCardTilt() {
    if (prefersReduced) return;

    const cards = document.querySelectorAll('.project-card, .pub-card, .lead-card, .stat-item');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        const rx = -((y - rect.height / 2) / rect.height) * 6;
        const ry = ((x - rect.width / 2) / rect.width) * 6;
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
    const containers = document.querySelectorAll('.chip-row, .projects-grid, .stats-inner, .skills-tiers');
    containers.forEach((container) => {
      Array.from(container.children).forEach((child, index) => {
        child.style.setProperty('--i', index);
      });
    });
  }

  // ---------------------------------------------------------
  // SCROLL REVEAL
  // ---------------------------------------------------------
  function initReveal() {
    const revealEls = document.querySelectorAll('.reveal, .site-footer');
    if (prefersReduced) {
      revealEls.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // ---------------------------------------------------------
  // IMAGE FALLBACKS
  // ---------------------------------------------------------
  function initImageFallbacks() {
    document.querySelectorAll('img[data-fallback-icon]').forEach((img) => {
      img.addEventListener('error', function handler() {
        const wrap = img.closest('.project-cover, .proj-cover-hero');
        if (wrap) {
          wrap.classList.add('img-fallback');
          wrap.setAttribute('data-icon', img.getAttribute('data-fallback-icon'));
          wrap.setAttribute('data-label', img.getAttribute('data-fallback-label') || 'Cover pending');
          img.remove();
        }
        img.removeEventListener('error', handler);
      });
    });
  }

  // ---------------------------------------------------------
  // COMMAND PALETTE (Cmd/Ctrl+K)
  // ---------------------------------------------------------
  const PALETTE_ITEMS = [
    { label: 'About', tag: 'Section', href: () => (isProjectPage ? '../index.html#about' : '#about') },
    { label: 'Skills', tag: 'Section', href: () => (isProjectPage ? '../index.html#skills' : '#skills') },
    { label: 'Projects', tag: 'Section', href: () => (isProjectPage ? '../index.html#projects' : '#projects') },
    { label: 'Research Publication', tag: 'Section', href: () => (isProjectPage ? '../index.html#publication' : '#publication') },
    { label: 'Leadership', tag: 'Section', href: () => (isProjectPage ? '../index.html#leadership' : '#leadership') },
    { label: 'Certifications', tag: 'Section', href: () => (isProjectPage ? '../index.html#certifications' : '#certifications') },
    { label: 'Education', tag: 'Section', href: () => (isProjectPage ? '../index.html#education' : '#education') },
    { label: 'Contact', tag: 'Section', href: () => (isProjectPage ? '../index.html#contact' : '#contact') },
    { label: 'Smart Water IoT Monitoring System', tag: 'Project', href: () => (isProjectPage ? 'smart-water-quality-monitoring.html' : 'projects/smart-water-quality-monitoring.html') },
    { label: 'Land Cover Classification (GCP)', tag: 'Project', href: () => (isProjectPage ? 'land-cover-classification-gcp.html' : 'projects/land-cover-classification-gcp.html') },
    { label: 'Oral Cancer Classification', tag: 'Project', href: () => (isProjectPage ? 'oral-cancer-classification.html' : 'projects/oral-cancer-classification.html') },
    { label: 'Download Resume', tag: 'File', href: () => rootPrefix + 'assets/Dinesh_Ram_S_P_Resume.pdf' },
    { label: 'GitHub Profile', tag: 'External', href: () => 'https://github.com/Dreamfyre23' },
    { label: 'LinkedIn Profile', tag: 'External', href: () => 'https://www.linkedin.com/in/dineshramsp' },
  ];

  let paletteOpen = false;
  let activeIndex = 0;
  let filteredItems = PALETTE_ITEMS;

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
          <kbd style="font-family:var(--font-mono); font-size:11px; color:var(--text-dimmer); border:1px solid var(--border); border-radius:4px; padding:1px 6px;">Esc</kbd>
        </div>
        <div class="cmdk-list" id="cmdkList"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePalette();
    });
    document.getElementById('cmdkInput').addEventListener('input', (e) => {
      filterPalette(e.target.value);
    });
    document.addEventListener('keydown', (e) => {
      if (!paletteOpen) return;
      if (e.key === 'Escape') { closePalette(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
      if (e.key === 'Enter') { e.preventDefault(); selectActive(); }
    });
  }

  function renderPaletteList() {
    const list = document.getElementById('cmdkList');
    if (!list) return;
    if (filteredItems.length === 0) {
      list.innerHTML = `<div class="cmdk-empty">No matches found.</div>`;
      return;
    }
    list.innerHTML = filteredItems
      .map(
        (item, i) => `
        <div class="cmdk-item ${i === activeIndex ? 'active' : ''}" data-index="${i}">
          <span class="cmdk-item-label">${item.label}</span>
          <span class="cmdk-item-tag">${item.tag}</span>
        </div>`
      )
      .join('');
    list.querySelectorAll('.cmdk-item').forEach((el) => {
      el.addEventListener('click', () => {
        activeIndex = parseInt(el.getAttribute('data-index'), 10);
        selectActive();
      });
    });
  }

  function filterPalette(query) {
    const q = query.trim().toLowerCase();
    filteredItems = q
      ? PALETTE_ITEMS.filter((i) => i.label.toLowerCase().includes(q))
      : PALETTE_ITEMS;
    activeIndex = 0;
    renderPaletteList();
  }

  function moveActive(delta) {
    if (filteredItems.length === 0) return;
    activeIndex = (activeIndex + delta + filteredItems.length) % filteredItems.length;
    renderPaletteList();
  }

  function selectActive() {
    const item = filteredItems[activeIndex];
    if (!item) return;
    window.location.href = item.href();
  }

  function openPalette() {
    buildPaletteDOM();
    filteredItems = PALETTE_ITEMS;
    activeIndex = 0;
    renderPaletteList();
    const overlay = document.getElementById('cmdkOverlay');
    overlay.classList.add('open');
    paletteOpen = true;
    setTimeout(() => document.getElementById('cmdkInput').focus(), 50);
  }

  function closePalette() {
    const overlay = document.getElementById('cmdkOverlay');
    if (overlay) overlay.classList.remove('open');
    paletteOpen = false;
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      paletteOpen ? closePalette() : openPalette();
    }
  });

  // ---------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------
  document.addEventListener('DOMContentLoaded', async () => {
    await loadPartial(rootPrefix + 'assets/partials/nav.html', '#navMount');
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
