/* ============================================
   ADEMOLA A. — main.js
   Custom cursor · Reveal animations · Counter
   Mobile menu · Nav scroll · Portfolio filter
   ============================================ */

(function () {
  'use strict';

  /* ── Theme Manager ──────────────────────── */
  const ThemeManager = {
    init() {
      const saved = localStorage.getItem('theme') || 'light';
      this.apply(saved);
      document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', () => this.toggle());
      });
    },
    apply(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    },
    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      this.apply(current === 'dark' ? 'light' : 'dark');
    }
  };

  /* ── Custom Cursor ──────────────────────── */
  const Cursor = {
    dot: null, ring: null,
    mx: -100, my: -100, rx: -100, ry: -100,
    init() {
      if (window.innerWidth <= 1024) return;
      this.dot  = document.getElementById('cursor-dot');
      this.ring = document.getElementById('cursor-ring');
      if (!this.dot || !this.ring) return;
      document.addEventListener('mousemove', e => { this.mx = e.clientX; this.my = e.clientY; });
      document.addEventListener('mouseleave', () => { this.dot.style.opacity = '0'; this.ring.style.opacity = '0'; });
      document.addEventListener('mouseenter', () => { this.dot.style.opacity = '1'; this.ring.style.opacity = '0.6'; });
      this.loop();
    },
    loop() {
      this.rx += (this.mx - this.rx) * 0.12;
      this.ry += (this.my - this.ry) * 0.12;
      if (this.dot)  this.dot.style.transform  = `translate(${this.mx}px,${this.my}px) translate(-50%,-50%)`;
      if (this.ring) this.ring.style.transform = `translate(${this.rx}px,${this.ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(() => this.loop());
    }
  };

  /* ── Scroll Reveal ──────────────────────── */
  const Reveal = {
    observer: null,
    init() {
      const els = document.querySelectorAll('.reveal');
      if (!els.length) return;
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            this.observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      els.forEach(el => this.observer.observe(el));
    }
  };

  /* ── Number Counter ─────────────────────── */
  const Counter = {
    init() {
      const nums = document.querySelectorAll('[data-count]');
      if (!nums.length) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const duration = 1800;
          const start = performance.now();
          const isDecimal = target % 1 !== 0;
          const animate = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            const val = target * ease;
            el.textContent = isDecimal
              ? val.toFixed(1) + suffix
              : Math.floor(val) + suffix;
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          obs.unobserve(el);
        });
      }, { threshold: 0.5 });
      nums.forEach(n => obs.observe(n));
    }
  };

  /* ── Navigation ─────────────────────────── */
  const Nav = {
    navbar: null,
    hamburger: null,
    mobileMenu: null,
    init() {
      this.navbar     = document.getElementById('navbar');
      this.hamburger  = document.getElementById('hamburger');
      this.mobileMenu = document.getElementById('mobile-menu');

      if (this.navbar) {
        this.onScroll();
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      }

      if (this.hamburger && this.mobileMenu) {
        this.hamburger.addEventListener('click', () => this.toggleMenu());
        this.mobileMenu.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', () => this.closeMenu());
        });
      }

      this.setActive();
    },
    onScroll() {
      if (window.scrollY > 20) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    },
    toggleMenu() {
      const open = this.mobileMenu.classList.toggle('open');
      this.hamburger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    },
    closeMenu() {
      this.mobileMenu.classList.remove('open');
      this.hamburger.classList.remove('open');
      document.body.style.overflow = '';
    },
    setActive() {
      const page = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === page);
      });
    }
  };

  /* ── Portfolio Filter ───────────────────── */
  const Filter = {
    init() {
      const btns  = document.querySelectorAll('.filter-btn');
      const items = document.querySelectorAll('.portfolio-card[data-category]');
      if (!btns.length) return;

      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.dataset.filter;
          items.forEach(item => {
            const cats = item.dataset.category.split(' ');
            const show = cat === 'all' || cats.includes(cat);
            item.style.opacity = '0';
            item.style.transform = 'translateY(12px) scale(0.97)';
            if (!show) {
              setTimeout(() => { item.style.display = 'none'; }, 250);
            } else {
              item.style.display = '';
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0) scale(1)';
              }, 30);
            }
          });
        });
      });

      // Smooth portfolio items transition
      items.forEach(item => {
        item.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      });
    }
  };

  /* ── Magnetic Buttons ───────────────────── */
  const Magnetic = {
    init() {
      if (window.innerWidth <= 1024) return;
      document.querySelectorAll('.btn-primary, .btn-outline, .btn-white').forEach(btn => {
        btn.addEventListener('mousemove', e => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width  / 2;
          const y = e.clientY - rect.top  - rect.height / 2;
          btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
        });
      });
    }
  };

  /* ── Hero Animation ─────────────────────── */
  const HeroAnim = {
    init() {
      const els = document.querySelectorAll('.hero-animate');
      if (!els.length) return;
      els.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = `opacity 0.7s cubic-bezier(0.23,1,0.32,1) ${i * 0.1 + 0.15}s, transform 0.7s cubic-bezier(0.23,1,0.32,1) ${i * 0.1 + 0.15}s`;
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    }
  };

  /* ── Contact Form ───────────────────────── */
  const ContactForm = {
    init() {
      const form = document.getElementById('contact-form');
      if (!form) return;
      const isNetlify = form.hasAttribute('data-netlify');
      if (isNetlify) return; // Let Netlify handle

      form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending…';
        try {
          await new Promise(r => setTimeout(r, 1200));
          this.showMsg(form, 'success', '✓ Message sent! I\'ll get back to you within 24 hours.');
          form.reset();
        } catch {
          this.showMsg(form, 'error', 'Something went wrong. Please try again.');
        } finally {
          btn.disabled = false;
          btn.textContent = orig;
        }
      });
    },
    showMsg(form, type, msg) {
      const existing = form.parentElement.querySelector('.form-feedback');
      if (existing) existing.remove();
      const div = document.createElement('div');
      div.className = 'form-feedback';
      div.style.cssText = `
        padding: 1rem 1.25rem;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 1rem;
        background: ${type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'};
        color: ${type === 'success' ? '#059669' : '#dc2626'};
        border: 1px solid ${type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};
      `;
      div.textContent = msg;
      form.parentElement.insertBefore(div, form);
      setTimeout(() => div.remove(), 6000);
    }
  };

  /* ── Smooth scroll for anchor links ─────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Init ───────────────────────────────── */
  function init() {
    ThemeManager.init();
    Cursor.init();
    Nav.init();
    Reveal.init();
    Counter.init();
    Filter.init();
    Magnetic.init();
    HeroAnim.init();
    ContactForm.init();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on SPA navigation
  window.addEventListener('spa:load', init);

})();
