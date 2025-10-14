/* ==================================================
               Mehdi Dimyadi Portfolio
   ================================================== */

// ---------------------- Set VH for mobile ----------------------
function setVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
window.addEventListener('load', setVh);
setVh();

// ---------------------- Global variables ----------------------
let currentLang = localStorage.getItem("lang") || "en";
let currentTheme = localStorage.getItem("theme") || "dark";
let isMenuOpen = false;

// ---------------------- Loading Screen ----------------------
function loadingScreen() {
  window.addEventListener("load", () => {
    const avatarContainer = document.getElementById("avatar-container");
    if (avatarContainer) {
      avatarContainer.classList.remove("loading");
    }
  });
}

// ---------------------- Language ----------------------
function updateLangSwitchText() {
    const btn = document.getElementById("langSwitch");
    btn.textContent = currentLang === "fa" ? "EN" : "فا";
}

function setupLangSwitch() {
    document.getElementById("langSwitch").addEventListener("click", () => {
        currentLang = currentLang === "fa" ? "en" : "fa";
        document.documentElement.lang = currentLang;
        localStorage.setItem("lang", currentLang);

        loadLanguage(currentLang);
        loadSkills();
        loadProjects();
        loadExperience();
        updateLangSwitchText();
    });
}

// ---------------------- Theme ----------------------
function applyTheme(theme) {
    const body = document.body;
    const icon = document.getElementById("themeIcon");

    if (theme === "dark") {
        body.classList.remove("light");
        icon.className = "fas fa-moon";
    } else {
        body.classList.add("light");
        icon.className = "fas fa-sun";
    }

    localStorage.setItem("theme", theme);
}

function setupThemeSwitch() {
    document.getElementById("themeSwitch").addEventListener("click", () => {
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
    menuToggle.addEventListener("click", toggleMobileMenu);

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeMobileMenu();
        });
    });
}

// ---------------------- Scroll Header ----------------------
function setupScrollHeader() {
    window.addEventListener("scroll", () => {
        const header = document.querySelector("header");
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}

// ---------------------- Scroll Down ----------------------
function setupScrollDown() {
    const scrollBtn = document.querySelector('.scroll-down');
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

        const smoothScroll = () => {
            if (userScrolled) return;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        };

        smoothScroll();
    });
}

// ---------------------- DOMContentLoaded ----------------------
document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.lang = currentLang;
    applyTheme(currentTheme);
    loadLanguage(currentLang);
    loadingScreen();
    loadHero();
    loadSkills();
    loadProjects();
    loadExperience();
    setupNavLinks();
    updateLangSwitchText();

    // Setup UI interactions
    setupLangSwitch();
    setupThemeSwitch();
    setupMobileMenu();
    setupScrollHeader();
    setupScrollDown();
});

/* -------------------------------
   Load Hero Section (GitHub Avatar)
--------------------------------*/
async function loadHero() {
    try {
        const res = await fetch("https://api.github.com/users/mehdimyadi");
        const data = await res.json();
        const avatar = document.getElementById("hero-avatar");
        avatar.src = data.avatar_url;
    } catch (error) {
        console.error("GitHub avatar could not be loaded:", error);
    }
}

/* -------------------------------
   Load Language JSON
--------------------------------*/
async function loadLanguage(lang) {
    const response = await fetch(`lang/${lang}.json`);
    const data = await response.json();

    // Direction control
    document.body.setAttribute("dir", lang === "fa" ? "rtl" : "ltr");

    const loadingTitle = document.getElementById('loading-title');

    if (loadingTitle) {
        document.getElementById("loading-title").textContent = data.loading.title;
    }

    // Logo
    document.getElementById("logo").textContent = data.logo.title;

    // Hero
    document.getElementById("hero-title").textContent = data.hero.title;
    document.getElementById("hero-subtitle").textContent = data.hero.subtitle;
    document.getElementById("climber-quote").textContent = data.hero.quote;

    // Section titles
    document.getElementById("skills-title").textContent = data.skills.title;
    document.getElementById("projects-title").textContent = data.projects.title;
    document.getElementById("experience-title").textContent = data.experience.title;

    // Update nav links text
    const navMap = ["home", "skills", "projects", "experience"];
    document.querySelectorAll(".nav-link").forEach((el, i) => {
        el.textContent = data.nav[navMap[i]];
        console.log(data.nav[navMap[i]])
    });

    document.getElementById("dimyadi-title").textContent = data.footer.dimyadi;
    copyright(lang);
}

