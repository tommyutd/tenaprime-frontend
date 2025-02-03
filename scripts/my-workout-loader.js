// Format time in MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Global variables
let timer;
let timeRemaining;
let isPaused = false;
let currentExerciseIndex = 0;
let allExercises = [];
let nextButton;
let prevButton;
let pauseButton;
let endButton;
let isInitialized = false;

function startTimer(duration) {
    clearInterval(timer);
    timeRemaining = duration;
    updateTimerDisplay();

    timer = setInterval(() => {
        if (!isPaused) {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining <= 0) {
                clearInterval(timer);
                if (currentExerciseIndex < allExercises.length - 1) {
                    currentExerciseIndex++;
                    updateExerciseDisplay(allExercises[currentExerciseIndex]);
                }
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElement = document.querySelector('.time-remaining');
    const timerText = formatTime(timeRemaining);
    const currentExercise = allExercises[currentExerciseIndex];
    
    // If this exercise has sets (and a reps array) then add the reps text to the timer display.
    if (currentExercise && currentExercise.current_set && currentExercise.exercise_reps && currentExercise.exercise_reps.length > 0) {
        timerElement.textContent = `${timerText} - ${getAdjustedExerciseValue('reps', currentExercise.exercise_reps[0])} Reps`;
    } else {
        timerElement.textContent = timerText;
    }
}

// Helper: given an array of exercises (or a subarray), return a list where
// duplicate sets for the same main exercise are collapsed into one entry.
function getUniqueExercises(exercises) {
    const unique = [];
    for (const ex of exercises) {
        // always ignore rest-period entries
        if (ex.exercise_id === 'rest-period') continue;
        // For main workouts that have sets, only add the first occurrence of that exercise.
        if (ex.type === 'main' && ex.current_set) {
            // If the last exercise we added has the same exercise_id, then skip it.
            if (unique.length > 0 && unique[unique.length - 1].exercise_id === ex.exercise_id) {
                continue;
            }
        }
        unique.push(ex);
    }
    return unique;
}

// Add this function at the top level
function showLoading() {
    const overlay = document.querySelector('.loading-overlay');
    overlay.classList.add('show');
}

function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    overlay.classList.remove('show');
}

// Load exercise details from the API
async function loadWorkoutData() {
    // Prevent double initialization
    if (isInitialized) {
        return;
    }

    try {
        showLoading();
        // Load exercises list first
        const exercisesResponse = await fetch('/exercises/exercises-list.json');
        if (!exercisesResponse.ok) {
            throw new Error('Failed to load exercises data');
        }
        window.exercisesList = await exercisesResponse.json();

        // Get workout data from sessionStorage instead of fetching
        const workoutData = sessionStorage.getItem('current-workout');
        if (!workoutData) {
            throw new Error('No workout data found');
        }
        
        const todayWorkout = JSON.parse(workoutData);

        // Combine all exercises for the day
        allExercises = [
            ...todayWorkout.warmup.map(ex => ({ ...ex, type: 'warmup' })),
            ...todayWorkout.main_workout.flatMap(ex => {
                const exercises = [];
                // If exercise has sets, create multiple entries
                if (ex.exercise_sets && ex.exercise_sets.length > 0) {
                    for (let i = 0; i < getAdjustedExerciseValue('sets', ex.exercise_sets[0]); i++) {
                        exercises.push({ 
                            ...ex, 
                            type: 'main',
                            current_set: i + 1,
                            total_sets: getAdjustedExerciseValue('sets', ex.exercise_sets[0])
                        });
                        // Add rest period after each set except the last one
                        if (i < getAdjustedExerciseValue('sets', ex.exercise_sets[0]) - 1) {
                            exercises.push({ 
                                exercise_id: 'rest-period', 
                                exercise_duration_in_seconds: [getAdjustedExerciseValue('rest', ex.exercise_after_rest)], // Standard rest period
                                type: 'main'
                            });
                        }
                    }
                    // Add the final rest period after the exercise (if specified)
                    if (ex.exercise_after_rest) {
                        exercises.push({ 
                            exercise_id: 'rest-period', 
                            exercise_duration_in_seconds: [getAdjustedExerciseValue('rest', ex.exercise_after_rest)], 
                            type: 'main' 
                        });
                    }
                    return exercises;
                }
                // For exercises with duration (no sets)
                if (ex.exercise_duration_in_seconds && ex.exercise_duration_in_seconds.length > 0) {
                    return [
                        { ...ex, type: 'main' },
                        // Only add rest period if specified
                        ...(ex.exercise_after_rest ? [{
                            exercise_id: 'rest-period',
                            exercise_duration_in_seconds: [getAdjustedExerciseValue('rest', ex.exercise_after_rest)],
                            type: 'main'
                        }] : [])
                    ];
                }
                // Fallback for any other case
                return [{ ...ex, type: 'main' }];
            }),
            ...todayWorkout.cooldown.map(ex => ({ ...ex, type: 'cooldown' }))
        ];
        
        // Update total exercises count
        const totalUnique = getUniqueExercises(allExercises).length;
        document.querySelector('.total-exercises').textContent = totalUnique;

        currentExerciseIndex = 0;
        updateExerciseDisplay(allExercises[currentExerciseIndex]);

        // Setup navigation buttons
        setupNavigationButtons();

        // Set initialization flag
        isInitialized = true;

        // After everything is loaded and displayed
        hideLoading();
    } catch (error) {
        console.error('Error loading workout:', error);
        hideLoading();
        // Handle error state in the UI
    }
}

function setupNavigationButtons() {
    prevButton = document.querySelector('.prev-exercise');
    nextButton = document.querySelector('.next-exercise');
    pauseButton = document.querySelector('.pause-workout');
    endButton = document.querySelector('.end-workout');

    // Remove any existing event listeners
    prevButton.replaceWith(prevButton.cloneNode(true));
    nextButton.replaceWith(nextButton.cloneNode(true));
    pauseButton.replaceWith(pauseButton.cloneNode(true));
    endButton.replaceWith(endButton.cloneNode(true));

    // Get fresh references after cloning
    nextButton = document.querySelector('.next-exercise');
    prevButton = document.querySelector('.prev-exercise');
    pauseButton = document.querySelector('.pause-workout');
    endButton = document.querySelector('.end-workout');

    prevButton.addEventListener('click', () => {
        if (currentExerciseIndex > 0) {
            clearInterval(timer);
            currentExerciseIndex--;
            updateExerciseDisplay(allExercises[currentExerciseIndex]);
        }
    });

    nextButton.addEventListener('click', async () => {
        if (currentExerciseIndex < allExercises.length - 1) {
            clearInterval(timer);
            currentExerciseIndex++;
            updateExerciseDisplay(allExercises[currentExerciseIndex]);
        } else {
            const confirmed = await window.showPrompt('Complete Workout', 'Are you sure you want to complete the workout?');
            if (confirmed) {
                clearInterval(timer);
                window.location.href = '/exercises/dashboard';
            }
        }
    });

    pauseButton.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Resume Workout' : 'Pause Workout';
        prevButton.classList.toggle('disabled', isPaused);
        nextButton.classList.toggle('disabled', isPaused);
    });

    endButton.addEventListener('click', async () => {
        const confirmed = await window.showPrompt('End Workout', 'Are you sure you want to end the workout?');
        if (confirmed) {
            clearInterval(timer);
            window.location.href = '/exercises/dashboard';
        }
    });
}

