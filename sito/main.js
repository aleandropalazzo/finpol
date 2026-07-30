/* ===========================================
   Finpol Main Site — JavaScript
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------
       1. NAVBAR — scroll shadow
    ----------------------------------------------- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });


    /* -----------------------------------------------
       2. MOBILE HAMBURGER MENU
    ----------------------------------------------- */
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    const hamburgerIcon = document.getElementById('hamburger-icon');

    hamburger?.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
        hamburgerIcon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });

    // Close menu when a link is clicked
    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.setAttribute('aria-expanded', false);
            hamburgerIcon.className = 'fa-solid fa-bars';
        });
    });


    /* -----------------------------------------------
       3. SCROLL REVEAL — IntersectionObserver
    ----------------------------------------------- */
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // stagger delay for siblings in a grid
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealEls.forEach((el, i) => {
        // Stagger children of grids
        const parent = el.parentElement;
        if (parent && (parent.classList.contains('who-grid') ||
                       parent.classList.contains('portfolio-grid') ||
                       parent.classList.contains('video-grid') ||
                       parent.classList.contains('stats-grid'))) {
            const siblings = [...parent.querySelectorAll('.reveal')];
            const idx = siblings.indexOf(el);
            el.dataset.delay = idx * 100;
        }
        revealObserver.observe(el);
    });


    /* -----------------------------------------------
       4. COUNTER ANIMATION — stats section
    ----------------------------------------------- */
    const counters = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    function animateCounters() {
        if (countersStarted) return;
        countersStarted = true;
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target, 10);
            const duration = 1500;
            const step = target / (duration / 16);
            let current = 0;
            const timer = setInterval(() => {
                current = Math.min(current + step, target);
                counter.textContent = Math.floor(current).toLocaleString('it-IT');
                if (current >= target) clearInterval(timer);
            }, 16);
        });
    }

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateCounters();
                statsObserver.disconnect();
            }
        }, { threshold: 0.4 });
        statsObserver.observe(statsSection);
    }


    /* -----------------------------------------------
       5. FAQ ACCORDION
    ----------------------------------------------- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const btn    = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        btn?.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';

            // Close all others
            faqItems.forEach(other => {
                if (other !== item) {
                    other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
                    other.querySelector('.faq-answer')?.classList.remove('open');
                }
            });

            // Toggle current
            btn.setAttribute('aria-expanded', !isOpen);
            answer?.classList.toggle('open', !isOpen);
        });
    });


    /* -----------------------------------------------
       6. ALLOCATION BAR — animate widths on scroll
       (bars start at width:0 in CSS if needed,
        but the simplest approach is leaving the
        inline widths and letting the card reveal
        handle the visual entry)
    ----------------------------------------------- */
    // No extra JS needed — the CSS handles the transition
    // and the reveal class handles the timing.


    /* -----------------------------------------------
       7. SMOOTH SCROLL for anchor links
       (already handled by html { scroll-behavior: smooth })
       — but add offset for fixed navbar height
    ----------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight : 68;
                const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

});
