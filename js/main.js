// Main JavaScript for Ademola A. Website

// Theme Management
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        // Load saved theme or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        // Add theme toggle listener
        this.addThemeToggle();
        
        // Add system preference listener (optional enhancement)
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateThemeIcon(theme) {
        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');
        
        if (sunIcon && moonIcon) {
            if (theme === 'dark') {
                sunIcon.style.opacity = '0';
                moonIcon.style.opacity = '1';
            } else {
                sunIcon.style.opacity = '1';
                moonIcon.style.opacity = '0';
            }
        }
    }

    // Export for SPA router
    addThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// Initialize Theme Manager
const themeManager = new ThemeManager();

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('show');
    });
    
    // Close mobile menu when clicking a nav link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('show');
        });
    });
}

// Active Navigation Link
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath.split('/').pop()) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Smooth Scroll for Navigation Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// kick off everything when DOM is ready
// only initPage is needed here; smooth scroll is invoked within initPage itself
// so that it runs after new content is swapped by the router
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initPage();
    });
} else {
    initPage();
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Stat Counter Animation
function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const countUp = (element, target, duration = 2000) => {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target + (element.dataset.suffix || '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start) + (element.dataset.suffix || '');
            }
        }, 16);
    };

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = parseInt(entry.target.dataset.target);
                countUp(entry.target, target);
                entry.target.classList.add('counted');
            }
        });
    }, observerOptions);

    statNumbers.forEach(stat => {
        if (stat.dataset.target) {
            observer.observe(stat);
        }
    });
}

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
        console.log('Submitting to', FORMSPREE_CONFIG.endpoint);
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
        console.log('Fetch completed, status', response.status);
        
        if (response.ok) {
            console.log('Form submission successful');
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
    const banner = document.getElementById('alert-banner');
    if (!banner) return;
    
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

// FAQ Accordion
function initFAQ() {
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('.faq-icon');
            if (content && content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                if (icon) icon.style.transform = 'rotate(180deg)';
            } else if (content) {
                content.classList.add('hidden');
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
        });
    });
}

// Navigation scroll effect
function initNavScroll() {
    const nav = document.querySelector('nav');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// Initialize nav scroll on load
window.addEventListener('load', () => {
    initNavScroll();
});

// Portfolio Filtering
function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('border-primary', 'text-primary');
                btn.classList.add('border-gray-300', 'text-gray-600');
            });
            button.classList.add('active');
            button.classList.remove('border-gray-300', 'text-gray-600');
            button.classList.add('border-primary', 'text-primary');
            
            // Filter portfolio items - check if filter is in the category list
            portfolioItems.forEach(item => {
                const categories = item.dataset.category.split(' ');
                if (filter === 'all' || categories.includes(filter)) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}


// Utility functions
const utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Smooth scroll to element
    scrollToElement(element, duration = 1000) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    }
};

// Export utilities for use in other scripts
window.utils = utils;

// Portfolio Detail Handlers - for clicking portfolio item buttons to scroll to case study
function attachPortfolioDetailHandlers() {
    const portfolioButtons = document.querySelectorAll('.portfolio-item button');
    portfolioButtons.forEach(button => {
        button.removeEventListener('click', portfolioScrollHandler);
        button.addEventListener('click', portfolioScrollHandler);
    });
}

function portfolioScrollHandler(e) {
    e.preventDefault();
    const caseStudySection = document.getElementById('featured-case-study');
    if (caseStudySection) {
        utils.scrollToElement(caseStudySection, 800);
    }
}

// Centralized page initialization function for SPA navigation
function initPage() {
    try {
        // Apply theme immediately to prevent flash
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Initialize all page components
        setActiveNavLink();
        initScrollAnimations();
        initStatCounters();
        initFormHandling();
        initFAQ();
        initSmoothScroll();
        initPortfolioFilter();
        initNavScroll();
        attachPortfolioDetailHandlers();

        // Update theme icons
        window.updateThemeIcon(savedTheme);
    } catch (err) {
        console.error('Error during page initialization', err);
    }
}

// Export functions for SPA router
window.updateThemeIcon = ThemeManager.prototype.updateThemeIcon.bind(themeManager);
window.initPortfolioFilter = initPortfolioFilter;
window.initStatCounters = initStatCounters;
window.initScrollAnimations = initScrollAnimations;
window.initFormHandling = initFormHandling;
window.initFAQ = initFAQ;
window.initSmoothScroll = initSmoothScroll;
window.initPage = initPage;
window.attachPortfolioDetailHandlers = attachPortfolioDetailHandlers;