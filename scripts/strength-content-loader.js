async function loadStrengthContent() {
    // Get the muscle group from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const muscleGroup = urlParams.get('group');

    try {
        // Wait for strings to be loaded first
        await window.stringsLoaded;
        
        const primaryMuscleText = window.currentLang === 'am' ? 
            window.amharicStrings[`${muscleGroup}-anatomy-primary-muscles`] :
            window.englishStrings[`${muscleGroup}-anatomy-primary-muscles`];

        const primaryMuscles = primaryMuscleText.split('\\n\\n').map(muscleSplitText => {
            const lines = muscleSplitText.trim().split('\\n');
            const name = lines[0].trim();
            const description = lines[1].trim();
            const functions = lines.slice(2).map(f => f.trim()).filter(f => f);
            
            return {
                name,
                description,
                functions
            };
        });

        const supportingMuscleText = window.currentLang === 'am' ? 
            window.amharicStrings[`${muscleGroup}-anatomy-supporting-muscles`] :
            window.englishStrings[`${muscleGroup}-anatomy-supporting-muscles`];
        
        const supportingMuscles = supportingMuscleText.split('\\n')
        
        const safetyPrecautionsText = window.currentLang === 'am' ? 
            window.amharicStrings[`strength-safety-precautions`] :
            window.englishStrings[`strength-safety-precautions`];
        
        const safetyPrecautions = safetyPrecautionsText.split('\\n')

        const sampleWorkoutWarmupText = window.currentLang === 'am' ? 
            window.amharicStrings[`strength-warmup-content`] :
            window.englishStrings[`strength-warmup-content`];
        
        const sampleWorkoutWarmup = sampleWorkoutWarmupText.split('\\n')

        const sampleWorkoutStepsText = window.currentLang === 'am' ? 
            window.amharicStrings[`${muscleGroup}-sample-workout-steps`] :
            window.englishStrings[`${muscleGroup}-sample-workout-steps`];
        
        const sampleWorkoutSteps = sampleWorkoutStepsText.split('\\n')

        const sampleWorkoutCooldownText = window.currentLang === 'am' ? 
            window.amharicStrings[`strength-cooldown-content`] :
            window.englishStrings[`strength-cooldown-content`];
        
        const sampleWorkoutCooldown = sampleWorkoutCooldownText.split('\\n')

        const sampleWorkoutNotesText = window.currentLang === 'am' ? 
            window.amharicStrings[`strength-notes-content`] :
            window.englishStrings[`strength-notes-content`];
        
        const sampleWorkoutNotes = sampleWorkoutNotesText.split('\\n')

        const exercisesResponse = await fetch('/exercises/exercises-list.json');
        if (!exercisesResponse.ok) {
            throw new Error('Failed to fetch exercises list');
        }
        const exercisesList = await exercisesResponse.json();

        const chestMuscles = ['pectoralis-major', 'pectoralis-minor', 'serratus-anterior', 'chest'];
        
        const armMuscles = ['biceps', 'triceps', 'forearms', 'arms', 'forearm-flexors', 'forearm-extensors', 'brachialis', 'arms'];

        const shoulderMuscles = ['anterior-deltoid', 'lateral-deltoid', 'posterior-deltoid', 'shoulders'];

        const backMuscles = ['latissimus-dorsi', 'trapezius', 'rhomboids', 'erector-spinae', 'teres-major', 'teres-minor', 'infraspinatus', 'supraspinatus', 'back', 'lower-back', 'upper-back', 'middle-back'];

        const coreMuscles = ['rectus-abdominis', 'transverse-abdominis', 'external-obliques', 'internal-obliques', 'multifidus', 'core', 'obliques'];

        const lowerBodyMuscles = ['quadriceps', 'hamstrings', 'glutes', 'gastrocnemius', 'soleus', 'hip-flexors', 'hip-extensors', 'adductors', 'abductors', 'calves', 'legs'];

        // First get primary exercises
        const primaryExercises = Object.entries(exercisesList)
            .filter(([_, exercise]) => {
                if (muscleGroup === 'chest') {
                    return exercise.primaryTargets.some(target => chestMuscles.includes(target));
                }
                if (muscleGroup === 'arms') {
                    return exercise.primaryTargets.some(target => armMuscles.includes(target));
                }
                if (muscleGroup === 'shoulders') {
                    return exercise.primaryTargets.some(target => shoulderMuscles.includes(target));
                }
                if (muscleGroup === 'back') {
                    return exercise.primaryTargets.some(target => backMuscles.includes(target));
                }
                if (muscleGroup === 'core') {
                    return exercise.primaryTargets.some(target => coreMuscles.includes(target));
                }
                if (muscleGroup === 'lower-body') {
                    return exercise.primaryTargets.some(target => lowerBodyMuscles.includes(target));
                }

                return exercise.primaryTargets.includes(muscleGroup);
            })
            .map(([id, exercise]) => exercise.name);

        // Then get secondary exercises, excluding any that are already primary
        const secondaryExercises = Object.entries(exercisesList)
            .filter(([_, exercise]) => {
                // Skip if this exercise is already in primaryExercises
                if (primaryExercises.includes(exercise.name)) {
                    return false;
                }
                
                if (muscleGroup === 'chest') {
                    return exercise.secondaryTargets.some(target => chestMuscles.includes(target));
                }
                if (muscleGroup === 'arms') {
                    return exercise.secondaryTargets.some(target => armMuscles.includes(target));
                }
                if (muscleGroup === 'shoulders') {
                    return exercise.secondaryTargets.some(target => shoulderMuscles.includes(target));
                }
                if (muscleGroup === 'back') {
                    return exercise.secondaryTargets.some(target => backMuscles.includes(target));
                }
                if (muscleGroup === 'core') {
                    return exercise.secondaryTargets.some(target => coreMuscles.includes(target));
                }
                if (muscleGroup === 'lower-body') {
                    return exercise.secondaryTargets.some(target => lowerBodyMuscles.includes(target));
                }

                return exercise.secondaryTargets.includes(muscleGroup);
            })
            .map(([id, exercise]) => exercise.name);
        
        // Create the main container
        const strengthContainer = document.querySelector('.strength-training');
        strengthContainer.innerHTML = `
            <div class="strength-training-header">
                <h1 data-text-key="${muscleGroup}-header-title"></h1>
                <p data-text-key="${muscleGroup}-header-description"></p>
            </div>
            <div class="strength-training-content">
                <div id="strength-training-content-introduction">
                    <div class="strength-section">
                        <h2 data-text-key="${muscleGroup}-introduction-title"></h2>
                        <p data-text-key="${muscleGroup}-introduction-content"></p>
                    </div>
                </div>
                
                <div id="strength-training-content-anatomy">
                    <div class="strength-section">
                        <h2 data-text-key="${muscleGroup}-anatomy-title"></h2>
                        <p data-text-key="${muscleGroup}-anatomy-overview"></p>
                        
                        <div class="strength-training-content-muscles">
                            <h3 data-text-key="strength-primary-muscles"></h3>
                            ${primaryMuscles.map(muscle => `
                                <div class="muscle-group">
                                    <h4>${muscle.name}</h4>
                                    <p>${muscle.description}</p>
                                    ${muscle.functions.length > 0 ? `
                                        <p data-text-key="strength-functions"></p>
                                        <ul>
                                            ${muscle.functions.map(func => `<li><p>${func}</p></li>`).join('')}
                                        </ul>
                                    ` : ''}
                                </div>
                            `).join('')}
                            
                            <h3 data-text-key="strength-supporting-muscles"></h3>
                            <ul>
                                ${supportingMuscles.map(muscle => `<li><p>${muscle}</p></li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="strength-training-content-anatomy-image">
                            <img src="/exercises/assets/${muscleGroup}-anatomy.jpg" alt="${muscleGroup}-anatomy-caption">
                            <p data-text-key="${muscleGroup}-anatomy-caption"></p>
                        </div>
                    </div>
                </div>
                
                <div id="strength-training-content-safety">
                    <div class="strength-section">
                        <h2 data-text-key="${muscleGroup}-safety-title"></h2>
                        <ul>
                            ${safetyPrecautions.map(precaution => `<li><p>${precaution}</p></li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div id="strength-training-content-exercises">
                  <div class="strength-section" id="strength-exercise-list">
                    <h2 data-text-key="strength-primary-exercises"></h2>
                        <div class="strength-exercise-buttons">
                            ${primaryExercises.map(exercise => `
                                <button class="strength-exercise-button aleo-text">
                                    <p data-text-key="${exercise}"></p>
                                </button>
                            `).join('')}
                        </div>
                    <h2 data-text-key="strength-secondary-exercises"></h2>
                        <div class="strength-exercise-buttons">
                            ${secondaryExercises.map(exercise => `
                                <button class="strength-exercise-button aleo-text">
                                    <p data-text-key="${exercise}"></p>
                                </button>
                            `).join('')}
                        </div>
                  </div>
                </div>
                
                <div id="strength-training-content-workout">
                    <div class="strength-section">
                      <h2 data-text-key="${muscleGroup}-sample-workout-title"></h2>
                        <h3 data-text-key="strength-warmup"></h3>
                        <ul>
                            ${sampleWorkoutWarmup.map(item => `<li><p>${item}</p></li>`).join('')}
                        </ul>
                        
                        <h3 data-text-key="strength-workout"></h3>
                        <ol>
                            ${sampleWorkoutSteps.map(item => `<li><p>${item}</p></li>`).join('')}
                        </ol>
                        
                        <h3 data-text-key="strength-cooldown"></h3>
                        <ul>
                            ${sampleWorkoutCooldown.map(item => `<li><p>${item}</p></li>`).join('')}
                        </ul>
                        
                        <h3 data-text-key="strength-notes"></h3>
                        <ul>
                            ${sampleWorkoutNotes.map(item => `<li><p>${item}</p></li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div id="strength-training-content-conclusion">
                    <div class="strength-section">
                        <h2 data-text-key="strength-conclusion"></h2>
                        <p data-text-key="${muscleGroup}-conclusion"></p>
                    </div>
                </div>
            </div>
        `;
        window.stringsLoaded.then(() => {
            updatePageStrings();
        }).catch(error => {
            console.error('Error updating strings:', error);
        });
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', loadStrengthContent);