function updateExerciseDisplay(exercise) {
    if (nextButton) {
        const isLastExercise = currentExerciseIndex === allExercises.length - 1;
        nextButton.textContent = isLastExercise ? 'Complete Workout' : 'Next';
        nextButton.classList.toggle('complete-workout', isLastExercise);
    }

    if (prevButton) {
        const isFirstExercise = currentExerciseIndex === 0;
        prevButton.classList.toggle('disabled', isFirstExercise);
    }

    const exerciseName = document.getElementById('exerciseName');
    const exerciseDescription = document.getElementById('exerciseDescription');
    const exerciseDuration = document.getElementById('exerciseDuration');
    const exerciseDurationLabel = document.getElementById('exerciseDurationLabel');
    const exercisePrimaryTargets = document.getElementById('exercisePrimaryTargets');
    const exerciseSecondaryTargets = document.getElementById('exerciseSecondaryTargets');
    const currentExerciseNumber = document.querySelector('.current-exercise-number');
    const exerciseGif = document.getElementById('exerciseGif');
    const exerciseTitle = document.querySelector('.exercise-title');
    const exerciseCard = document.querySelector('.exercise-card');
    const primaryTargetsRow = exercisePrimaryTargets.closest('.exercise-info-row');
    const secondaryTargetsRow = exerciseSecondaryTargets.closest('.exercise-info-row');

    // Update section title and card styling based on exercise type
    let sectionTitle;
    switch(exercise.type) {
        case 'warmup':
            sectionTitle = 'Warm Up';
            break;
        case 'main':
            sectionTitle = 'Main Workout';
            break;
        case 'cooldown':
            sectionTitle = 'Cool Down';
            break;
        default:
            sectionTitle = 'Current Exercise';
    }
    
    // Set the section type as a data attribute
    exerciseCard.setAttribute('data-section', exercise.type);
    exerciseTitle.textContent = sectionTitle;
    exerciseTitle.setAttribute('data-text-key', exercise.type + '-section');

    // Get exercise details from exercises-list.json
    const exerciseData = window.exercisesList[exercise.exercise_id];
    if (!exerciseData) {
        console.error(`Exercise data not found for ID: ${exercise.exercise_id}`);
        return;
    }

    // Update exercise details
    exerciseName.textContent = exerciseData.name;
    exerciseDescription.textContent = exerciseData.description;

    // Update duration/sets/reps info
    if (exercise.type === 'warmup' || exercise.type === 'cooldown') {
        // For warmup/cooldown, always show duration as provided.
        exerciseDurationLabel.textContent = 'Duration';
        exerciseDuration.textContent = `${exercise.exercise_duration_in_seconds} seconds`;
        startTimer(exercise.exercise_duration_in_seconds);
    } else {
        // For main exercises
        if (exercise.current_set) {
            // When an exercise has sets info, switch the label to "Set".
            exerciseDurationLabel.textContent = 'Set';
            exerciseDuration.textContent = `${exercise.current_set} of ${exercise.total_sets}`;
            startTimer(60); // Standard time for completing a set
        } else if (exercise.exercise_duration_in_seconds && exercise.exercise_duration_in_seconds.length > 0) {
            // If duration info exists for the main exercise
            exerciseDurationLabel.textContent = 'Duration';
            const duration = exercise.exercise_duration_in_seconds.join('-');
            exerciseDuration.textContent = `${duration} seconds`;
            startTimer(exercise.exercise_duration_in_seconds[0]);
        } else {
            // For main exercises without a duration; replace label with "Set"
            exerciseDurationLabel.textContent = 'Set';
            exerciseDuration.textContent = 'Set';
            startTimer(60); // Fallback timing (adjust as needed)
        }
    }

    // Update exercise number
    const uniqueSoFar = getUniqueExercises(allExercises.slice(0, currentExerciseIndex + 1));
    currentExerciseNumber.textContent = uniqueSoFar.length;

    // Update exercise GIF
    exerciseGif.src = `/exercises/assets/gifs/${exerciseData.name}.gif`;

    // Update target muscles
    if (exerciseData.primaryTargets && exerciseData.primaryTargets.length > 0) {
        exercisePrimaryTargets.innerHTML = exerciseData.primaryTargets
            .map(muscle => `<span data-text-key="${muscle}">${muscle}</span>`)
            .join(', ');
        primaryTargetsRow.style.display = 'flex'; // Show the row
    } else {
        exercisePrimaryTargets.innerHTML = '';
        primaryTargetsRow.style.display = 'none'; // Hide the row
    }

    // Handle secondary targets visibility
    if (exerciseData.secondaryTargets && exerciseData.secondaryTargets.length > 0) {
        exerciseSecondaryTargets.innerHTML = exerciseData.secondaryTargets
            .map(muscle => `<span data-text-key="${muscle}">${muscle}</span>`)
            .join(', ');
        secondaryTargetsRow.style.display = 'flex'; // Show the row
    } else {
        exerciseSecondaryTargets.innerHTML = '';
        secondaryTargetsRow.style.display = 'none'; // Hide the row
    }
}

// Helper function to calculate adjusted value based on phase and type
function calculatePhaseAdjustedValue(type, baseValue, phase) {
    if (!phase) return baseValue;

    let increase = 0;
    
    switch (type) {
        case 'sets':
            increase = phase.sets_increase_by_number;
            break;
        case 'reps':
            increase = phase.reps_increase_by_number;
            break;
        case 'duration':
            increase = phase.duration_increase_by_number;
            break;
        case 'rest':
            // For rest periods, we decrease instead of increase
            increase = -phase.rest_decrease_by_number;
            break;
        default:
            return baseValue;
    }

    // Add the direct increase/decrease value
    const adjustedValue = baseValue + increase;

    // Ensure we don't return negative values
    return Math.max(1, adjustedValue);
}

// Usage example:
function getAdjustedExerciseValue(type, baseValue) {
    // Get current phase from sessionStorage
    const phaseData = sessionStorage.getItem('current-phase');
    if (!phaseData) return baseValue;

    const phase = JSON.parse(phaseData);
    const adjustedValue = calculatePhaseAdjustedValue(type, baseValue, phase);
    return adjustedValue;
}

window.loadWorkoutData = loadWorkoutData;