/* ==================================================
           Mehdi Dimyadi Portfolio
================================================== */

// ---------------------- Set VH for mobile ----------------------
let lastHeight = window.innerHeight;

function setVh(height = lastHeight) {
    const vh = height * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function handleResize() {
    if (Math.abs(window.innerHeight - lastHeight) > 150) {
        lastHeight = window.innerHeight;
        setVh();
    }
}

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
} else {
    window.addEventListener('resize', handleResize);
}

window.addEventListener('load', () => setVh());
setVh();

// ---------------------- Global variables ----------------------
// First visit: browser language; thereafter: user's own selection
let currentLang = localStorage.getItem("lang") || (navigator.language && navigator.language.toLowerCase().startsWith("fa") ? "fa" : "en");
let currentTheme = localStorage.getItem("theme") || "dark";
let isMenuOpen = false;
let sliderTimers = [];
let langData = null;
let activeFilter = "all";

// ---------------------- Loading Screen ----------------------
async function loadingScreen(data, stepFuncPairs) {
    const avatarContainer = document.getElementById("avatar-container");
    if (!avatarContainer) return;

    const loadingTitle = document.getElementById("loading-title");
    if (!loadingTitle) return;

    avatarContainer.classList.add("loading");

    for (const step of stepFuncPairs) {
        const stepWeight = step.weight || 1;

        // Fade out text
        loadingTitle.style.opacity = 0;
        await new Promise(r => setTimeout(r, 100));

        // Update text
        loadingTitle.textContent = step.text;

        // Fade in text
        loadingTitle.style.opacity = 1;
        await new Promise(r => setTimeout(r, 100));

        // Run actual loading function if exists
        if (step.func) await step.func();
    }

    // Final ready state with checkmark
    avatarContainer.classList.remove("loading");
}

// ---------------------- Language ----------------------
function updateLangSwitchText() {
    const btn = document.getElementById("langSwitch");
    if (btn) btn.textContent = currentLang === "fa" ? "EN" : "فا";
}

// Update all text content based on language data (no reload of skills/projects)
function updateTextContent(data) {
    langData = data;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "fa" ? "rtl" : "ltr";
    document.body.setAttribute("dir", currentLang === "fa" ? "rtl" : "ltr");
    document.title = currentLang === "fa" ? "مهدی دیمیادی | Mehdi Dimyadi" : "Mehdi Dimyadi | مهدی دیمیادی";

    document.getElementById("logo").textContent = data.logo.title;
    document.getElementById("hero-title").textContent = data.hero.title;
    document.getElementById("hero-subtitle").textContent = data.hero.subtitle;
    renderQuote(document.getElementById("climber-quote"), data.hero.quote);
    document.getElementById("skills-title").textContent = data.skills.title;
    document.getElementById("projects-title").textContent = data.projects.title;
    document.getElementById("experience-title").textContent = data.experience.title;

    const navMap = ["home", "skills", "projects", "experience"];
    document.querySelectorAll(".nav-link").forEach((el, i) => {
        el.textContent = data.nav[navMap[i]];
    });

    document.getElementById("about-title").textContent = data.footer.about;
    document.getElementById("links-title").textContent = data.footer.links;
    document.getElementById("contact-title").textContent = data.footer.contact;    
	document.getElementById("support-email").textContent = data.footer.support;        
    document.getElementById("call-title").textContent = data.footer.call;        
    document.getElementById("address-title").textContent = data.footer.address;    
    document.getElementById("dimyadi-title").textContent = data.footer.dimyadi;
    copyright(currentLang);
    loadFooterLinks(currentLang, 'main');

    // Other scripts (enhance.js) are notified of the language change via this event.
    document.dispatchEvent(new CustomEvent("langready", { detail: data }));
}

// -------------------------------
// Saadi's poem: Each hemistich is wrapped in a `<span>` to synchronize with the animation.
// -------------------------------
function renderQuote(el, text) {
    if (!el) return;
    const raw = String(text || "").split("\n").map(l => l.trim()).filter(Boolean);
    const strip = l => l.replace(/^[«"“]\s*/, "").replace(/\s*[»"”]$/, "");
    const author = raw.length && /^[—–-]/.test(raw[raw.length - 1]) ? raw.pop() : "";
    const verses = raw.map(strip);

    el.textContent = "";
    verses.slice(0, 4).forEach((line, i) => {
        const span = document.createElement("span");
        span.className = "pl pl-" + (i + 1);
        span.textContent = line;
        el.appendChild(span);
    });
    if (author) {
        const a = document.createElement("span");
        a.className = "pa";
        a.textContent = author;
        el.appendChild(a);
    }
    const fig = el.closest("figure");
    if (fig) fig.setAttribute("aria-label", verses.join("، ") + (author ? " " + author : ""));
}

