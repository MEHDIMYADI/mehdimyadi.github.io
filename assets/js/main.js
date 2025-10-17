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
let currentLang = localStorage.getItem("lang") || "en";
let currentTheme = localStorage.getItem("theme") || "dark";
let isMenuOpen = false;

// ---------------------- Loading Screen ----------------------
function loadingScreen(data, step = null) {
    const avatarContainer = document.getElementById("avatar-container");
    const loadingTitle = document.getElementById("loading-title");

    if (!avatarContainer) return;

    const steps = [
        data.loading.title,
        data.loading.skills,
        data.loading.projects,
        data.loading.experience,
        data.loading.ready
    ];
    
    if (step !== null && step >= 0 && step < steps.length) {
        avatarContainer.classList.add("loading");
        loadingTitle.textContent = steps[step];
                setTimeout(() => {
            avatarContainer.classList.remove("loading");
        }, 500);
        return;
    }
    
    let index = 0;
    const interval = setInterval(() => {
        if (index >= steps.length) {
            clearInterval(interval);
            avatarContainer.classList.remove("loading");
            return;
        }
        loadingTitle.textContent = steps[index];
        index++;
    }, 500);
}

// ---------------------- Language ----------------------
function updateLangSwitchText() {
    const btn = document.getElementById("langSwitch");
    if (btn) btn.textContent = currentLang === "fa" ? "EN" : "فا";
}

// Update all text content based on language data (no reload of skills/projects)
function updateTextContent(data) {
    document.documentElement.lang = currentLang;
    document.body.setAttribute("dir", currentLang === "fa" ? "rtl" : "ltr");

    document.getElementById("logo").textContent = data.logo.title;
    document.getElementById("hero-title").textContent = data.hero.title;
    document.getElementById("hero-subtitle").textContent = data.hero.subtitle;
    document.getElementById("climber-quote").textContent = data.hero.quote;
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
    document.getElementById("call-title").textContent = data.footer.call;        
    document.getElementById("address-title").textContent = data.footer.address;    
    document.getElementById("dimyadi-title").textContent = data.footer.dimyadi;
    copyright(currentLang);
    loadFooterLinks(currentLang, 'main');
}

function setupLangSwitch() {
    const btn = document.getElementById("langSwitch");
    if (!btn) return;

    btn.addEventListener("click", () => {
        currentLang = currentLang === "fa" ? "en" : "fa";
        localStorage.setItem("lang", currentLang);
        updateLangSwitchText();

        loadLanguage(currentLang).then(data => {
            updateTextContent(data);  // update static titles, nav, etc.
            loadSkills();             // reload skills in new language
            loadProjects();           // reload projects in new language
            loadExperience();         // reload experience in new language
            loadingScreen(data, 4);   // loading screen in new language
        });
    });
}

// ---------------------- Theme ----------------------
function applyTheme(theme) {
    const body = document.body;
    const icon = document.getElementById("themeIcon");

    if (theme === "dark") {
        body.classList.remove("light");
        if (icon) icon.className = "fas fa-moon";
    } else {
        body.classList.add("light");
        if (icon) icon.className = "fas fa-sun";
    }

    localStorage.setItem("theme", theme);
}

