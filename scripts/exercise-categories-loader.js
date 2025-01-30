document.addEventListener('DOMContentLoaded', async function() {
    const personalizationPrompt = document.querySelector('.personalization-prompt');
    const promptTitle = document.querySelector('[data-text-key="personalization-title"]');
    const promptDescription = document.querySelector('[data-text-key="personalization-description"]');
    const promptButton = document.querySelector('[data-text-key="personalization-button"]');
    
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
            personalizationPrompt.style.display = 'none';
        } else {
            // No profile exists - show the prompt with default text
            promptTitle.textContent = 'Personalize Your Experience';
            promptDescription.textContent = 'Get customized workout recommendations by completing your fitness profile.';
            promptButton.textContent = 'Setup Profile';
            personalizationPrompt.classList.add('show');
        }
    } catch (error) {
        console.error('Error checking profile status:', error);
    }
    
    try {
        // Clean up any existing popups first
        const existingPopups = document.querySelectorAll('[id$="-popup"]');
        existingPopups.forEach(popup => popup.remove());

        // Fetch workout data
        const response = await fetch('/exercises/exercise-categories.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const workoutData = await response.json();
        
        // Get current language
        const currentLang = localStorage.getItem('app-language') || 'en';
        const strings = currentLang === 'en' ? window.englishStrings : window.amharicStrings;
        
        // Create popups from template
        const template = document.getElementById('exercise-popup-template');
        
        Object.entries(workoutData).forEach(([cardId, data]) => {
            // Clone template
            const popup = template.content.cloneNode(true).firstElementChild;
            popup.id = cardId + '-popup';
            
            // Set the image source
            const imageElement = popup.querySelector('.exercise-popup-image img');
            imageElement.src = data.imagePath;
            imageElement.alt = strings[data.titleKey] || data.titleKey;
            
            // Populate content with correct language strings
            const content = popup.querySelector('.exercise-popup-content');
            const titleElement = content.querySelector('h2');
            const descriptionElement = content.querySelector('p');

            titleElement.setAttribute('data-text-key', data.titleKey);
            //titleElement.innerHTML = strings[data.titleKey] || data.titleKey;

            descriptionElement.setAttribute('data-text-key', data.descriptionKey);
            //descriptionElement.innerHTML = strings[data.descriptionKey] || data.descriptionKey;
            
            // Add buttons with correct language strings
            const buttonContainer = content.querySelector('.exercise-popup-buttons');
            data.buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = 'exercise-popup-button aleo-text';
                btn.setAttribute('data-text-key', button.textKey);
                //btn.textContent = strings[button.textKey] || button.textKey;
                btn.dataset.page = button.page;
                buttonContainer.appendChild(btn);
            });
            
            // Add to document
            document.body.appendChild(popup);

            window.stringsLoaded.then(() => {
                updatePageStrings();
            }).catch(error => {
                console.error('Error updating strings:', error);
            });
            
            // Add click handler to card
            const card = document.getElementById(cardId);
            if (card) {
                card.addEventListener('click', () => {
                    showExercisePopup(popup);
                });
            }
        });

        // Close handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.exercise-popup-close')) {
                hideExercisePopup(e.target.closest('.exercise-popup-overlay'));
            }
            if (e.target.matches('.exercise-popup-overlay')) {
                hideExercisePopup(e.target);
            }
            if (e.target.matches('.exercise-popup-button')) {
                const page = e.target.dataset.page;
                if (page) {
                    window.location.href = `/exercises/${page}`;
                }
            }
        });
    } catch (error) {
        console.error('Error loading workout data:', error);
    }
});

function showExercisePopup(popup) {
    popup.style.display = 'flex';
    popup.offsetHeight; // Force reflow
    popup.classList.add('show');
    popup.querySelector('.exercise-popup-content').classList.add('show');
}

function hideExercisePopup(popup) {
    popup.classList.remove('show');
    popup.querySelector('.exercise-popup-content').classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 300);
}