/* ==================================================
           Mehdi Dimyadi Portfolio
================================================== */

(() => {
    'use strict';

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = matchMedia('(hover: hover)').matches;
    const $ = (s, r = document) => r.querySelector(s);

    /* ---------- Decorative Elements ---------- */
    document.body.insertAdjacentHTML('afterbegin', `
        <div class="aurora" aria-hidden="true"><span></span><span></span><span></span></div>
        ${canHover ? '<div id="cursor-glow" aria-hidden="true"></div>' : ''}
    `);
    const backBtn = document.createElement('button');
    backBtn.id = 'back-to-top';
    backBtn.type = 'button';
    backBtn.setAttribute('aria-label', 'Back to top');
    backBtn.innerHTML = `
    <svg viewBox="0 0 52 52" aria-hidden="true">
        <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#0fa39a"/><stop offset=".55" stop-color="#f2a93b"/><stop offset="1" stop-color="#ee6c5a"/>
        </linearGradient></defs>
        <circle class="ring-bg" cx="26" cy="26" r="23"/><circle class="ring-fg" cx="26" cy="26" r="23"/>
    </svg>
    <i class="fas fa-arrow-up" aria-hidden="true"></i>`;
    backBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
    document.body.appendChild(backBtn);

    /* ---------- Scroll: Progress bar + Back-to-top button + Scrollspy ---------- */
    let ticking = false;

    function onScroll() {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        h.style.setProperty('--scroll', (max > 0 ? Math.min(1, h.scrollTop / max) : 0).toFixed(4));
        backBtn.classList.toggle('show', h.scrollTop > 600);
        updateSpy();
        ticking = false;
    }
    addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });

    function updateSpy() {
        const links = document.querySelectorAll('.nav-link');
        if (!links.length) return;
        const y = scrollY + 140;
        let current = links[0];
        links.forEach(l => {
            const t = document.getElementById(l.dataset.section);
            if (!t) return;
            const top = t.getBoundingClientRect().top + scrollY;
            if (top <= y) current = l;
        });
        links.forEach(l => l.classList.toggle('active', l === current));
    }

    /* ---------- mouse light ---------- */
    const glow = $('#cursor-glow');
    if (glow) {
        let gx = 0, gy = 0, raf = 0;
        addEventListener('pointermove', e => {
            gx = e.clientX; gy = e.clientY;
            if (!raf) raf = requestAnimationFrame(() => {
                glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
                raf = 0;
            });
        }, { passive: true });
    }

    /* ---------- Reveal ---------- */
    const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                en.target.classList.add('in-view');
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    /* ---------- 3D Tilt + Inner Card Glow ---------- */
    function bindCard(card) {
        if (card.dataset.fx || !canHover) return;
        card.dataset.fx = '1';
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;
            card.style.setProperty('--mx', (x * 100) + '%');
            card.style.setProperty('--my', (y * 100) + '%');
            if (reduce) return;
            card.classList.add('tilting');
            card.style.transform =
                `perspective(900px) rotateX(${((.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - .5) * 9).toFixed(2)}deg) translateY(-6px)`;
        });
        card.addEventListener('pointerleave', () => {
            card.classList.remove('tilting');
            card.style.transform = '';
        });
    }

   /* Cards and headings (content generated via JS; only direct children are visible) */
    function enhanceContent() {
        document.querySelectorAll('.section-title').forEach(el => {
            if (el.dataset.r) return;
            el.dataset.r = '1';
            io.observe(el);
        });
        ['#skills-container', '#projects-container', '#experience-container'].forEach(sel => {
            const box = $(sel);
            if (!box) return;
            [...box.children].forEach((card, i) => {
                if (card.dataset.r) return;
                card.dataset.r = '1';
                card.classList.add('reveal');
                card.style.setProperty('--d', (sel === '#experience-container' ? 0 : (i % 3) * 110) + 'ms');
                io.observe(card);
                bindCard(card);
            });
        });
        const bar2 = $('#projects-filter');
        if (bar2 && !bar2.dataset.r) {
            bar2.dataset.r = '1';
            bar2.classList.add('reveal');
            io.observe(bar2);
        }
    }

    /* ---------- Roles typed below the name (from lang/*.json → hero.roles) ---------- */
    let typeTimer = 0, roles = [], ri = 0, ci = 0, deleting = false;
    function typeTick() {
        const el = $('#role-text');
        if (!el || !roles.length) return;
        const full = roles[ri];
        if (!deleting) {
            ci++;
            el.textContent = full.slice(0, ci);
            if (ci >= full.length) { deleting = true; typeTimer = setTimeout(typeTick, 1800); return; }
            typeTimer = setTimeout(typeTick, 55 + Math.random() * 45);
        } else {
            ci--;
            el.textContent = full.slice(0, ci);
            if (ci <= 0) { deleting = false; ri = (ri + 1) % roles.length; typeTimer = setTimeout(typeTick, 380); return; }
            typeTimer = setTimeout(typeTick, 26);
        }
    }
    function startRoles(list) {
        clearTimeout(typeTimer);
        const el = $('#role-text'), box = $('#hero-roles');
        if (!el || !box || !Array.isArray(list) || !list.length) return;
        roles = list; ri = 0; ci = 0; deleting = false;
        box.removeAttribute('aria-hidden');
        box.setAttribute('role', 'img');
        box.setAttribute('aria-label', list.join(' • '));
        if (reduce) { el.textContent = list[0]; return; }
        el.textContent = '';
        typeTimer = setTimeout(typeTick, 500);
    }
    document.addEventListener('langready', e => {
        const r = e.detail && e.detail.hero && e.detail.hero.roles;
        // Wait a bit for the Hero component to be in the DOM
        setTimeout(() => startRoles(r), 0);
    });

    /* ---------- Saadi Medallion: Animation stops when not visible ---------- */
    function watchMedallion() {
        const m = $('#saadi-medallion');
        if (!m || m.dataset.watch) return;
        m.dataset.watch = '1';
        new IntersectionObserver(([en]) => {
            m.classList.toggle('paused', !en.isIntersecting);
        }).observe(m);
        // You can also hold it for a few moments—using focus or touch—to read the poem.
        const hold = on => m.classList.toggle('hold', on);
        m.addEventListener('pointerenter', () => hold(true));
        m.addEventListener('pointerleave', () => hold(false));
        m.addEventListener('focus', () => hold(true));
        m.addEventListener('blur', () => hold(false));
    }

    /* ---------- Accessibility: Links without href ---------- */
    function enhanceA11y() {
        document.querySelectorAll('.nav-link, .scroll-down').forEach(el => {
            if (el.dataset.a11y) return;
            el.dataset.a11y = '1';
            el.setAttribute('role', 'link');
            el.tabIndex = 0;
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
            });
        });
        const sd = $('.scroll-down');
        if (sd && !sd.getAttribute('aria-label')) sd.setAttribute('aria-label', 'Scroll down');
    }

    /* ---------- Connected particles (Constellation) behind the Hero ---------- */
    function initParticles() {
        const hero = $('#hero');
        if (!hero || $('#hero-canvas') || reduce) return;

        const cv = document.createElement('canvas');
        cv.id = 'hero-canvas';
        cv.setAttribute('aria-hidden', 'true');
        hero.prepend(cv);
        const ctx = cv.getContext('2d');

        let w = 0, h = 0, dpr = 1, pts = [], visible = true;
        const mouse = { x: -9999, y: -9999 };
        let rgb = '96,165,250';

        function readColor() {
            const c = getComputedStyle(document.body).getPropertyValue('--accent-color').trim();
            const m = /^#?([0-9a-f]{6})$/i.exec(c);
            if (m) {
                const n = parseInt(m[1], 16);
                rgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
            }
        }
        function resize() {
            dpr = Math.min(devicePixelRatio || 1, 2);
            w = hero.clientWidth; h = hero.clientHeight;
            cv.width = w * dpr; cv.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.min(70, Math.floor((w * h) / 16000));
            pts = Array.from({ length: count }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
                r: Math.random() * 1.6 + .6
            }));
        }
        function frame() {
            if (visible && !document.hidden) {
                ctx.clearRect(0, 0, w, h);
                for (const p of pts) {
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0 || p.x > w) p.vx *= -1;
                    if (p.y < 0 || p.y > h) p.vy *= -1;
                    const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
                    if (d2 < 16000) { const f = (1 - d2 / 16000) * .6; p.x += dx * f * .05; p.y += dy * f * .05; }
                    ctx.beginPath();
                    ctx.fillStyle = `rgba(${rgb},.8)`;
                    ctx.arc(p.x, p.y, p.r, 0, 6.2832);
                    ctx.fill();
                }
                for (let i = 0; i < pts.length; i++) {
                    for (let j = i + 1; j < pts.length; j++) {
                        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                        const d2 = dx * dx + dy * dy;
                        if (d2 < 14400) {
                            ctx.strokeStyle = `rgba(${rgb},${(1 - d2 / 14400) * .35})`;
                            ctx.lineWidth = .8;
                            ctx.beginPath();
                            ctx.moveTo(pts[i].x, pts[i].y);
                            ctx.lineTo(pts[j].x, pts[j].y);
                            ctx.stroke();
                        }
                    }
                }
            }
            requestAnimationFrame(frame);
        }

        hero.addEventListener('pointermove', e => {
            const r = hero.getBoundingClientRect();
            mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
        new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(hero);
        new ResizeObserver(resize).observe(hero);
        new MutationObserver(readColor).observe(document.body, { attributes: true, attributeFilter: ['class'] });

        readColor(); resize(); frame();
    }

    /* ---------- Theme change with circular animation ---------- */
    let themeBypass = false;
    document.addEventListener('click', e => {
        const btn = e.target.closest && e.target.closest('#themeSwitch');
        if (!btn || themeBypass) return;
        if (reduce || !document.startViewTransition) return;

        e.stopImmediatePropagation();
        const r = btn.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

        const t = document.startViewTransition(() => {
            themeBypass = true;
            btn.click();
            themeBypass = false;
        });
        t.ready.then(() => {
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
            );
        }).catch(() => {});
    }, true);


    /* ---------- The Hero always fits exactly onto one screen ---------- */
    function fitHero() {
        const hero = $('#hero'), c = $('#hero .hero-content');
        if (!hero || !c) return;

        const header = $('header');
        if (header) document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');

        c.style.setProperty('--fit', 1);                       // Measure the natural size
        const cs = getComputedStyle(hero);
        const availH = hero.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const availW = hero.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const h = c.offsetHeight, w = c.offsetWidth;           // offset* is not affected by transform.
        if (!h || !w) return;

        const s = Math.max(.55, Math.min(1, availH / h, availW / w));
        c.style.setProperty('--fit', s.toFixed(3));
    }
    let fitRaf = 0;
    const scheduleFit = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitHero); };
    addEventListener('resize', scheduleFit, { passive: true });
    addEventListener('orientationchange', () => setTimeout(scheduleFit, 250));
    if (window.visualViewport) visualViewport.addEventListener('resize', scheduleFit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);
    document.addEventListener('langready', () => setTimeout(scheduleFit, 60));

    /* ---------- Observing DOM changes (direct children only; lightweight and fast) ---------- */
    function refresh() {
        enhanceContent();
        enhanceA11y();
        initParticles();
        watchMedallion();
        scheduleFit();
        updateSpy();
    }
    ['#header', '#heroComp', '#footer', '#skills-container', '#projects-container', '#experience-container']
        .forEach(sel => {
            const el = $(sel);
            if (el) new MutationObserver(refresh).observe(el, { childList: true });
        });
    refresh();
    onScroll();
})();
