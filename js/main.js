document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const langToggle = document.getElementById('lang-toggle');
  const nextSectionBtn = document.getElementById('next-section');
  const prevSectionBtn = document.getElementById('prev-section');
  
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
      document.body.style.overflow = navbar.classList.contains('menu-active') ? 'hidden' : '';
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
        document.body.style.overflow = '';
      }

      const target = document.querySelector(href);
      if (target) {
        const offset = window.innerWidth <= 768 ? 0 : 80;
        window.scrollTo({
          top: target.offsetTop - offset,
          behavior: 'smooth'
        });
      }
    });
  });

  // Mobile Section Navigation
  const sections = Array.from(document.querySelectorAll('section, footer'));
  let currentSectionIndex = 0;

  function updateMobileUX() {
    if (window.innerWidth <= 768) {
      document.body.classList.add('mobile-ux');
    } else {
      document.body.classList.remove('mobile-ux');
    }
  }

  window.addEventListener('resize', updateMobileUX);
  updateMobileUX();

  function scrollToSection(index) {
    if (index >= 0 && index < sections.length) {
      currentSectionIndex = index;
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (nextSectionBtn) {
    nextSectionBtn.addEventListener('click', () => {
      const scrollPos = window.scrollY;
      let nextIndex = sections.findIndex(s => s.offsetTop > scrollPos + 10);
      if (nextIndex !== -1) scrollToSection(nextIndex);
    });
  }

  if (prevSectionBtn) {
    prevSectionBtn.addEventListener('click', () => {
      const scrollPos = window.scrollY;
      let prevIndex = -1;
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop < scrollPos - 10) {
          prevIndex = i;
          break;
        }
      }
      if (prevIndex !== -1) scrollToSection(prevIndex);
    });
  }

  // Active state on scroll
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const sectionId = section.getAttribute('id');
      if (sectionId && scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        current = sectionId;
      }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });
});
