document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const langToggle = document.getElementById('lang-toggle');
  
  // Theme Management
  const currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') {
    document.documentElement.classList.add('light-mode');
    themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
  }

  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light-mode');
    const isLight = document.documentElement.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeToggle.querySelector('i').classList.toggle('fa-moon', !isLight);
    themeToggle.querySelector('i').classList.toggle('fa-sun', isLight);
  });

  // Language Management
  let currentLang = localStorage.getItem('lang') || 'en';
  
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    langToggle.querySelector('.lang-text').textContent = lang === 'en' ? 'ID' : 'EN';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
  }

  langToggle.addEventListener('click', () => {
    setLanguage(currentLang === 'en' ? 'id' : 'en');
  });

  // Initial language load
  setLanguage(currentLang);

  // Mobile menu toggle
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navbar.classList.toggle('menu-active');
      // On mobile, if we want compact, we might not want to hide overflow
      // but let's see how the CSS looks first.
      // document.body.style.overflow = navbar.classList.contains('menu-active') ? 'hidden' : '';
    });
  }

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Smooth scroll for all links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      
      // Close mobile menu if open
      if (navbar.classList.contains('menu-active')) {
        navbar.classList.remove('menu-active');
      }

      const target = document.querySelector(href);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80, // Offset for fixed navbar
          behavior: 'smooth'
        });
      }
    });
  });

  // Add active state to nav links on scroll
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });
});
