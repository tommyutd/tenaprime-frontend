document.addEventListener('DOMContentLoaded', async function() {
  const categories = document.querySelectorAll('.category-item');
  const sections = document.querySelectorAll('.content-section');
  const personalizationPrompt = document.querySelector('.personalization-prompt');
  
  try {
    // Wait for auth state to be initialized
    if (window.authState) {
      await window.authState.init();
    }

    if (!window.authState || !window.authState.isTokenPresent) {
      return;
    }

    if (window.userData.profile) {
      // Profile exists - hide the prompt
      if (personalizationPrompt) {
        personalizationPrompt.style.display = 'none';
      }
    } else {
      // No profile exists - show the prompt with default text
      if (personalizationPrompt) {
        const promptTitle = personalizationPrompt.querySelector('[data-text-key="personalization-title"]');
        const promptDescription = personalizationPrompt.querySelector('[data-text-key="personalization-description"]');
        const promptButton = personalizationPrompt.querySelector('[data-text-key="personalization-button"]');

        if (promptTitle) promptTitle.textContent = 'Personalize Your Experience';
        if (promptDescription) promptDescription.textContent = 'Get customized nutrition recommendations by completing your fitness profile.';
        if (promptButton) promptButton.textContent = 'Setup Profile';
        
        personalizationPrompt.classList.add('show');
      }
    }
  } catch (error) {
    console.error('Error checking profile status:', error);
  }

  // Original category switching logic
  categories.forEach(category => {
    category.addEventListener('click', () => {
      // Remove active class from all categories
      categories.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked category
      category.classList.add('active');
      
      // Hide all sections
      sections.forEach(section => section.style.display = 'none');
      
      // Show selected section
      const targetSection = document.querySelector(`.content-section[data-category="${category.dataset.category}"]`);
      if (targetSection) {
        targetSection.style.display = 'block';
      }
    });
  });
});
