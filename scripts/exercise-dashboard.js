// Store shared variables in a higher scope
let workoutPlanHeading;
let workoutPlanInterval;

document.addEventListener('DOMContentLoaded', async function() {
    workoutPlanHeading = document.querySelector('.workout-plan-heading');
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
            personalizationPrompt.classList.remove('show');

            // Initial check when page loads
            checkWorkoutPlan();

            // Set up interval to check every minute
            workoutPlanInterval = setInterval(checkWorkoutPlan, 60000);
        } else {
            // No profile exists - show the prompt with default text
            personalizationPrompt.classList.add('show');
            workoutPlanHeading.style.display = 'none';
        }
        window.stringsLoaded.then(() => {
            updatePageStrings();
        }).catch(error => {
            console.error('Error updating strings:', error);
        });
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

async function checkWorkoutPlan() {
    try {
        const token = localStorage.getItem('login-token');
        const response = await fetch(`${window.CONFIG.API_URL}/profile/workout`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const workoutPlan = await response.json();
            if (!workoutPlan || !workoutPlan.workoutPlan) {
                // No workout plan exists - hide the workout plan section
                workoutPlanHeading.style.display = 'none';
                return;
            }
            
            // Workout plan exists - show the workout plan section
            workoutPlanHeading.style.display = 'block';
            
            const headingText = workoutPlanHeading.querySelector('#workout-plan-heading-title');
            const descriptionText = workoutPlanHeading.querySelector('#workout-plan-heading-description');
            const button = workoutPlanHeading.querySelector('.workout-plan-view-button');

            if (workoutPlan.workoutPlan.number_of_weeks_per_phase === 0) {
                headingText.setAttribute('data-text-key', 'workout-generating-heading-title');
                descriptionText.setAttribute('data-text-key', 'workout-generating-heading-description');

                headingText.style.color = '#36454F';
                descriptionText.style.color = '#36454F';
                
                button.disabled = true;
                button.innerHTML = `
                    <div class="loading-spinner"></div>
                    <span data-text-key="loading"></span>
                `;
            } else {
                headingText.setAttribute('data-text-key', 'workout-plan-heading-title');
                descriptionText.setAttribute('data-text-key', 'workout-plan-heading-description');

                headingText.style.color = '#121518';
                descriptionText.style.color = '#121518';
                
                button.disabled = false;
                button.innerHTML = `
                    <span data-text-key="workout-plan-view-button"></span>
                `;
                // Clear interval once plan is generated
                clearInterval(workoutPlanInterval);
            }
            window.stringsLoaded.then(() => {
                updatePageStrings();
            }).catch(error => {
                console.error('Error updating strings:', error);
            });
        } else {
            workoutPlanHeading.style.display = 'none';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error checking workout plan:', error);
        workoutPlanHeading.style.display = 'none';
    }
}