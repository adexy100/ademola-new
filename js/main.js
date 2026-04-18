/* ============================================================
   ADEMOLA A. — main.js (production)
   Theme · Cursor · Nav · Reveal · Counter · Filter · Form
   ============================================================ */
(function () {
  'use strict';

  /* ─ Theme ─────────────────────────────────────── */
  const Theme = {
    init() {
      const saved = localStorage.getItem('theme') || 'light';
      this.apply(saved);
      document.querySelectorAll('.theme-toggle').forEach(btn =>
        btn.addEventListener('click', () => this.toggle())
      );
    },
    apply(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    },
    toggle() {
      const cur = document.documentElement.getAttribute('data-theme');
      this.apply(cur === 'dark' ? 'light' : 'dark');
    }
  };

  /* ─ Custom cursor ──────────────────────────────── */
  const Cursor = {
    dot: null, ring: null,
    mx: -200, my: -200, rx: -200, ry: -200,
    raf: null,
    init() {
      if (window.innerWidth <= 1024) return;
      this.dot = document.getElementById('cursor-dot');
      this.ring = document.getElementById('cursor-ring');
      if (!this.dot) return;
      document.addEventListener('mousemove', e => { this.mx = e.clientX; this.my = e.clientY; });
      document.addEventListener('mouseleave', () => { this.dot.style.opacity = '0'; this.ring.style.opacity = '0'; });
      document.addEventListener('mouseenter', () => { this.dot.style.opacity = '1'; this.ring.style.opacity = '.55'; });
      // Hover detection via class
      document.addEventListener('mouseover', e => {
        if (e.target.closest('a,button,.filter-btn,.port-card,.svc-card,.testi-card')) {
          document.body.classList.add('cursor-hover');
        } else {
          document.body.classList.remove('cursor-hover');
        }
      });
      this.loop();
    },
    loop() {
      this.rx += (this.mx - this.rx) * 0.12;
      this.ry += (this.my - this.ry) * 0.12;
      if (this.dot) {
        this.dot.style.left = this.mx + 'px';
        this.dot.style.top = this.my + 'px';
      }
      if (this.ring) {
        this.ring.style.left = this.rx + 'px';
        this.ring.style.top = this.ry + 'px';
      }
      requestAnimationFrame(() => this.loop());
    }
  };

  /* ─ Navbar ─────────────────────────────────────── */
  const Nav = {
    navbar: null, ham: null, mob: null,
    init() {
      this.navbar = document.getElementById('navbar');
      this.ham = document.getElementById('hamburger');
      this.mob = document.getElementById('mobile-menu');
      if (this.navbar) {
        this.scroll();
        window.addEventListener('scroll', () => this.scroll(), { passive: true });
      }
      if (this.ham && this.mob) {
        this.ham.addEventListener('click', () => this.toggleMenu());
        this.mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => this.closeMenu()));
      }
      this.setActive();
    },
    scroll() {
      this.navbar.classList.toggle('scrolled', window.scrollY > 20);
    },
    toggleMenu() {
      const open = this.mob.classList.toggle('open');
      this.ham.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    },
    closeMenu() {
      this.mob.classList.remove('open');
      this.ham.classList.remove('open');
      document.body.style.overflow = '';
    },
    setActive() {
      const page = location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === page);
      });
    }
  };

  /* ─ Scroll Reveal ──────────────────────────────── */
  const Reveal = {
    init() {
      if (typeof IntersectionObserver === 'undefined') {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        return;
      }
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });
      document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }
  };

  /* ─ Number counter ─────────────────────────────── */
  const Counter = {
    init() {
      const nums = document.querySelectorAll('[data-count]');
      if (!nums.length) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const end = parseFloat(el.dataset.count);
          const sfx = el.dataset.suffix || '';
          const dec = el.dataset.count.includes('.') ? 1 : 0;
          const dur = 1800;
          const t0 = performance.now();
          const tick = now => {
            const p = Math.min((now - t0) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = (end * ease).toFixed(dec) + sfx;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.unobserve(el);
        });
      }, { threshold: 0.5 });
      nums.forEach(n => obs.observe(n));
    }
  };

  /* ─ Portfolio filter ───────────────────────────── */
  const Filter = {
    init() {
      const btns = document.querySelectorAll('.filter-btn');
      const items = document.querySelectorAll('.port-card[data-category]');
      if (!btns.length || !items.length) return;

      // Set initial transition
      items.forEach(i => { i.style.transition = 'opacity .25s ease, transform .25s ease'; });

      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.dataset.filter;
          items.forEach(item => {
            const cats = (item.dataset.category || '').split(' ');
            const show = cat === 'all' || cats.includes(cat);
            if (show) {
              item.style.display = '';
              requestAnimationFrame(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0) scale(1)';
              });
            } else {
              item.style.opacity = '0';
              item.style.transform = 'translateY(10px) scale(.97)';
              setTimeout(() => { item.style.display = 'none'; }, 260);
            }
          });
        });
      });
    }
  };

  /* ─ Hero entrance animation ────────────────────── */
  const HeroAnim = {
    init() {
      const els = document.querySelectorAll('.hero-animate');
      if (!els.length) return;
      els.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(26px)';
        el.style.transition = `opacity .65s cubic-bezier(.23,1,.32,1) ${(i * .1 + .15).toFixed(2)}s, transform .65s cubic-bezier(.23,1,.32,1) ${(i * .1 + .15).toFixed(2)}s`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }));
      });
    }
  };

  /* ─ Contact form ───────────────────────────────── */
  // Form Handling with Formspree
  const FORMSPREE_CONFIG = {
    endpoint: 'https://formspree.io/f/xgolboen'
  };

  function initFormHandling() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      // Remove any previous listeners to prevent duplicates on SPA nav
      form.removeEventListener('submit', handleFormSubmit);
      form.addEventListener('submit', handleFormSubmit);

      // Neutralize default action to prevent unintended navigation
      if (form.hasAttribute('action')) {
        form.setAttribute('action', '#');
      }
    });
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('handleFormSubmit: start', e.target);

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Validate required fields
    if (!form.checkValidity()) {
      showAlert('error', 'Please fill in all required fields.', 'Validation Error');
      return false;
    }

    try {
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Sending...';

      // Collect form data
      const formData = new FormData(form);

      // Post to Formspree
      const response = await fetch(FORMSPREE_CONFIG.endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Show success message
        showAlert('success', 'Your message has been sent successfully! I\'ll get back to you within 24 hours.', 'Message Sent');

        // Reset form
        form.reset();

        // Auto-dismiss after 5 seconds
        setTimeout(() => closeAlert(), 5000);
      } else {
        console.error('Form submission failed (status)', response.status);
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form error:', error);
      showAlert('error', 'Something went wrong. Please try again or contact me directly at ademola@example.com', 'Submission Error');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }

    return false;
  }

  // Alert Banner Management
  function showAlert(type, message, title) {
    let banner = document.getElementById('alert-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'alert-banner';
      banner.className = 'alert-banner hidden';
      document.body.appendChild(banner);
    }

    // Remove hidden and previous status classes; preserve positioning
    banner.classList.remove('hidden', 'success', 'error', 'info', 'warning');
    if (!banner.classList.contains('alert-banner')) {
      banner.classList.add('alert-banner');
    }
    banner.classList.add(type);

    banner.innerHTML = `
        <div class="alert-banner-content">
            <div class="alert-banner-title">${title}</div>
            <div class="alert-banner-message">${message}</div>
        </div>
        <button aria-label="Close alert" onclick="closeAlert()">✕</button>
    `;
  }

  function closeAlert() {
    const banner = document.getElementById('alert-banner');
    if (banner) {
      banner.classList.add('hidden');
    }
  }

  /* ─ Smooth anchor scroll ───────────────────────── */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  /* ─ Boot ───────────────────────────────────────── */
  function boot() {
    Theme.init();
    Cursor.init();
    Nav.init();
    Reveal.init();
    Counter.init();
    Filter.init();
    HeroAnim.init();
    initFormHandling();
    initAnchors();
  }

  /* ─ Page init (called by SPA router after navigation) ── */
  window.initPage = function () {
    Nav.setActive();
    Reveal.init();
    Counter.init();
    Filter.init();
    HeroAnim.init();
    initFormHandling();
    initAnchors();
  };

  /* ─ Expose closeAlert globally for inline onclick ── */
  window.closeAlert = closeAlert;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('spa:load', boot);
})();