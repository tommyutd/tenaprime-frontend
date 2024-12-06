document.addEventListener('DOMContentLoaded', async function() {
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const sidebar = document.getElementById('sidebar');
  const sidebarClose = sidebar.querySelector('.sidebar-close');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  const languageOptions = sidebar.querySelectorAll('.sidebar-language-option');
  
  // Set initial states
  sidebar.style.display = 'none';
  sidebarOverlay.style.display = 'none';
  
  // Set initial active language from localStorage or user data
  const storedLang = localStorage.getItem('app-language');
  if (storedLang) {
    setActiveSidebarLanguage(storedLang);
  } else if (window.userData && window.userData.user && window.userData.user.user.lang) {
    setActiveSidebarLanguage(window.userData.user.user.lang);
  } else {
    setActiveSidebarLanguage('en');
  }

  // Language switching functionality
  languageOptions.forEach(option => {
    option.addEventListener('click', function() {
      const lang = this.dataset.lang;
      updateLanguage(lang); // Using the global updateLanguage function
      setActiveSidebarLanguage(lang === 'en' ? 'en' : 'am');
    });
  });

  function setActiveSidebarLanguage(lang) {
    const normalizedLang = lang === 'en' || lang === 'EN' ? 'en' : 'አማ';
    languageOptions.forEach(option => {
      if (option.dataset.lang === normalizedLang) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  function showSidebar() {
    sidebar.style.display = 'flex';
    sidebarOverlay.style.display = 'block';
    // Trigger reflow
    sidebar.offsetHeight;
    sidebarOverlay.offsetHeight;
    
    requestAnimationFrame(() => {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
    });
  }

  function hideSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    
    setTimeout(() => {
      sidebar.style.display = 'none';
      sidebarOverlay.style.display = 'none';
    }, 300);
  }

  // Event listeners
  hamburgerMenu.addEventListener('click', showSidebar);
  sidebarClose.addEventListener('click', hideSidebar);
  sidebarOverlay.addEventListener('click', hideSidebar);

  // Close sidebar on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      hideSidebar();
    }
  });
});
