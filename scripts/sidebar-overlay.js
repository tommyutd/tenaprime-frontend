document.addEventListener('DOMContentLoaded', function() {
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  
  // Function to create and append sidebar
  function createSidebar() {
    if (!document.getElementById('sidebar')) {
      if (Object.keys(window.englishStrings).length === 0) {
        setTimeout(createSidebar, 100);
        return;
      }

      // Get current language before creating HTML
      const currentLang = document.querySelector('.language-selector p').textContent.toLowerCase();
      
      // Create sidebar HTML with currentLang
      const sidebarHTML = `
        <div class="sidebar aleo-text" id="sidebar">
          <div class="sidebar-header">
            <div class="sidebar-logo">
              <img src="./assets/logo.svg" alt="TenaPrime">
            </div>
            <button class="sidebar-close">&times;</button>
          </div>
          
          <div class="sidebar-language-selector">
            <div class="language-options-container">
              <div class="sidebar-language-option ${currentLang === 'en' ? 'active' : ''}" data-lang="en">
                <span class="language-text">English</span>
              </div>
              <div class="sidebar-language-option ${currentLang === 'አማ' ? 'active' : ''} ethiopic-text" data-lang="አማ">
                <span class="language-text">አማርኛ</span>
              </div>
            </div>
          </div>

          <div class="sidebar-navigation">
            <a href="index.html" class="sidebar-item">
              <div data-text-key="home-menu-item">Home</div>
            </a>
            <a href="exercises.html" class="sidebar-item">
              <div data-text-key="exercises-menu-item">Exercises</div>
            </a>
            <a href="nutrition.html" class="sidebar-item">
              <div data-text-key="nutrition-menu-item">Nutrition</div>
            </a>
            <a href="prizes.html" class="sidebar-item">
              <div data-text-key="prizes-menu-item">Prizes</div>
            </a>
            <a href="about.html" class="sidebar-item">
              <div data-text-key="about-menu-item">About</div>
            </a>
          </div>

          <div class="sidebar-footer">
            <a href="#" class="sidebar-item">
              <div data-text-key="tandc">Terms & Conditions</div>
            </a>
            <a href="#" class="sidebar-item">
              <div data-text-key="faq">FAQ</div>
            </a>
            <a href="#" class="sidebar-item">
              <div data-text-key="privacy-policy">Privacy Policy</div>
            </a>
            <a href="#" class="sidebar-item">
              <div data-text-key="contact-us">Contact Us</div>
            </a>
          </div>
        </div>
        <div class="sidebar-overlay"></div>
      `;

      document.body.insertAdjacentHTML('beforeend', sidebarHTML);
      
      const sidebar = document.getElementById('sidebar');
      const sidebarClose = sidebar.querySelector('.sidebar-close');
      const sidebarOverlay = document.querySelector('.sidebar-overlay');
      const languageOptions = sidebar.querySelectorAll('.sidebar-language-option');
      
      // Language switching functionality
      languageOptions.forEach(option => {
        option.addEventListener('click', function() {
          const lang = this.dataset.lang;
          const mainLanguageText = document.querySelector('.language-selector p');
          mainLanguageText.textContent = lang.toUpperCase();
          
          // Update active states
          languageOptions.forEach(opt => {
            opt.classList.remove('active');
          });
          this.classList.add('active');
          
          // Update fonts
          const fontElements = document.querySelectorAll('.aleo-text, .ethiopic-text');
          fontElements.forEach(element => {
            // Skip elements that contain Amharic text
            if (element.classList.contains('sidebar-language-option') && element.dataset.lang === 'አማ') {
              return;
            }
            
            if (lang === 'en') {
              element.classList.remove('ethiopic-text');
              element.classList.add('aleo-text');
            } else {
              element.classList.remove('aleo-text');
              element.classList.add('ethiopic-text');
            }
          });
          
          // Update text content
          const textElements = document.querySelectorAll('[data-text-key]');
          textElements.forEach(element => {
            const key = element.dataset.textKey;
            element.innerHTML = lang === 'en' ? 
              window.englishStrings[key] : 
              window.amharicStrings[key];
          });
        });
      });

      // Toggle sidebar
      function toggleSidebar() {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
      }

      // Event listeners
      hamburgerMenu.addEventListener('click', toggleSidebar);
      sidebarClose.addEventListener('click', toggleSidebar);
      sidebarOverlay.addEventListener('click', toggleSidebar);

      // Close sidebar on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
          toggleSidebar();
        }
      });
    }
  }

  createSidebar();
});