/* -------------------------------
   Load Skills
--------------------------------*/
async function loadSkills() {
    const res = await fetch("../../data/skills.json");
    const skills = await res.json();
    const container = document.getElementById("skills-container");
    container.innerHTML = "";

    skills.forEach(skill => {
        const level = skill.level || 0;
        const card = document.createElement("div");
        card.className = "skill-card";

        card.innerHTML = `
      <div>
        <i class="${skill.icon}"></i>
      </div>
      <h3>
        ${skill.name[currentLang]}
      </h3>
      <p>
        ${skill.description[currentLang]}
      </p>
      <div class="skill-bar-container">
        <div class="skill-bar-fill"></div>
        <span class="skill-percent">0%</span>
      </div>
    `;
        container.appendChild(card);

        const fill = card.querySelector(".skill-bar-fill");
        const percent = card.querySelector(".skill-percent");

        // Intersection Observer
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let width = 0;
                    const interval = setInterval(() => {
                        if (width >= level) {
                            clearInterval(interval);
                            if (currentLang === "fa") {
                                percent.textContent = `%${level.toLocaleString("fa-IR")}`;
                            } else {
                                percent.textContent = `${level}%`;
                            }
                        } else {
                            width++;
                            fill.style.width = width + "%";
                            if (currentLang === "fa") {
                                percent.textContent = `%${width.toLocaleString("fa-IR")}`;
                            } else {
                                percent.textContent = `${width}%`;
                            }
                        }
                    }, 15);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        observer.observe(card);
    });
}

/* -------------------------------
   Load Projects
--------------------------------*/
async function loadProjects() {
    const res = await fetch("../../data/projects.json");
    const projects = await res.json();
    const container = document.getElementById("projects-container");
    container.innerHTML = "";

    projects.forEach((proj, index) => {
        const card = document.createElement("div");

        const validLinks = (proj.links || []).filter(
            (link) => link.url && link.url.trim() !== ""
        );

        card.className = "project-card overflow-hidden relative";
        card.innerHTML = `
      <div class="project-slider relative overflow-hidden">
        ${proj.images.map((img, i) => `
          <img src="${img}" alt="${proj.name[currentLang]}" class="project-slider absolute object-cover transition-opacity duration-500 ${i === 0 ? 'opacity-100' : 'opacity-0'}">
        `).join('')}
      </div>
      <div>
        <h3>
          ${proj.name[currentLang]}
        </h3>
        <p>
          ${proj.description[currentLang]}
        </p>
      </div>
        <div>
          ${proj.links.map(link => `
          <button onclick="window.open('${link.url}', '_blank')" title="${link.tooltip[currentLang]}"  >
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

/* -------------------------------
   Load Experience
--------------------------------*/
async function loadExperience() {
    const res = await fetch("../../data/experience.json");
    const experience = await res.json();
    const container = document.getElementById("experience-container");
    container.innerHTML = "";

    experience.forEach(item => {
        const div = document.createElement("div");
        div.className = "experience-card";
        div.innerHTML = `
          <div class="experience-icon">
            <i class="fas ${item.icon}"></i>
          </div>
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

/* -------------------------------
   Smooth Scroll for Navbar Links
--------------------------------*/
function setupNavLinks() {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            const target = document.getElementById(link.dataset.section);
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: "smooth"
            });
        });
    });
}

/* -------------------------------
   Footer Copyright
--------------------------------*/
function copyright(lang) {
    const p = document.getElementById('footer-copyright');
    if (!p) return;

    const now = new Date();
    let yearText = '';
    let fullDateText = '';

    if (lang === 'fa') {
        const jDate = toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
        yearText = jDate.jy;
        fullDateText = `${jDate.jd}/${jDate.jm}/${jDate.jy}`;
    } else {
        yearText = now.getFullYear();
        fullDateText = now.toLocaleDateString('en-US');
    }

    const baseText = lang === 'fa' ?
        "مهدی دیمیادی." :
        "Mehdi Dimyadi.";

    p.textContent = `${baseText} © ${yearText}`;
}

/* -------------------------------
   Jalali Date
--------------------------------*/
function toJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
    let jy = -1595 + (33 * Math.floor(days / 12053));
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
        jy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }
    let jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
    return {
        jy,
        jm,
        jd
    };
}