function setupThemeSwitch() {
    const btn = document.getElementById("themeSwitch");
    if (!btn) return;

    btn.addEventListener("click", () => {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(currentTheme);
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

	if (document.getElementById('footer')) 
		components.push({ id: 'footer', url: '../../components/footer.html' });
	
	for (const c of components) {
		await loadComponent(c.id, c.url);
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
        const res = await fetch('../../data/footer.json');
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
document.addEventListener("DOMContentLoaded", () => {
    injectSEOData();
	loadAllComponents();
    applyTheme(currentTheme);
    updateLangSwitchText();

    loadLanguage(currentLang).then(data => {
        updateTextContent(data);

        // Start loading screen
        loadingScreen(data);
		
        // Load main content
        loadHero();
        loadSkills();
        loadProjects();
        loadExperience();
    });

    // Setup UI interactions
    setupLangSwitch();
    setupThemeSwitch();
    setupMobileMenu();
    setupScrollHeader();
    setupScrollDown();
    setupNavLinks();
});

// -------------------------------
// Load Hero Section (GitHub Avatar)
// -------------------------------
async function loadHero() {
    try {
        const res = await fetch("https://api.github.com/users/mehdimyadi");
        const data = await res.json();
        const avatar = document.getElementById("hero-avatar");
        if (avatar) avatar.src = data.avatar_url;
    } catch (error) {
        console.error("GitHub avatar could not be loaded:", error);
    }
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
    const res = await fetch("../../data/skills.json");
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
// Load Projects
// -------------------------------
async function loadProjects() {
    const res = await fetch("../../data/projects.json");
    const projects = await res.json();
    const container = document.getElementById("projects-container");
    if (!container) return;

    container.innerHTML = "";
    projects.forEach(proj => {
        const card = document.createElement("div");
        const validLinks = (proj.links || []).filter(link => link.url && link.url.trim() !== "");

        card.className = "project-card overflow-hidden relative";
        card.innerHTML = `
            <div class="project-slider relative overflow-hidden">
                ${proj.images.map((img, i) => `
                    <img src="${img}" alt="${proj.name[currentLang]}" class="project-slider absolute object-cover transition-opacity duration-500 ${i === 0 ? 'opacity-100' : 'opacity-0'}">
                `).join('')}
            </div>
            <div>
                <h3>${proj.name[currentLang]}</h3>
                <p>${proj.description[currentLang]}</p>
            </div>
            <div>
                ${proj.links.map(link => `
                    <button onclick="window.open('${link.url}', '_blank')" title="${link.tooltip[currentLang]}">
                        <i class="${link.icon}"></i>
                    </button>
                `).join('')}
            </div>
        `;

        if (validLinks.length === 0) {
            card.style.pointerEvents = "none";
            card.style.opacity = "0.5";
            card.style.userSelect = "none";
            card.style.filter = "grayscale(70%)";
        }

        container.appendChild(card);

        const imgs = card.querySelectorAll(".project-slider img");
        let current = 0;
        setInterval(() => {
            imgs[current].classList.remove("opacity-100");
            imgs[current].classList.add("opacity-0");
            current = (current + 1) % imgs.length;
            imgs[current].classList.remove("opacity-0");
            imgs[current].classList.add("opacity-100");
        }, 3000);
    });
}

// -------------------------------
// Load Experience
// -------------------------------
async function loadExperience() {
    const res = await fetch("../../data/experience.json");
    const experience = await res.json();
    const container = document.getElementById("experience-container");
    if (!container) return;

    container.innerHTML = "";
    experience.forEach(item => {
        const div = document.createElement("div");
        div.className = "experience-card";
        div.innerHTML = `
            <div class="experience-icon"><i class="fas ${item.icon}"></i></div>
            <div class="experience-text">
                <h3>${item.role[currentLang]}</h3>
                <p>${item.company[currentLang]}</p>
                <p>${item.period[currentLang]}</p>
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
    const res = await fetch('../../data/seo.json');
    if (!res.ok) throw new Error('SEO JSON could not be loaded');
    const seo = await res.json();

    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => s.remove());
    document.querySelectorAll('meta[name="description"]').forEach(m => m.remove());

    ['fa', 'en'].forEach(lang => {
      const data = seo[lang];
      if (!data) return;

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(data, null, 2);
      document.head.appendChild(script);

      if (lang === (navigator.language.startsWith('fa') ? 'fa' : 'en')) {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = data['@graph']?.[1]?.description || '';
        document.head.appendChild(meta);
      }
    });

    console.log('✅ SEO injected: JSON-LD (fa + en) + meta description');
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