function setupLangSwitch() {
    const btn = document.getElementById("langSwitch");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        currentLang = currentLang === "fa" ? "en" : "fa";
        localStorage.setItem("lang", currentLang);
        updateLangSwitchText();

        // Load language data
        const data = await loadLanguage(currentLang);

		// Update texts and UI
        updateTextContent(data);
        injectSEOData();

		// Reload sections
        loadSkills();
        loadProjects();
        loadExperience();

		// Show final ready step in loading screen
        loadingScreen(data, [{ text: data.loading.ready, func: null }]);
    });
}

// ---------------------- Theme ----------------------
function applyTheme(theme) {
    const body = document.body;

    if (theme === "dark") {
        body.classList.remove("light");
    } else {
        body.classList.add("light");
    }

    localStorage.setItem("theme", theme);

    const tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.content = theme === "dark" ? "#0b1120" : "#f8fafc";
}

function updateThemeIcon() {
    const icon = document.getElementById("themeIcon");
    if (!icon) return;
    icon.className = currentTheme === "dark" ? "fas fa-moon" : "fas fa-sun";
}

function setupThemeSwitch() {
    const btn = document.getElementById("themeSwitch");
    if (!btn) return;

    updateThemeIcon();

    btn.addEventListener("click", () => {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(currentTheme);
        updateThemeIcon();
    });
}

// ---------------------- Mobile Menu ----------------------
function toggleMobileMenu() {
    const navMenu = document.getElementById("navMenu");
    const menuToggle = document.getElementById("menuToggle");

    navMenu.classList.toggle("active");
    menuToggle.innerHTML = navMenu.classList.contains("active") ?
        '<i class="fas fa-times"></i>' :
        '<i class="fas fa-bars"></i>';
}

function closeMobileMenu() {
    const navMenu = document.getElementById("navMenu");
    const menuToggle = document.getElementById("menuToggle");

    navMenu.classList.remove("active");
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
}

function setupMobileMenu() {
    const menuToggle = document.getElementById("menuToggle");
    if (!menuToggle) return;

    menuToggle.addEventListener("click", toggleMobileMenu);

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeMobileMenu();
        });
    });
}

// ---------------------- Scroll Header ----------------------
function setupScrollHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) header.classList.add("scrolled");
        else header.classList.remove("scrolled");
    });
}

// ---------------------- Scroll Down ----------------------
function setupScrollDown() {
    const scrollBtn = document.querySelector('.scroll-down');
    if (!scrollBtn) return;

    let userScrolled = false;
    window.addEventListener("wheel", () => userScrolled = true, { passive: true });
    window.addEventListener("touchmove", () => userScrolled = true, { passive: true });

    scrollBtn.addEventListener('click', (e) => {
        e.preventDefault();
        userScrolled = false;

        const target = document.querySelector('#skills-title');
        const headerOffset = document.querySelector('header').offsetHeight;
        const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;

        if (!userScrolled) {
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    });
}

// ---------------------- load Components ----------------------
async function loadAllComponents() {
	const components = [];

	if (document.getElementById('header'))
		components.push({ id: 'header', url: 'components/header.html' });
		
	if (document.getElementById('heroComp')) 
		components.push({ id: 'heroComp', url: 'components/hero.html' });

	if (document.getElementById('footer')) 
		components.push({ id: 'footer', url: 'components/footer.html' });
	
	for (const c of components) {
		await loadComponent(c.id, c.url);

		// Call setup functions after the component has loaded
		if (c.id === 'header') {
			updateLangSwitchText();
			setupLangSwitch();
			setupThemeSwitch();
			setupMobileMenu();
		}
    }
}

function loadComponent(id, url) {
    return fetch(url)
        .then(res => res.text())
        .then(html => {
            document.getElementById(id).innerHTML = html;
        });
}

// ---------------------- load Footer Links ----------------------
async function loadFooterLinks(lang, section = 'main') {
    try {
        const res = await fetch('data/footer.json');
        const data = await res.json();
        const links = data.links[section];

        const ul = document.getElementById('footer-links');
        if (!ul || !links) return;

        ul.innerHTML = '';

        links.forEach(link => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text[lang] || link.text['en'];
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            li.appendChild(a);
            ul.appendChild(li);
        });
    } catch (err) {
        console.error('Error loading footer links:', err);
    }
}

