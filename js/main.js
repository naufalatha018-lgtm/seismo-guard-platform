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

  // Mobile Native App UX Implementation
  const appWrapper = document.getElementById('app-wrapper');
  const allPages = Array.from(document.querySelectorAll('#app-wrapper > section, #app-wrapper > footer'));
  let currentPageIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  const swipeThreshold = 50;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  let globalMapInstance = null;

  function goToPage(index) {
    if (index < 0 || index >= allPages.length) return;
    
    currentPageIndex = index;
    const offset = -currentPageIndex * 100;
    
    if (isMobile()) {
      appWrapper.style.transform = `translateX(${offset}vw)`;
      // Update active nav link
      updateActiveNavLink();

      // Fix for Leaflet maps when page becomes visible
      const targetPage = allPages[currentPageIndex];
      if (targetPage && (targetPage.id === 'map' || targetPage.id === 'earthquake')) {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          if (globalMapInstance) globalMapInstance.invalidateSize();
        }, 300);
      }
    } else {
      // Desktop vertical scroll
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
    const sectionId = currentPage.getAttribute('id');
    
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      if (sectionId && link.getAttribute('href').slice(1) === sectionId) {
        link.classList.add('active');
      }
    });
  }

  // Swipe Detection
  let isScrolling = false;

  document.addEventListener('touchstart', e => {
    if (!isMobile()) return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    isScrolling = false;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!isMobile()) return;
    
    const touchX = e.changedTouches[0].screenX;
    const touchY = e.changedTouches[0].screenY;
    
    const diffX = Math.abs(touchX - touchStartX);
    const diffY = Math.abs(touchY - touchStartY);
    
    // If user is clearly scrolling vertically, mark it
    if (diffY > diffX && diffY > 10) {
      isScrolling = true;
    }
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (!isMobile() || isScrolling) return;
    touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    
    handleSwipe(touchStartX, touchEndX, touchStartY, touchEndY);
  }, { passive: true });

  function handleSwipe(startX, endX, startY, endY) {
    const diffX = endX - startX;
    const diffY = endY - startY;

    // Strict check: horizontal movement must be significantly greater than vertical
    if (Math.abs(diffX) > Math.abs(diffY) * 2 && Math.abs(diffX) > swipeThreshold) {
      if (diffX < 0) {
        // Swipe Left -> Next Page
        goToPage(currentPageIndex + 1);
      } else {
        // Swipe Right -> Prev Page
        goToPage(currentPageIndex - 1);
      }
    }
  }

  // Initialize Global Map Placeholder if it exists
  function initGlobalMap() {
    const globalMapContainer = document.getElementById('global-map');
    if (globalMapContainer && typeof L !== 'undefined') {
        globalMapContainer.innerHTML = '';
        globalMapInstance = L.map('global-map').setView([0, 115], 3); // Centered on Indonesia/Pacific
        
        const isDarkMode = !document.documentElement.classList.contains('light-mode');
        const tileLayer = isDarkMode 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileLayer, {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(globalMapInstance);
        
        // Add a few placeholder markers for global activity
        const locations = [
            { lat: -6.2, lng: 106.8, title: "Jakarta Region" },
            { lat: 35.6, lng: 139.6, title: "Tokyo Region" },
            { lat: 34.0, lng: -118.2, title: "Los Angeles Region" }
        ];
        
        locations.forEach(loc => {
            L.circleMarker([loc.lat, loc.lng], {
                radius: 8,
                fillColor: "#ff4444",
                color: "#fff",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(globalMap).bindPopup(loc.title);
        });
        
        // Fix map size on tab/page change
        setTimeout(() => globalMap.invalidateSize(), 500);
    }
  }

  // Call initGlobalMap
  if (document.getElementById('global-map')) {
    initGlobalMap();
  }

  // Handle Navbar Link Clicks for Mobile
  document.querySelectorAll('.nav-links a, .logo, .footer-links a, .btn').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      
      const targetId = href.slice(1);
      const targetIndex = allPages.findIndex(p => p.id === targetId);
      
      if (targetIndex !== -1 && isMobile()) {
        e.preventDefault();
        goToPage(targetIndex);
        
        // Close mobile menu if open
        if (navbar.classList.contains('menu-active')) {
          navbar.classList.remove('menu-active');
          document.body.style.overflow = '';
        }
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
