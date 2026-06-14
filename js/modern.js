/* ==========================================================================
   Lambton College — Project Management : interactions & animations
   Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
    'use strict';

    const $ = (s, ctx = document) => ctx.querySelector(s);
    const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------------------- */
    /* Preloader                                                              */
    /* ---------------------------------------------------------------------- */
    window.addEventListener('load', () => {
        const pre = $('#preloader');
        if (pre) setTimeout(() => pre.classList.add('loaded'), 350);
    });

    /* ---------------------------------------------------------------------- */
    /* Navbar: background on scroll + scroll progress + back-to-top           */
    /* ---------------------------------------------------------------------- */
    const nav = $('.nav');
    const progress = $('#progress');
    const toTop = $('#toTop');

    function onScroll() {
        const y = window.scrollY || document.documentElement.scrollTop;

        if (nav) nav.classList.toggle('scrolled', y > 40);
        if (toTop) toTop.classList.toggle('show', y > 600);

        if (progress) {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
        }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toTop) {
        toTop.addEventListener('click', () =>
            window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
        );
    }

    /* ---------------------------------------------------------------------- */
    /* Mobile menu                                                            */
    /* ---------------------------------------------------------------------- */
    const toggle = $('.nav-toggle');
    const menu = $('.nav-menu');
    const backdrop = $('.nav-backdrop');

    function closeMenu() { document.body.classList.remove('menu-open'); }
    function toggleMenu() { document.body.classList.toggle('menu-open'); }

    if (toggle) toggle.addEventListener('click', toggleMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    if (menu) $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    /* ---------------------------------------------------------------------- */
    /* Scroll reveal (IntersectionObserver) + stagger                         */
    /* ---------------------------------------------------------------------- */
    const animated = $$('[data-anim]');
    if (prefersReduced || !('IntersectionObserver' in window)) {
        animated.forEach(el => el.classList.add('in'));
    } else {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const delay = parseInt(el.dataset.delay || 0, 10);
                setTimeout(() => el.classList.add('in'), delay);
                obs.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        animated.forEach(el => io.observe(el));
    }

    /* ---------------------------------------------------------------------- */
    /* Animated counters                                                      */
    /* ---------------------------------------------------------------------- */
    function animateCount(el) {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = (el.dataset.count.split('.')[1] || '').length;
        const dur = 1800;
        const start = performance.now();

        function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            const val = target * eased;
            el.textContent = val.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }) + suffix;
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }) + suffix;
        }
        requestAnimationFrame(tick);
    }

    const counters = $$('[data-count]');
    if (counters.length) {
        if (prefersReduced || !('IntersectionObserver' in window)) {
            counters.forEach(el => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
        } else {
            const cio = new IntersectionObserver((entries, obs) => {
                entries.forEach(e => {
                    if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); }
                });
            }, { threshold: 0.5 });
            counters.forEach(el => cio.observe(el));
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Scroll spy — highlight active nav link                                 */
    /* ---------------------------------------------------------------------- */
    const sections = $$('section[id]');
    const navLinks = $$('.nav-menu a.link');
    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(l =>
                        l.classList.toggle('active', l.getAttribute('href') === '#' + id)
                    );
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(s => spy.observe(s));
    }

    /* ---------------------------------------------------------------------- */
    /* Hero parallax (subtle)                                                 */
    /* ---------------------------------------------------------------------- */
    const heroBg = $('.hero-bg');
    if (heroBg && !prefersReduced) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            if (y < window.innerHeight) heroBg.style.transform = `scale(1.08) translateY(${y * 0.18}px)`;
        }, { passive: true });
    }

    /* ---------------------------------------------------------------------- */
    /* Forms — friendly fake submit                                           */
    /* ---------------------------------------------------------------------- */
    $$('form[data-fake]').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const ok = form.querySelector('.form-success');
            if (ok) {
                ok.classList.add('show');
                setTimeout(() => ok.classList.remove('show'), 5000);
            }
            form.reset();
        });
    });
})();