// ---------------------- DOMContentLoaded ----------------------
document.addEventListener("DOMContentLoaded", async () => {
	applyTheme(currentTheme);
	injectSEOData();
	
	const data = await loadLanguage(currentLang);
	await loadAllComponents();

	// UI before loading main content
    setupScrollHeader();
    setupScrollDown();
    setupNavLinks();

    // Load the main content
    loadHero(data);          // بدون await: متن‌ها منتظر شبکه نمی‌مانند
    updateTextContent(data);
    
    const steps = [
        { text: data.loading.title, func: null },
        { text: data.loading.skills, func: loadSkills },
        { text: data.loading.projects, func: loadProjects },
        { text: data.loading.experience, func: loadExperience },
        { text: data.loading.ready, func: null }
    ];

    await loadingScreen(data, steps);
});


// -------------------------------
// Load Hero Section (GitHub Avatar)
// -------------------------------
async function loadHero(data) {
    const avatar = document.getElementById("hero-avatar");
    if (!avatar) return;
    avatar.alt = data.hero.title;
    // آدرس مستقیم آواتار؛ بدون API (محدودیت ۶۰ درخواست در ساعت ندارد)
    avatar.onerror = () => {
        avatar.onerror = null;
        avatar.src = "assets/images/icon-512.png";
    };
    avatar.src = "https://github.com/MEHDIMYADI.png?size=400";
}

// -------------------------------
// Load Language JSON
// -------------------------------
async function loadLanguage(lang) {
    const response = await fetch(`lang/${lang}.json`);
    const data = await response.json();
    return data;
}

// -------------------------------
// Load Skills
// -------------------------------
async function loadSkills() {
    const res = await fetch("data/skills.json");
    const skills = await res.json();
    const container = document.getElementById("skills-container");
    if (!container) return;

    container.innerHTML = "";
    skills.forEach(skill => {
        const level = skill.level || 0;
        const card = document.createElement("div");
        card.className = "skill-card";

        card.innerHTML = `
            <div><i class="${skill.icon}"></i></div>
            <h3>${skill.name[currentLang]}</h3>
            <p>${skill.description[currentLang]}</p>
            <div class="skill-bar-container">
                <div class="skill-bar-fill"></div>
                <span class="skill-percent">0%</span>
            </div>
        `;
        container.appendChild(card);

        const fill = card.querySelector(".skill-bar-fill");
        const percent = card.querySelector(".skill-percent");

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let width = 0;
                    const interval = setInterval(() => {
                        if (width >= level) {
                            clearInterval(interval);
                            percent.textContent = currentLang === "fa" ? `%${level.toLocaleString("fa-IR")}` : `${level}%`;
                        } else {
                            width++;
                            fill.style.width = width + "%";
                            percent.textContent = currentLang === "fa" ? `%${width.toLocaleString("fa-IR")}` : `${width}%`;
                        }
                    }, 15);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(card);
    });
}

// -------------------------------
// Load Projects (with category filter + slider dots)
// -------------------------------
const FILTER_ORDER = ["all", "mobile", "desktop", "web", "embedded", "automation"];

function projectLabels() {
    return (langData && langData.projects && langData.projects.filters) || {};
}

function renderProjectFilters(projects) {
    const bar = document.getElementById("projects-filter");
    if (!bar) return;

    const labels = projectLabels();
    const counts = { all: projects.length };
    projects.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    const nf = new Intl.NumberFormat(currentLang === "fa" ? "fa-IR" : "en-US");

    if (!counts[activeFilter]) activeFilter = "all";

    bar.innerHTML = FILTER_ORDER.filter(k => counts[k]).map(k => `
        <button type="button" class="filter-chip${k === activeFilter ? " active" : ""}" data-filter="${k}" aria-pressed="${k === activeFilter}">
            <span>${labels[k] || k}</span><span class="count">${nf.format(counts[k])}</span>
        </button>`).join("");

    bar.querySelectorAll(".filter-chip").forEach(btn => {
        btn.addEventListener("click", () => applyProjectFilter(btn.dataset.filter));
    });
}

function applyProjectFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll("#projects-filter .filter-chip").forEach(btn => {
        const on = btn.dataset.filter === filter;
        btn.classList.toggle("active", on);
        btn.setAttribute("aria-pressed", on);
    });
    document.querySelectorAll("#projects-container .project-card").forEach(card => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.classList.toggle("is-filtered", !show);
        if (show) {
            card.classList.remove("pop");
            void card.offsetWidth;           // برای شروع دوباره‌ی انیمیشن
            card.classList.add("pop");
        }
    });
}

async function loadProjects() {
    const res = await fetch("data/projects.json");
    const projects = await res.json();
    const container = document.getElementById("projects-container");
    if (!container) return;

    sliderTimers.forEach(clearInterval);
    sliderTimers = [];
    container.innerHTML = "";

    renderProjectFilters(projects);
    const labels = projectLabels();
    const soon = (langData && langData.projects && langData.projects.soon) || "Soon";

    projects.forEach(proj => {
        const name = proj.name[currentLang];
        const images = proj.images || [];
        const validLinks = (proj.links || []).filter(link => link.url && link.url.trim() !== "");

        const card = document.createElement("div");
        card.className = "project-card";
        card.dataset.cat = proj.category || "other";
        card.innerHTML = `
            <div class="project-slider">
                ${images.map((img, i) => `<img src="${img}" alt="${name}" loading="lazy" decoding="async" class="${i === 0 ? "opacity-100" : "opacity-0"}">`).join("")}
                ${labels[proj.category] ? `<span class="proj-badge">${labels[proj.category]}</span>` : ""}
                ${validLinks.length === 0 ? `<span class="proj-soon">${soon}</span>` : ""}
                ${images.length > 1 ? `<div class="slider-dots">${images.map((_, i) => `<button type="button" class="dot${i === 0 ? " on" : ""}" aria-label="${i + 1}"></button>`).join("")}</div>` : ""}
            </div>
            <div>
                <h3>${name}</h3>
                <p>${proj.description[currentLang]}</p>
            </div>
            <div class="project-links">
                ${validLinks.map(link => `
                    <button type="button" data-url="${link.url}" title="${link.tooltip[currentLang]}" aria-label="${link.tooltip[currentLang]}">
                        <i class="${link.icon}"></i>
                    </button>`).join("")}
            </div>
        `;

        if (validLinks.length === 0) {
            card.classList.add("is-disabled");
            card.style.pointerEvents = "none";
        }

        // Instead of onclick in HTML (safer and more controllable)
        card.querySelectorAll("button[data-url]").forEach(btn => {
            btn.addEventListener("click", () => window.open(btn.dataset.url, "_blank", "noopener,noreferrer"));
        });

        container.appendChild(card);

        // Slider + Dots
        const imgs = card.querySelectorAll(".project-slider img");
        const dots = card.querySelectorAll(".slider-dots .dot");
        if (imgs.length > 1) {
            let current = 0;
            const show = i => {
                imgs[current].classList.replace("opacity-100", "opacity-0");
                dots[current] && dots[current].classList.remove("on");
                current = i;
                imgs[current].classList.replace("opacity-0", "opacity-100");
                dots[current] && dots[current].classList.add("on");
            };
            let timer = setInterval(() => show((current + 1) % imgs.length), 3500);
            sliderTimers.push(timer);

            dots.forEach((dot, i) => dot.addEventListener("click", e => {
                e.stopPropagation();
                show(i);
                clearInterval(timer);
                timer = setInterval(() => show((current + 1) % imgs.length), 3500);
                sliderTimers.push(timer);
            }));
        }
    });

    if (activeFilter !== "all") applyProjectFilter(activeFilter);
}

