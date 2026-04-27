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
  function closeMobileMenu() {
    if (navbar.classList.contains('menu-active')) {
      navbar.classList.remove('menu-active');
      document.body.style.overflow = '';
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navbar.classList.toggle('menu-active');
      document.body.style.overflow = navbar.classList.contains('menu-active') ? 'hidden' : '';
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navbar.classList.contains('menu-active') && !navbar.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Native App UX Implementation
  const appWrapper = document.getElementById('app-wrapper');
  const allPages = Array.from(document.querySelectorAll('#app-wrapper > section'));
  let currentPageIndex = 0;
  
  // Swipe State
  let touchStartX = 0;
  let touchStartY = 0;
  let startTime = 0;
  let isScrolling = false;
  let isSwiping = false;
  let currentTranslate = 0;
  let isDragging = false;

  // Thresholds
  const swipeThreshold = 50; // Minimum distance for slow swipes
  const velocityThreshold = 0.4; // Pixels per ms for inertia-based swipes

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function goToPage(index, animate = true) {
    if (index < 0 || index >= allPages.length) {
        index = Math.max(0, Math.min(index, allPages.length - 1));
    }
    
    currentPageIndex = index;
    const offset = -currentPageIndex * 100;
    
    if (isMobile()) {
      if (animate) {
        appWrapper.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      } else {
        appWrapper.style.transition = 'none';
      }

      requestAnimationFrame(() => {
        appWrapper.style.transform = `translateX(${offset}vw)`;
        currentTranslate = -currentPageIndex * window.innerWidth;
      });

      updateActiveNavLink();

      // Fix for Leaflet maps when page becomes visible
      const targetPage = allPages[currentPageIndex];
      if (targetPage && targetPage.id === 'map') {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          // Access the map instance from window.earthquakeMap (to be set in earthquake.js)
          if (window.earthquakeMap) {
            window.earthquakeMap.invalidateSize();
          }
        }, 300);
      }
    } else {
      const target = allPages[currentPageIndex];
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    }
  }

  function updateActiveNavLink() {
    const currentPage = allPages[currentPageIndex];
    if (!currentPage) return;
    const sectionId = currentPage.getAttribute('id');
    
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      if (sectionId && link.getAttribute('href').slice(1) === sectionId) {
        link.classList.add('active');
      }
    });
  }

  // Improved Swipe Detection with Real-time Dragging
  document.addEventListener('touchstart', e => {
    if (!isMobile()) return;
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    startTime = performance.now();
    isScrolling = false;
    isSwiping = false;
    isDragging = false;
    
    currentTranslate = -currentPageIndex * window.innerWidth;
    appWrapper.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!isMobile() || isScrolling) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    const diffX = touchX - touchStartX;
    const diffY = touchY - touchStartY;
    
    if (!isSwiping && !isScrolling) {
      if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 8) {
        isScrolling = true;
      } else if (Math.abs(diffX) > 8) {
        isSwiping = true;
        isDragging = true;
      }
    }

    if (isSwiping) {
      if (e.cancelable) e.preventDefault();
      const translateX = currentTranslate + diffX;
      requestAnimationFrame(() => {
        appWrapper.style.transform = `translateX(${translateX}px)`;
      });
    }
  }, { passive: false });

  function handleGestureEnd(e) {
    if (!isMobile() || isScrolling || !isSwiping) {
        if (isMobile()) appWrapper.style.transition = '';
        return;
    }
    
    const touchEndX = e.changedTouches[0].clientX;
    const endTime = performance.now();
    const diffX = touchEndX - touchStartX;
    const duration = endTime - startTime;
    const velocity = Math.abs(diffX) / duration;
    
    isSwiping = false;
    isDragging = false;
    handleSwipeResult(diffX, velocity);
  }

  document.addEventListener('touchend', handleGestureEnd, { passive: true });
  document.addEventListener('touchcancel', () => {
    if (isMobile()) {
      isSwiping = false;
      isScrolling = false;
      isDragging = false;
      goToPage(currentPageIndex);
    }
  }, { passive: true });

  function handleSwipeResult(diffX, velocity) {
    const isFastSwipe = velocity > velocityThreshold;
    const isLongSwipe = Math.abs(diffX) > window.innerWidth / 3;

    if (isFastSwipe || isLongSwipe) {
      if (diffX < 0) {
        goToPage(currentPageIndex + 1);
      } else {
        goToPage(currentPageIndex - 1);
      }
    } else {
      goToPage(currentPageIndex);
    }
  }

  // Handle Navbar Link Clicks
  document.querySelectorAll('.nav-links a, .logo, .footer-links a, .btn').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      
      const targetId = href.slice(1);
      const targetIndex = allPages.findIndex(p => p.id === targetId);
      
      if (targetIndex !== -1 && isMobile()) {
        e.preventDefault();
        goToPage(targetIndex);
        closeMobileMenu();
      } else if (targetIndex !== -1) {
        // Desktop behavior - smooth scroll and sync index
        e.preventDefault();
        currentPageIndex = targetIndex;
        const target = allPages[currentPageIndex];
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
          });
        }
        updateActiveNavLink();
      }
    });
  });

  // Initial Check
  if (isMobile()) {
    document.body.classList.add('mobile-ux');
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    updateActiveNavLink();
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      appWrapper.style.transform = 'none';
      document.body.classList.remove('mobile-ux');
      document.body.style.overflow = '';
      document.body.style.position = '';
    } else {
      document.body.classList.add('mobile-ux');
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      goToPage(currentPageIndex);
    }
  });
});
