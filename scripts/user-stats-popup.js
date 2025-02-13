document.addEventListener('DOMContentLoaded', async function() {
    if (window.authState) {
        await window.authState.init();
    }

    if (!window.authState || !window.authState.isTokenPresent) {
        return;
    }

    const avatar = document.querySelector('.avatar');
    const statsPopup = document.getElementById('statsPopup');
    const statsContainer = statsPopup.querySelector('.stats-container');
    const closeButton = document.getElementById('closeStats');
    const logoutButton = document.querySelector('.logout-button');

    if (!avatar || !statsPopup || !statsContainer || !closeButton || !logoutButton) {
        console.error('Required elements not found');
        return;
    }

    let workoutGoal = "no-goal-set";
    let workoutStreak = 0;
    let workoutTotalCompleted = 0;

    function calculateStreak(workoutData) {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Start checking from yesterday
        let dateToCheck = new Date(today);
        dateToCheck.setDate(dateToCheck.getDate() - 1);
        dateToCheck.setHours(0, 0, 0, 0);

        const startDate = new Date(workoutData.workoutPlan.createdAt);
        startDate.setHours(0, 0, 0, 0);
        
        const completedWorkouts = workoutData.workoutPlan.completed_workouts.map(workout => {
            const date = new Date(workout.year, workout.month, workout.day);
            date.setHours(0, 0, 0, 0);
            return date;
        });

        const hasWorkout = (date) => {
            if (!workoutData?.workoutPlan?.workout) return false;
            const dayOfWeek = date.getDay();
            return workoutData.workoutPlan.workout.some(w => w.day_of_the_week === dayOfWeek);
        };

        const isWorkoutCompleted = (date) => {
            return completedWorkouts.some(completedDate => 
                completedDate.toDateString() === date.toDateString()
            );
        };

        // If yesterday isn't a scheduled workout day, move backwards until we find the most recent day that is scheduled.
        while (dateToCheck >= startDate && !hasWorkout(dateToCheck)) {
            dateToCheck.setDate(dateToCheck.getDate() - 1);
        }

        // If none found (we went before the startDate), return a streak of zero.
        if (dateToCheck < startDate) {
            return streak;
        }

        if (isWorkoutCompleted(today)) {
            streak++;
        }

        // Iterate backwards through the scheduled workout days and count consecutive completed days.
        while (dateToCheck >= startDate) {
            if (hasWorkout(dateToCheck)) {
                if (isWorkoutCompleted(dateToCheck)) {
                    streak++;
                } else {
                    // If a scheduled workout day is not completed, the streak ends.
                    break;
                }
            }
            // Move backward to the previous scheduled workout day.
            let previous = new Date(dateToCheck);
            previous.setDate(previous.getDate() - 1);
            previous.setHours(0, 0, 0, 0);
            while (previous >= startDate && !hasWorkout(previous)) {
                previous.setDate(previous.getDate() - 1);
            }
            dateToCheck = previous;
        }
        return streak;
    }

    // Fetch workout data and calculate streak
    try {
        const token = localStorage.getItem('login-token');
        const response = await fetch(`${window.CONFIG.API_URL}/profile/workout`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch workout data');
        }

        const workoutData = await response.json();
        
        // Calculate streak using the local function
        workoutStreak = calculateStreak(workoutData);
        workoutTotalCompleted = workoutData.workoutPlan.completed_workouts.length;
        workoutGoal = localStorage.getItem('workout-goal') || "no-goal-set";
    } catch (error) {
        console.error('Error fetching workout data:', error);
    }

    // Add profile button if profile exists
    if (window.userData && window.userData.profile) {
        const statsFooter = statsPopup.querySelector('.stats-footer');
        const profileButton = document.createElement('button');
        profileButton.className = 'stats-profile-button aleo-text';
        profileButton.setAttribute('data-text-key', 'profile');
        profileButton.textContent = 'Profile';

        // Insert profile button before logout button
        statsFooter.insertBefore(profileButton, logoutButton);

        // Add click handler for profile button
        profileButton.addEventListener('click', function() {
            window.location.href = '/profile';
        });
    }
    
    document.getElementById('workout-goal').setAttribute('data-text-key', workoutGoal);
    document.getElementById('workout-streak').setAttribute('data-placeholder-workout-streak', workoutStreak);
    document.getElementById('workout-total-completed').setAttribute('data-placeholder-workout-total-completed', workoutTotalCompleted);

    // Show popup when clicking avatar
    avatar.addEventListener('click', async function(e) {
        e.stopPropagation();
        
        statsPopup.style.display = 'block';
        statsPopup.offsetHeight;
        statsPopup.classList.add('show');
        statsContainer.classList.add('show');
    });

    // Close popup when clicking close button
    closeButton.addEventListener('click', function() {
        statsPopup.classList.remove('show');
        statsContainer.classList.remove('show');
        setTimeout(() => {
            statsPopup.style.display = 'none';
        }, 300);
    });

    // Handle logout
    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('login-token');
        window.location.href = '/';
    });

    // Close popup when clicking outside
    document.addEventListener('click', function(e) {
        if (!statsPopup.contains(e.target) && e.target !== avatar) {
            statsPopup.classList.remove('show');
            statsContainer.classList.remove('show');
            setTimeout(() => {
                statsPopup.style.display = 'none';
            }, 300);
        }
    });
    
    window.stringsLoaded.then(() => {
        updatePageStrings();
    }).catch(error => {
        console.error('Error updating strings:', error);
    });
}); 