async function loadWorkoutContent() {
    try {
        // Get workout ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const workoutId = urlParams.get('plan');
        
        if (!workoutId) {
            console.error('No workout plan provided');
            showError('No workout plan provided');
            return;
        }

        // Fetch the specific workout data
        const response = await fetch(`/exercises/data/${workoutId}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Load overview content
        const workoutOverview = document.querySelector('.workout-overview');
        if (workoutOverview && data.overview) {
            workoutOverview.innerHTML = `
                <div class="overview-container">
                    <h1 data-text-key="${data.overview.title}"></h1>
                    <div class="overview-content">
                        <div class="overview-description">
                            <p data-text-key="${data.overview.description}"></p>
                        </div>
                        <div class="overview-schedule">
                            ${data.overview.schedule.map(day => `
                                <div class="schedule-day">
                                    <h3 data-text-key="${day.day}"></h3>
                                    <p data-text-key="${day.activity}"></p>
                                    ${day.current ? '<span class="current-day" data-text-key="you-are-here"></span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        // Load header content
        const workoutHeader = document.querySelector('.workout-header');
        if (workoutHeader && data.header) {
            workoutHeader.innerHTML = `
                <h1 data-text-key="${data.header.title}"></h1>
                <p class="workout-description" data-text-key="${data.header.description}"></p>
            `;
        }

        // Clear existing content
        const exerciseList = document.querySelector('.exercise-list');
        if (!exerciseList) {
            throw new Error('Exercise list container not found');
        }
        exerciseList.innerHTML = '';
        
        // Helper function to create exercise items
        function createExerciseItem(exercise) {
            return `
                <div class="exercise-item">
                    <div class="exercise-details">
                        <h3 data-text-key="${exercise.name}">${exercise.name}</h3>
                        <div class="exercise-info">
                            ${exercise.details.map(detail => `
                                <div class="exercise-info-row">
                                    <div class="exercise-info-label" data-text-key="${detail.label}">${detail.label}</div>
                                    <div class="exercise-info-description" data-text-key="${detail.key}">${detail.key}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="exercise-visual">
                        <img src="${exercise.image}" alt="${exercise.name}">
                    </div>
                </div>
            `;
        }

        // Create sections
        ['warmup', 'main', 'cooldown'].forEach(section => {
            const sectionData = data[section];
            if (!sectionData) return; // Skip if section doesn't exist
            
            const sectionElement = document.createElement('div');
            sectionElement.className = 'workout-section';
            sectionElement.innerHTML = `
                <h2 data-text-key="${sectionData.title}"></h2>
                <div class="exercise-items">
                    ${sectionData.exercises.map(exercise => createExerciseItem(exercise)).join('')}
                </div>
            `;
            exerciseList.appendChild(sectionElement);
        });

        // Trigger translation update if using language system
        if (typeof updatePageStrings === 'function') {
            updatePageStrings();
        }
    } catch (error) {
        console.error('Error loading workout content:', error);
        showError('Error loading workout content');
    }
}

function showError(message) {
    const workoutOverview = document.querySelector('.workout-overview');
    if (workoutOverview) {
        workoutOverview.innerHTML = `
            <div class="error-message">
                <h2 data-text-key="workout-error">${message}</h2>
            </div>
        `;
    }
}

// Wait for both DOM and other resources to load
window.addEventListener('load', loadWorkoutContent);