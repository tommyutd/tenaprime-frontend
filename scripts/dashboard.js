async function checkPersonalization() {
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
        } else {
            // No profile exists - show the prompt with default text
            personalizationPrompt.classList.add('show');
        }
        window.stringsLoaded.then(() => {
            updatePageStrings();
        }).catch(error => {
            console.error('Error updating strings:', error);
        });
    } catch (error) {
        console.warn('Error checking profile status:', error);
    }
}
    

async function checkWorkoutPlan() {
    try {
        const workoutPlanHeading = document.querySelector('.workout-plan-heading');
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
            }

            workoutPlanHeading.style.display = 'flex';
            window.stringsLoaded.then(() => {
                updatePageStrings();
            }).catch(error => {
                console.error('Error updating strings:', error);
            });
        } else {
            workoutPlanHeading.style.display = 'none';
        }
    } catch (error) {
        console.warn('Error checking workout plan:', error);
        workoutPlanHeading.style.display = 'none';
    }
}

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

                if (nutritionPlan.nutritionProfile.bmr === 0) {
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
    } catch (error) {
        console.warn('Error checking nutrition plan:', error);
        nutritionPlanHeading = document.querySelector('.nutrition-plan-heading');
        if (nutritionPlanHeading) {
            nutritionPlanHeading.style.display = 'none';
        }
    }
}

async function loadFeaturedWorkouts() {
    try {
        // Load categories from JSON file
        const response = await fetch('/exercises/exercise-categories.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const workoutData = await response.json();
        
        // Collect all specific workouts from the buttons arrays
        const allWorkouts = [];
        Object.entries(workoutData).forEach(([categoryId, data]) => {
            if (data.buttons) {
                data.buttons.forEach(button => {
                    // Only include actual workout pages (exclude guide pages)
                    if (button.page) {
                        allWorkouts.push({
                            id: categoryId,
                            textKey: button.textKey,
                            page: '/exercises/' + button.page,
                            type: categoryId.split('-')[0], // Gets 'workout', 'at-home', etc.
                            categoryTitleKey: data.titleKey, // Store the category's title key
                            imagePath: data.imagePath, // Store the image file
                        });
                    }
                });
            }
        });

        // Randomly select 3 unique workouts
        const selectedWorkouts = [];
        const numFeatured = 3;
        
        while (selectedWorkouts.length < numFeatured && allWorkouts.length > 0) {
            const randomIndex = Math.floor(Math.random() * allWorkouts.length);
            selectedWorkouts.push(allWorkouts.splice(randomIndex, 1)[0]);
        }

        // Get the featured workouts container
        const featuredGrid = document.querySelector('.featured-workouts-grid');
        featuredGrid.innerHTML = ''; // Clear existing content

        // Create workout cards
        selectedWorkouts.forEach(workout => {
            const card = createFeaturedWorkoutCard(workout);
            featuredGrid.appendChild(card);
        });

        // Update strings after adding new elements
        window.stringsLoaded.then(() => {
            updatePageStrings();
        }).catch(error => {
            console.error('Error updating strings:', error);
        });

    } catch (error) {
        console.warn('Error loading featured workouts:', error);
    }
}

function createFeaturedWorkoutCard(workout) {
    const card = document.createElement('div');
    card.className = 'featured-workout-card';
    
    // Set the background image dynamically based on workout type
    card.style.setProperty('--workout-bg-image', `url('${workout.imagePath}')`);
    
    // Add other card content
    card.innerHTML = `
        <h3 data-text-key="${workout.textKey}"></h3>
        <p data-text-key="${workout.categoryTitleKey}"></p>
    `;

    card.addEventListener('click', () => {
        window.location.href = workout.page;
    });
    
    return card;
}

async function loadFeaturedNutrition() {
    try {
        // Load categories from learn-categories.json
        const response = await fetch('/nutrition/learn-categories.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const nutritionData = await response.json();
        
        // Collect all specific nutrition content
        const allNutritionContent = [];
        Object.entries(nutritionData).forEach(([categoryId, data]) => {
            if (data.items) {
                data.items.forEach(item => {
                    allNutritionContent.push({
                        id: item.id,
                        textKey: item.textKey,
                        page: `/nutrition/learn?topic=${item.id}`,
                        type: categoryId,
                        categoryTitleKey: data.title,
                        imagePath: `/nutrition/assets/${categoryId}-${item.id}.png` // Add image path
                    });
                });
            }
        });

        // Randomly select 3 unique nutrition items
        const selectedNutrition = [];
        const numFeatured = 3;
        
        while (selectedNutrition.length < numFeatured && allNutritionContent.length > 0) {
            const randomIndex = Math.floor(Math.random() * allNutritionContent.length);
            selectedNutrition.push(allNutritionContent.splice(randomIndex, 1)[0]);
        }

        // Get the featured nutrition container
        const featuredGrid = document.querySelector('.featured-nutrition-grid');
        featuredGrid.innerHTML = '';

        // Create cards for each selected nutrition item
        selectedNutrition.forEach(item => {
            const card = document.createElement('div');
            card.className = 'featured-nutrition-card';
            
            // Set the background image
            card.style.setProperty('--nutrition-bg-image', `url('${item.imagePath}')`);
            
            card.innerHTML = `
                <h3 data-text-key="${item.textKey}"></h3>
                <p data-text-key="${item.categoryTitleKey}"></p>
            `;
            
            card.addEventListener('click', () => {
                window.location.href = item.page;
            });
            
            featuredGrid.appendChild(card);
        });

        // Update text strings
        window.stringsLoaded.then(() => {
            updatePageStrings();
        }).catch(error => {
            console.error('Error updating strings:', error);
        });
    } catch (error) {
        console.warn('Error loading featured nutrition:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadFeaturedWorkouts();
    await loadFeaturedNutrition();
    await checkPersonalization();
    await checkWorkoutPlan();
    await checkNutritionPlan();
});