// -------------------------------
// Load Experience (Timeline)
// -------------------------------
async function loadExperience() {
    const res = await fetch("data/experience.json");
    const experience = await res.json();
    const container = document.getElementById("experience-container");
    if (!container) return;

    container.innerHTML = "";
    experience.forEach(item => {
        const div = document.createElement("div");
        div.className = "experience-card";
        div.innerHTML = `
            <span class="tl-node" aria-hidden="true"></span>
            <div class="experience-icon"><i class="${item.icon}"></i></div>
            <div class="experience-text">
                <h3>${item.role[currentLang]}</h3>
                <p class="exp-company">${item.company[currentLang]}</p>
                <p class="exp-period">${item.period[currentLang]}</p>
                <p>${item.details[currentLang]}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

// -------------------------------
// Load SEO Data
// -------------------------------
async function injectSEOData() {
  try {
    const res = await fetch('data/seo.json');
    if (!res.ok) throw new Error('SEO JSON could not be loaded');
    const seo = await res.json();

    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => s.remove());
    document.querySelectorAll('meta[name="description"]').forEach(m => m.remove());

    ['fa', 'en'].forEach(lang => {
      const data = seo[lang];
      if (!data) return;

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
    });

    // Meta description in the page's current language
    const cur = seo[currentLang];
    const site = cur && cur['@graph'] && cur['@graph'].find(g => g['@type'] === 'WebSite');
    if (site && site.description) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = site.description;
      document.head.appendChild(meta);
    }
    //Does your page support rich results?
    //https://search.google.com/test/rich-results
  } catch (err) {
    console.error('⚠️ injectSEOData Error:', err);
  }
}

// -------------------------------
// Smooth Scroll for Navbar Links
// -------------------------------
function setupNavLinks() {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            const target = document.getElementById(link.dataset.section);
            if (!target) return;

            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: "smooth"
            });
        });
    });
}

// -------------------------------
// Footer Copyright
// -------------------------------
function copyright(lang) {
    const p = document.getElementById('footer-copyright');
    if (!p) return;

    const now = new Date();
    let yearText = '';

    if (lang === 'fa') {
        const jDate = toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
        yearText = jDate.jy;
    } else {
        yearText = now.getFullYear();
    }

    const baseText = lang === 'fa' ? "مهدی دیمیادی." : "Mehdi Dimyadi.";
    p.textContent = `${baseText} © ${yearText}`;

    loadSiteVersion();
}

// -------------------------------
// Site version from the latest GitHub tag
// -------------------------------
const SITE_REPO = 'MEHDIMYADI/mehdimyadi.github.io';

async function fetchLatestRelease(repo) {
    // The API does not guarantee the order of tags; we select the highest version ourselves (v1.10.0 > v1.9.0)
    const pickNewest = names => names.reduce((a, b) => {
        const x = (a.match(/\d+/g) || []).map(Number), y = (b.match(/\d+/g) || []).map(Number);
        for (let i = 0; i < Math.max(x.length, y.length); i++) {
            if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0) ? a : b;
        }
        return a;
    });

    try {
        const res = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=100`);
        if (res.ok) {
            const tags = await res.json();
            if (tags.length) return pickNewest(tags.map(t => t.name));
        }
    } catch (err) { console.warn(`fetchLatestRelease(tags) ${repo}:`, err.message); }

    try {
        const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
        if (res.ok) return (await res.json()).tag_name || null;
    } catch (err) { console.warn(`fetchLatestRelease(releases) ${repo}:`, err.message); }

    return null;
}

async function loadSiteVersion() {
    const el = document.getElementById('site-version');
    if (!el || el.dataset.loaded) return;

    const show = tag => {
        el.querySelector('.vb-text').textContent = /^v/i.test(tag) ? tag : `v${tag}`;
        el.href = `https://github.com/${SITE_REPO}/releases/tag/${tag}`;
        el.hidden = false;
    };

    const cached = sessionStorage.getItem('site-version-cache');
    if (cached) show(cached);

    const tag = await fetchLatestRelease(SITE_REPO);
    if (tag) {
        show(tag);
        el.dataset.loaded = '1';
        sessionStorage.setItem('site-version-cache', tag);
    }   // Error or no tag: cached value remains; otherwise, the badge stays hidden.
}

// -------------------------------
// Jalali Date Conversion
// -------------------------------
function toJalali(gy, gm, gd) {
    const g_d_m = [0,31,59,90,120,151,181,212,243,273,304,334];
    let gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = 355666 + (365*gy) + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100) + Math.floor((gy2+399)/400) + gd + g_d_m[gm-1];
    let jy = -1595 + (33*Math.floor(days/12053));
    days %= 12053;
    jy += 4*Math.floor(days/1461);
    days %= 1461;
    if (days > 365) {
        jy += Math.floor((days-1)/365);
        days = (days-1)%365;
    }
    let jm = (days < 186) ? 1 + Math.floor(days/31) : 7 + Math.floor((days-186)/30);
    let jd = 1 + ((days < 186) ? (days%31) : ((days-186)%30));
    return { jy, jm, jd };
}
