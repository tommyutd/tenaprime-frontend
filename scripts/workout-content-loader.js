async function loadWorkoutContent() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const workoutId = urlParams.get('plan');
        
        if (!workoutId) {
            console.error('No workout plan provided');
            showError('No workout plan provided');
            return;
        }

        // Fetch both the workout plan and exercises list
        const [workoutResponse, exercisesResponse] = await Promise.all([
            fetch(`/exercises/data/${workoutId}.json`),
            fetch('/exercises/exercises-list.json')
        ]);

        if (!workoutResponse.ok || !exercisesResponse.ok) {
            throw new Error('Failed to fetch workout data');
        }

        const [workoutData, exercisesList] = await Promise.all([
            workoutResponse.json(),
            exercisesResponse.json()
        ]);

        // Load overview content
        const workoutOverview = document.querySelector('.workout-overview');
        if (workoutOverview && workoutData.overview) {
            workoutOverview.innerHTML = `
                <div class="overview-container">
                    <h1 data-text-key="${workoutData.overview.title}"></h1>
                    <div class="overview-content">
                        <div class="overview-description">
                            <p data-text-key="${workoutData.overview.description}"></p>
                        </div>
                        ${workoutData.overview.schedule ? `
                            <div class="overview-schedule">
                                ${workoutData.overview.schedule.map(day => `
                                    <div class="schedule-day ${day.link ? 'clickable' : ''}">
                                        ${day.link ? 
                                            `<a href="${day.link}">
                                                <h3 data-text-key="${day.day}"></h3>
                                                <p data-text-key="${day.activity}"></p>
                                                ${day.current ? '<span class="current-day" data-text-key="you-are-here"></span>' : ''}
                                            </a>` :
                                            `<h3 data-text-key="${day.day}"></h3>
                                            <p data-text-key="${day.activity}"></p>
                                            ${day.current ? '<span class="current-day" data-text-key="you-are-here"></span>' : ''}`
                                        }
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // Load header content
        const workoutHeader = document.querySelector('.workout-header');
        if (workoutHeader && workoutData.header) {
            workoutHeader.innerHTML = `
                <h1 data-text-key="${workoutData.header.title}"></h1>
                <p class="workout-description" data-text-key="${workoutData.header.description}"></p>
            `;
        }

        const exerciseList = document.querySelector('.exercise-list');
        if (!exerciseList) {
            throw new Error('Exercise list container not found');
        }
        exerciseList.innerHTML = '';
        
        // Helper function to create exercise items
        function createExerciseItem(exercise) {
            const exerciseData = exercisesList[exercise.id];
            if (!exerciseData) {
                console.error(`Exercise data not found for ID: ${exercise.id}`);
                return '';
            }

            const detailsArray = Object.entries(exercise)
                .filter(([key]) => key !== 'id')
                .map(([key, value]) => ({
                    label: key,
                    key: value
                }));

            return `
                <div class="exercise-item">
                    <div class="exercise-details">
                        <h3 data-text-key="${exerciseData.name}"></h3>
                        <div class="exercise-info">
                            ${exerciseData.target && exerciseData.target.length > 0 ? `
                                <div class="exercise-info-row">
                                    <div class="exercise-info-label" data-text-key="muscles">muscles</div>
                                    <div class="exercise-info-description">
                                        ${exerciseData.target.map(muscle => `<span data-text-key="${muscle}"></span>`).join(', ')}
                                    </div>
                                </div>
                            ` : ''}
                            ${detailsArray.map(detail => `
                                <div class="exercise-info-row">
                                    <div class="exercise-info-label" data-text-key="${detail.label}">${detail.label}</div>
                                    <div class="exercise-info-description" data-text-key="${detail.key}"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${exerciseData.image ? `
                        <div class="exercise-visual">
                            <img src="${exerciseData.image}" alt="${exerciseData.name}">
                        </div>
                    ` : ''}
                </div>
            `;
        }

        // Create sections
        ['warmup', 'main', 'cooldown'].forEach(section => {
            const sectionData = workoutData[section];
            if (!sectionData) return;
            
            const sectionElement = document.createElement('div');
            sectionElement.className = 'workout-section';
            sectionElement.id = section;
            sectionElement.innerHTML = `
                <h2 data-text-key="${sectionData.title}"></h2>
                <div class="exercise-items">
                    ${sectionData.exercises.map(exercise => createExerciseItem(exercise)).join('')}
                </div>
            `;
            exerciseList.appendChild(sectionElement);
        });

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