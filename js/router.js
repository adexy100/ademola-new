/**
 * SPA Router for Ademola A. Website
 * Handles client-side routing with automatic fallback to normal navigation
 */

(function() {
    'use strict';

    // Configuration
    const ROUTES = [
        { path: 'index.html', name: 'Home' },
        { path: 'about.html', name: 'About' },
        { path: 'services.html', name: 'Services' },
        { path: 'portfolio.html', name: 'Portfolio' },
        { path: 'reviews.html', name: 'Reviews' },
        { path: 'contact.html', name: 'Contact' }
    ];

    const FETCH_TIMEOUT = 3000; // 3 seconds timeout
    const TRANSITION_DURATION = 150;

    // Check if we're running on a server (not file://)
    const isLocalFile = window.location.protocol === 'file:';
    
    // If running locally (file://), disable SPA routing and use normal navigation
    if (isLocalFile) {
        console.log('Running locally - using normal navigation');
        return;
    }

    // Check if fetch is available and working
    let fetchWorks = true;
    try {
        fetch('index.html', { method: 'HEAD' }).catch(() => {
            fetchWorks = false;
        });
    } catch (e) {
        fetchWorks = false;
    }

    // If fetch won't work, fall back to normal navigation
    if (!fetchWorks) {
        console.log('Fetch not available - using normal navigation');
        return;
    }

    // Navigation Manager
    class NavigationManager {
        constructor() {
            this.isNavigating = false;
            this.init();
        }

        init() {
            // Handle link clicks
            document.addEventListener('click', (e) => {
                const link = e.target.closest('[data-link]');
                if (link && !this.isNavigating) {
                    e.preventDefault();
                    let href = link.getAttribute('href');
                    if (href && !href.startsWith('#') && !href.startsWith('http')) {
                        // Handle both .html and clean URLs
                        if (!href.endsWith('.html')) {
                            href = href.replace(/\/$/, '') + '.html';
                        }
                        this.navigateTo(href);
                    }
                }
            });

            // Handle browser back/forward
            window.addEventListener('popstate', () => {
                this.reloadCurrentPage();
            });
        }

        async navigateTo(path, useHistory = true) {
            if (this.isNavigating) return;
            this.isNavigating = true;

            try {
                // Show brief loading indicator
                this.showLoading();

                // Fetch the new page
                const content = await this.fetchPage(path);

                if (content) {
                    // Generate clean URL (without .html)
                    const cleanPath = path.replace(/\.html$/, '');
                    const cleanUrl = cleanPath === 'index' || cleanPath === 'index.html' ? '/' : '/' + cleanPath;

                    // Update URL
                    if (useHistory) {
                        window.history.pushState({ path: cleanUrl }, '', cleanUrl);
                    }

                    // Update page content
                    this.updatePageContent(content, path);

                    // Scroll to top
                    window.scrollTo(0, 0);

                    // Reinitialize components after content update
                    this.reinitializeComponents();
                } else {
                    throw new Error('No content received');
                }
            } catch (error) {
                console.warn('SPA navigation failed, falling back to normal navigation:', error.message);
                // Fall back to normal page load
                window.location.href = path;
                return;
            } finally {
                this.hideLoading();
                this.isNavigating = false;
            }
        }

        reinitializeComponents() {
            // Ensure theme is applied immediately (fixes dark mode flash on SPA navigation)
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);

            // Reinitialize portfolio filtering
            if (typeof initPortfolioFilter === 'function') {
                initPortfolioFilter();
            }

            // Reinitialize stat counters
            if (typeof initStatCounters === 'function') {
                initStatCounters();
            }

            // Reinitialize scroll animations
            if (typeof initScrollAnimations === 'function') {
                initScrollAnimations();
            }

            // Reinitialize form handling
            if (typeof initFormHandling === 'function') {
                initFormHandling();
            }

            // Reinitialize mobile menu close on link click
            this.reinitMobileMenu();

            // Update theme icon to match current theme
            if (typeof updateThemeIcon === 'function') {
                updateThemeIcon(savedTheme);
            }
        }

        reinitMobileMenu() {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                const mobileMenuLinks = mobileMenu.querySelectorAll('a');
                mobileMenuLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        mobileMenu.classList.add('hidden');
                        mobileMenu.classList.remove('show');
                    });
                });
            }
        }

        async fetchPage(path) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

            try {
                const response = await fetch(path, { 
                    signal: controller.signal,
                    cache: 'no-store'
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                clearTimeout(timeoutId);
                return await response.text();

            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }

        updatePageContent(html, path) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Update main content
            const newMain = doc.querySelector('main');
            const currentMain = document.querySelector('main');

            if (newMain && currentMain) {
                // Smooth fade transition
                currentMain.style.transition = `opacity ${TRANSITION_DURATION}ms ease`;
                currentMain.style.opacity = '0';

                setTimeout(() => {
                    currentMain.innerHTML = newMain.innerHTML;
                    currentMain.style.opacity = '1';
                }, TRANSITION_DURATION);
            }

            // Update page title
            const newTitle = doc.querySelector('title');
            if (newTitle) {
                document.title = newTitle.textContent;
            }

            // Update active nav link
            this.updateActiveNav(path);

            // Run page-specific initialization (animations, forms, etc)
            if (typeof window.initPage === 'function') {
                window.initPage();
            }
        }

        updateActiveNav(path) {
            const fileName = path.split('/').pop().replace(/\.html$/, '');
            
            // Desktop nav
            document.querySelectorAll('.nav-link').forEach(link => {
                const href = link.getAttribute('href');
                const linkName = href ? href.split('/').pop().replace(/\.html$/, '') : '';
                if (linkName === fileName) {
                    link.classList.add('text-primary', 'font-semibold');
                    link.classList.remove('text-gray-700', 'hover:text-primary');
                } else {
                    link.classList.remove('text-primary', 'font-semibold');
                    link.classList.add('text-gray-700', 'hover:text-primary');
                }
            });

            // Mobile nav
            document.querySelectorAll('.mobile-menu-item').forEach(link => {
                const href = link.getAttribute('href');
                const linkName = href ? href.split('/').pop().replace(/\.html$/, '') : '';
                if (linkName === fileName) {
                    link.classList.add('text-primary', 'font-semibold');
                } else {
                    link.classList.remove('text-primary', 'font-semibold');
                }
            });
        }

        reloadCurrentPage() {
            let path = window.location.pathname.split('/').pop() || 'index.html';
            // Handle clean URLs - add .html if missing
            if (!path.endsWith('.html')) {
                if (path === '' || path === '/') {
                    path = 'index.html';
                } else {
                    path = path + '.html';
                }
            }
            this.navigateTo(path, false);
        }

        showLoading() {
            let loader = document.getElementById('spa-loader');
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'spa-loader';
                loader.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: var(--bg-primary, #fff);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 9999;
                        transition: opacity 0.15s ease;
                    ">
                        <div style="
                            width: 32px;
                            height: 32px;
                            border: 3px solid #328990;
                            border-top-color: transparent;
                            border-radius: 50%;
                            animation: spin 0.8s linear infinite;
                        "></div>
                    </div>
                    <style>
                        @keyframes spin { to { transform: rotate(360deg); } }
                    </style>
                `;
                document.body.appendChild(loader);
            }
            loader.style.opacity = '1';
            loader.style.display = 'flex';
        }

        hideLoading() {
            const loader = document.getElementById('spa-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 150);
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new NavigationManager());
    } else {
        new NavigationManager();
    }

})();
