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


    /* -----------------------------------------------
       7b. ETF ROW DESCRIPTION TOGGLE (MOBILE / CLICK)
    ----------------------------------------------- */
    document.querySelectorAll('.etf-row-wrapper, .etf-alt-note').forEach(item => {
        item.addEventListener('click', (e) => {
            const isActive = item.classList.contains('active');
            const parentTable = item.closest('.etf-table');
            if (parentTable) {
                parentTable.querySelectorAll('.etf-row-wrapper, .etf-alt-note').forEach(other => {
                    if (other !== item) other.classList.remove('active');
                });
            }
            item.classList.toggle('active', !isActive);
        });
    });


    /* -----------------------------------------------
       8. PAC SIMULATOR
    ----------------------------------------------- */
    const pacProfile    = document.getElementById('pac-profile');
    const pacCustomGrp  = document.getElementById('pac-custom-group');
    const pacYearsSlider = document.getElementById('pac-years');
    const pacYearsDisp  = document.getElementById('pac-years-display');
    const pacCalcBtn    = document.getElementById('pac-calculate');
    const pacResults    = document.getElementById('pac-results');
    const pacTableToggle = document.getElementById('pac-table-toggle');
    const pacTableWrap  = document.getElementById('pac-table-wrap');

    // Show/hide custom rate field
    pacProfile?.addEventListener('change', () => {
        pacCustomGrp.style.display = pacProfile.value === 'custom' ? 'flex' : 'none';
    });

    // Slider label
    pacYearsSlider?.addEventListener('input', () => {
        const y = pacYearsSlider.value;
        pacYearsDisp.textContent = y + (y === '1' ? ' anno' : ' anni');
    });

    // Table toggle
    pacTableToggle?.addEventListener('click', () => {
        const isOpen = pacTableWrap.style.display !== 'none';
        pacTableWrap.style.display = isOpen ? 'none' : 'block';
        pacTableToggle.classList.toggle('open', !isOpen);
    });

    // Portfolio card buttons → pre-select profile
    document.querySelectorAll('.btn-pac-sim').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const profileVal = btn.dataset.profile;
            if (pacProfile) {
                pacProfile.value = profileVal;
                pacCustomGrp.style.display = 'none';
            }
            // Auto-calculate with the selected profile
            if (pacCalcBtn) {
                pacCalcBtn._autoFired = true;
                pacCalcBtn.click();
            }
            // Scroll to simulator
            const simSection = document.getElementById('simulatore');
            if (simSection) {
                const navHeight = navbar ? navbar.offsetHeight : 68;
                const top = simSection.getBoundingClientRect().top + window.scrollY - navHeight - 16;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Calculate
    pacCalcBtn?.addEventListener('click', () => {
        const initial  = parseFloat(document.getElementById('pac-initial').value) || 0;
        const monthly  = parseFloat(document.getElementById('pac-monthly').value) || 0;
        const years    = parseInt(pacYearsSlider.value, 10) || 20;
        let annualRate = 5.5;

        if (pacProfile.value === 'custom') {
            annualRate = parseFloat(document.getElementById('pac-custom-rate').value) || 0;
        } else {
            annualRate = parseFloat(pacProfile.value) || 0;
        }

        const monthlyRate = annualRate / 100 / 12;
        const totalMonths = years * 12;

        // Build month-by-month data
        const dataPoints = [];
        let balance = initial;
        let totalInvested = initial;

        dataPoints.push({ month: 0, invested: initial, value: initial });

        for (let m = 1; m <= totalMonths; m++) {
            balance = balance * (1 + monthlyRate) + monthly;
            totalInvested += monthly;
            dataPoints.push({ month: m, invested: totalInvested, value: balance });
        }

        const finalValue = balance;
        const netGain = finalValue - totalInvested;
        const gainPct = totalInvested > 0 ? (netGain / totalInvested * 100) : 0;

        // Show results
        pacResults.style.display = 'flex';

        // Animate counters
        animateValue('pac-total-invested', totalInvested);
        animateValue('pac-final-value', finalValue);
        animateValue('pac-net-gain', netGain);
        document.getElementById('pac-gain-pct').textContent = '+' + gainPct.toFixed(1) + '%';

        // Draw chart
        drawPacChart(dataPoints, years);

        // Build table
        buildPacTable(dataPoints, years);

        // Scroll to results on mobile (only if user clicked, not on auto-load)
        if (window.innerWidth < 900 && !pacCalcBtn._autoFired) {
            setTimeout(() => {
                const navHeight = navbar ? navbar.offsetHeight : 68;
                const top = pacResults.getBoundingClientRect().top + window.scrollY - navHeight - 16;
                window.scrollTo({ top, behavior: 'smooth' });
            }, 100);
        }
        pacCalcBtn._autoFired = false;
    });

    // Auto-calculate on page load with default values
    if (pacCalcBtn) {
        pacCalcBtn._autoFired = true;
        pacCalcBtn.click();
    }

    function animateValue(elementId, target) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const duration = 1200;
        const start = performance.now();
        const format = (n) => '€ ' + Math.floor(n).toLocaleString('it-IT');

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = format(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function drawPacChart(data, years) {
        const canvas = document.getElementById('pac-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Reset canvas size before measuring to prevent grow-on-recalculate bug
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.width = 0;
        canvas.height = 0;

        // Responsive sizing
        const containerW = canvas.parentElement.clientWidth - 32; // minus padding
        const w = Math.max(containerW, 300);
        const h = Math.round(w * 0.48);

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);

        // Chart area
        const pad = { top: 20, right: 20, bottom: 40, left: 70 };
        const cw = w - pad.left - pad.right;
        const ch = h - pad.top - pad.bottom;

        ctx.clearRect(0, 0, w, h);

        const maxVal = Math.max(...data.map(d => d.value), ...data.map(d => d.invested));
        const step = data.length > 200 ? Math.ceil(data.length / 200) : 1;

        // Helper
        const x = (i) => pad.left + (i / (data.length - 1)) * cw;
        const y = (v) => pad.top + ch - (v / maxVal) * ch;

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        const gridLines = 5;
        for (let g = 0; g <= gridLines; g++) {
            const gy = pad.top + (ch / gridLines) * g;
            ctx.beginPath();
            ctx.moveTo(pad.left, gy);
            ctx.lineTo(pad.left + cw, gy);
            ctx.stroke();

            // Y-axis labels
            const val = maxVal - (maxVal / gridLines) * g;
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.font = '11px Plus Jakarta Sans, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('€ ' + formatCompact(val), pad.left - 10, gy + 4);
        }

        // X-axis labels
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        const labelInterval = years <= 10 ? 1 : years <= 20 ? 2 : 5;
        for (let yr = 0; yr <= years; yr += labelInterval) {
            const idx = yr * 12;
            if (idx < data.length) {
                ctx.fillText(yr + 'a', x(idx), h - pad.bottom + 20);
            }
        }
        // Always show last year
        ctx.fillText(years + 'a', x(data.length - 1), h - pad.bottom + 20);

        // --- Area: Portfolio value ---
        ctx.beginPath();
        ctx.moveTo(x(0), y(data[0].value));
        for (let i = 1; i < data.length; i += step) {
            ctx.lineTo(x(i), y(data[i].value));
        }
        ctx.lineTo(x(data.length - 1), y(data[data.length - 1].value));
        ctx.lineTo(x(data.length - 1), y(0));
        ctx.lineTo(x(0), y(0));
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
        grad.addColorStop(0, 'rgba(124, 58, 237, 0.3)');
        grad.addColorStop(1, 'rgba(124, 58, 237, 0.02)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Line: Portfolio value
        ctx.beginPath();
        ctx.moveTo(x(0), y(data[0].value));
        for (let i = 1; i < data.length; i += step) {
            ctx.lineTo(x(i), y(data[i].value));
        }
        ctx.lineTo(x(data.length - 1), y(data[data.length - 1].value));
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // --- Area: Invested ---
        ctx.beginPath();
        ctx.moveTo(x(0), y(data[0].invested));
        for (let i = 1; i < data.length; i += step) {
            ctx.lineTo(x(i), y(data[i].invested));
        }
        ctx.lineTo(x(data.length - 1), y(data[data.length - 1].invested));
        ctx.lineTo(x(data.length - 1), y(0));
        ctx.lineTo(x(0), y(0));
        ctx.closePath();
        const grad2 = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
        grad2.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
        grad2.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
        ctx.fillStyle = grad2;
        ctx.fill();

        // Line: Invested
        ctx.beginPath();
        ctx.moveTo(x(0), y(data[0].invested));
        for (let i = 1; i < data.length; i += step) {
            ctx.lineTo(x(i), y(data[i].invested));
        }
        ctx.lineTo(x(data.length - 1), y(data[data.length - 1].invested));
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function formatCompact(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
        return Math.round(n).toString();
    }

    function buildPacTable(data, years) {
        const tbody = document.getElementById('pac-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        const fmt = (n) => '€ ' + Math.floor(n).toLocaleString('it-IT');

        for (let yr = 1; yr <= years; yr++) {
            const idx = yr * 12;
            if (idx >= data.length) break;
            const d = data[idx];
            const interest = d.value - d.invested;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${yr}</td>
                <td>${fmt(d.invested)}</td>
                <td class="td-gain">+${fmt(interest)}</td>
                <td><strong>${fmt(d.value)}</strong></td>
            `;
            tbody.appendChild(row);
        }
    }


    /* -----------------------------------------------
       10. FINPOL PLUS — WAITING LIST FORM
    ----------------------------------------------- */
    const plusForm = document.getElementById('plus-form');
    const plusEmail = document.getElementById('plus-email');
    const plusNote = document.getElementById('plus-note');
    const plusBtn = document.getElementById('plus-submit');

    plusForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = plusEmail.value.trim();
        if (!email) return;

        // Disable button during submission
        plusBtn.disabled = true;
        plusBtn.querySelector('span').textContent = 'Invio...';

        // Submit to Formspree
        fetch('https://formspree.io/f/xgoqzgrv', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json' 
            },
            body: JSON.stringify({ 
                email: email, 
                source: 'Finpol Plus Waiting List',
                url: window.location.href 
            })
        })
        .then(res => {
            plusNote.textContent = '✅ Perfetto! Ti avviseremo al lancio di Finpol Plus.';
            plusNote.style.color = '#34d399';
            plusEmail.value = '';
            plusEmail.disabled = true;
            plusBtn.querySelector('span').textContent = 'Iscritto ✓';
            plusBtn.style.background = 'rgba(52, 211, 153, 0.2)';
            plusBtn.style.borderColor = '#34d399';
        })
        .catch(err => {
            plusNote.textContent = '⚠️ Errore nell\'invio. Riprova tra qualche secondo.';
            plusNote.style.color = '#fbbf24';
            plusBtn.disabled = false;
            plusBtn.querySelector('span').textContent = 'Avvisami';
        });
    });

});
