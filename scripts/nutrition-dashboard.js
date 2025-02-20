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
      
      // Initial check when page loads
      checkNutritionPlan();
      
      // Set up interval to check every minute
      nutritionPlanInterval = setInterval(checkNutritionPlan, 60000);
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
    window.stringsLoaded.then(() => {
        updatePageStrings();
    }).catch(error => {
        console.error('Error updating strings:', error);
    });
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

async function checkNutritionPlan() {
    let nutritionPlanHeading;
    try {
        nutritionPlanHeading = document.querySelector('.nutrition-plan-heading');
        const token = localStorage.getItem('login-token');
        const response = await fetch(`${window.CONFIG.API_URL}/profile/nutrition`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const nutritionPlan = await response.json();
            
            if (!nutritionPlan || !nutritionPlan.nutritionProfile) {
                // No nutrition plan exists - hide the nutrition plan section
                if (nutritionPlanHeading) {
                    nutritionPlanHeading.style.display = 'none';
                }
                return;
            }
            
            // Nutrition plan exists - show the nutrition plan section
            if (nutritionPlanHeading) {
                nutritionPlanHeading.style.display = 'block';
                
                const headingText = nutritionPlanHeading.querySelector('#nutrition-plan-heading-title');
                const descriptionText = nutritionPlanHeading.querySelector('#nutrition-plan-heading-description');
                const button = nutritionPlanHeading.querySelector('.nutrition-plan-view-button');

                if (!nutritionPlan.nutritionProfile.generation_completed) {
                    headingText.setAttribute('data-text-key', 'nutrition-generating-heading-title');
                    descriptionText.setAttribute('data-text-key', 'nutrition-generating-heading-description');

                    headingText.style.color = '#36454F';
                    descriptionText.style.color = '#36454F';
                    
                    button.disabled = true;
                    button.innerHTML = `
                        <div class="loading-spinner"></div>
                        <span data-text-key="loading"></span>
                    `;
                } else {
                    headingText.setAttribute('data-text-key', 'nutrition-plan-heading-title');
                    descriptionText.setAttribute('data-text-key', 'nutrition-plan-heading-description');

                    headingText.style.color = '#121518';
                    descriptionText.style.color = '#121518';
                    
                    button.disabled = false;
                    button.innerHTML = '<span data-text-key="nutrition-plan-view-button"></span>';
                    
                    // Clear interval once plan is generated
                    clearInterval(nutritionPlanInterval);
                }
                window.stringsLoaded.then(() => {
                    updatePageStrings();
                }).catch(error => {
                    console.error('Error updating strings:', error);
                });
            }
        } else {
            const nutritionPlanHeading = document.querySelector('.nutrition-plan-heading');
            if (nutritionPlanHeading) {
                nutritionPlanHeading.style.display = 'none';
            }
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error checking nutrition plan:', error);
        const nutritionPlanHeading = document.querySelector('.nutrition-plan-heading');
        if (nutritionPlanHeading) {
            nutritionPlanHeading.style.display = 'none';
        }
    }
}
