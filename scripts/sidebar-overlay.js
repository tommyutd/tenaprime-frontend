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

function showToast(messageKey, error = false) {
  const errorToast = document.createElement('div');
  errorToast.className = 'error-toast-overlay aleo-text';
  
  const errorToastNotification = document.createElement('div');
  errorToastNotification.className = 'error-toast-notification';
  
  const messageSpan = document.createElement('span');
  messageSpan.setAttribute('data-text-key', messageKey);
  
  errorToastNotification.appendChild(messageSpan);
  errorToast.appendChild(errorToastNotification);
  document.body.appendChild(errorToast);

  if (error) {
      errorToastNotification.style.backgroundColor = '#ff4444';
  } else {
      errorToastNotification.style.backgroundColor = '#BA9C62';
  }

  // Show toast with animation
  errorToast.style.display = 'flex';
  requestAnimationFrame(() => {
      errorToast.classList.add('show');
      errorToastNotification.classList.add('show');
  });

  // Update strings after adding to DOM
  window.stringsLoaded.then(() => {
      updatePageStrings();
  }).catch(error => {
      console.error('Error updating strings:', error);
  });
  
  // Hide and remove toast after 5 seconds
  setTimeout(() => {
      errorToastNotification.classList.remove('show');
      errorToast.classList.remove('show');
      setTimeout(() => {
          try {
              document.body.removeChild(errorToast);
          } catch (error) {}
      }, 300);
  }, 5000);
  
  // Add click event listener to close toast on click
  errorToast.addEventListener('click', function(e) {
      if (e.target === errorToast) {
          errorToastNotification.classList.remove('show');
          errorToast.classList.remove('show');
          setTimeout(() => {
              document.body.removeChild(errorToast);
          }, 300);
      }
  });
}

function showPrompt(titleKey, messageKey) {
  return new Promise((resolve) => {
      const template = document.getElementById('prompt-template');
      const clone = template.content.cloneNode(true);
      document.body.appendChild(clone);

      const overlay = document.querySelector('.prompt-overlay');
      const content = overlay.querySelector('.prompt-content');
      const closeBtn = overlay.querySelector('.prompt-close');
      const cancelBtn = overlay.querySelector('.prompt-cancel');
      const confirmBtn = overlay.querySelector('.prompt-confirm');
      const titleEl = overlay.querySelector('.prompt-title');
      const messageEl = overlay.querySelector('.prompt-message');

      titleEl.setAttribute('data-text-key', titleKey);
      messageEl.setAttribute('data-text-key', messageKey);

      // Update strings after adding to DOM
      window.stringsLoaded.then(() => {
          updatePageStrings();
      }).catch(error => {
          console.error('Error updating strings:', error);
      });

      setTimeout(() => {
          overlay.classList.add('show');
          content.classList.add('show');
      }, 10);

      function closePrompt(result) {
          overlay.classList.remove('show');
          content.classList.remove('show');
          setTimeout(() => {
              document.body.removeChild(overlay);
              resolve(result);
          }, 300);
      }

      closeBtn.addEventListener('click', () => closePrompt(false));
      cancelBtn.addEventListener('click', () => closePrompt(false));
      confirmBtn.addEventListener('click', () => closePrompt(true));
      overlay.addEventListener('click', (e) => {
          if (e.target === overlay) closePrompt(false);
      });
  });
}

window.showToast = showToast;
window.showPrompt = showPrompt;