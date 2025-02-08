class WorkoutCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.workoutData = null;
        this.startDate = null;  // Add this to track the start date
        this.endDate = null;  // Add this line
        this.init();
    }

    async init() {
        try {
            const token = localStorage.getItem('login-token');
            const response = await fetch(`${window.CONFIG.API_URL}/profile/workout`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            this.workoutData = await response.json();
            
            // Set the start date from workoutData
            this.startDate = new Date(this.workoutData.workoutPlan.createdAt);
            
            // Calculate and set the end date
            const weeksPerPhase = this.workoutData.workoutPlan.number_of_weeks_per_phase;
            const numberOfPhases = this.workoutData.workoutPlan.phases.length;
            const totalWeeks = weeksPerPhase * numberOfPhases;
            
            this.endDate = new Date(this.startDate);
            this.endDate.setDate(this.endDate.getDate() + (totalWeeks * 7));
            
            this.render();
            this.attachEventListeners();
            this.updateSelectedDayWorkout();
        } catch (error) {
            console.error('Error initializing calendar:', error);
        }
    }

    render() {
        this.updateCalendarTitle();
        this.renderDays();
        this.updateNavigationButtons();
    }

    updateCalendarTitle() {
        const title = document.querySelector('.calendar-title');
        title.textContent = this.currentDate.toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
        });
    }

    renderDays() {
        const daysContainer = document.querySelector('.calendar-days');
        daysContainer.innerHTML = '';

        const firstDay = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            1
        );
        const lastDay = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1,
            0
        );

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            daysContainer.appendChild(this.createDayElement(null));
        }

        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                day
            );
            daysContainer.appendChild(this.createDayElement(date));
        }
    }

    createDayElement(date) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (!date) {
            dayElement.classList.add('empty');
            return dayElement;
        }

        // Strip time component from both dates for comparison
        const startDateStripped = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
        const endDateStripped = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate());
        const dateStripped = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        // Check if the date is before start date or after end date
        if (this.startDate && dateStripped < startDateStripped || 
            this.endDate && dateStripped > endDateStripped) {
            dayElement.classList.add('disabled');
            dayElement.textContent = date.getDate();
            return dayElement;
        }

        dayElement.textContent = date.getDate();
        dayElement.dataset.date = date.toISOString();

        // Add classes for current day and selected day
        if (this.isCurrentDay(date)) {
            dayElement.classList.add('selected');
            dayElement.classList.add('current');
        }
        if (this.isSelectedDay(date)) {
            dayElement.classList.add('selected');
        }

        // Add class if day has workout
        if (this.hasWorkout(date)) {
            dayElement.classList.add('has-workout');
        }

        // Only add click event if date is not before start date
        dayElement.addEventListener('click', () => this.selectDate(date));
        return dayElement;
    }

    hasWorkout(date) {
        if (!this.workoutData?.workoutPlan?.workout) return false;
        const dayOfWeek = date.getDay();
        //if (date.getDate() === 4) {
        //    console.log(date.getDay(), this.workoutData.workoutPlan.workout.some(w => w.day_of_the_week === dayOfWeek));
        //}
        return this.workoutData.workoutPlan.workout.some(w => w.day_of_the_week === dayOfWeek);
    }

    isCurrentDay(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    isSelectedDay(date) {
        return date.toDateString() === this.selectedDate.toDateString();
    }

    selectDate(date) {
        this.selectedDate = date;
        this.render();
        this.updateSelectedDayWorkout();
    }

    updateSelectedDayWorkout() {
        const summaryContainer = document.querySelector('.workout-summary');
        const workout = this.getWorkoutForDate(this.selectedDate);
        const startButton = document.querySelector('.start-workout-button');
        const regenerateButton = document.querySelector('.regenerate-workout-button');
        const resetButton = document.querySelector('.reset-progress-button');
        
        if (workout) {
            const phaseNumber = this.getPhaseNumber(this.selectedDate);
            summaryContainer.innerHTML = `
                <p><strong>Phase:</strong> ${this.getOrdinalSuffix(phaseNumber)} Phase</p>
                <p><strong>Exercises:</strong> ${this.getExerciseList(workout)}</p>
                <p><strong>Estimated Duration:</strong> ${this.getWorkoutDuration(workout)} Minutes</p>
            `;
            
            startButton.style.display = 'block';
            regenerateButton.style.display = 'block';
            resetButton.style.display = 'block';
            
            startButton.addEventListener('click', () => {
                const workout = this.getWorkoutForDate(this.selectedDate);
                if (workout) {
                    // Store workout data in sessionStorage
                    sessionStorage.setItem('current-workout', JSON.stringify(workout));
                    const currentPhaseNumber = phaseNumber - 1;
                    const accumulatedPhase = {
                        ...this.workoutData.workoutPlan.phases[0]
                    };

                    // Accumulate percentages from all previous phases
                    for (let i = 0; i <= currentPhaseNumber; i++) {
                        const phase = this.workoutData.workoutPlan.phases[i];
                        accumulatedPhase.sets_increase_by_number += phase.sets_increase_by_number || 0;
                        accumulatedPhase.reps_increase_by_number += phase.reps_increase_by_number || 0;
                        accumulatedPhase.duration_increase_by_number += phase.duration_increase_by_number || 0;
                        accumulatedPhase.rest_decrease_by_number += phase.rest_decrease_by_number || 0;
                    }

                    sessionStorage.setItem('current-phase', JSON.stringify(accumulatedPhase));
                    
                    // Hide calendar and show workout content
                    document.querySelector('.workout-calendar').style.display = 'none';
                    document.querySelector('.workout-content').style.display = 'block';
                    
                    // Initialize the workout loader
                    window.loadWorkoutData();
                }
            });
            
            regenerateButton.addEventListener('click', async () => {
                const confirmed = await window.showPrompt(
                    'prompt-workout-regen-title',
                    'prompt-workout-regen-message'
                );
                if (confirmed) {                   
                    const success = await this.regenerateWorkout();

                    if (success) {
                        window.showToast('toast-workout-regen', false);
                        setTimeout(() => {
                            window.location = '/exercises/dashboard';
                        }, 3000);
                    } else {
                        window.showToast('toast-workout-regen-error', true);
                    }
                }
            });
            
            resetButton.addEventListener('click', async () => {
                const confirmed = await window.showPrompt(
                    'prompt-workout-reset-title',
                    'prompt-workout-reset-message'
                );
                if (confirmed) {
                    const success = await this.resetWorkoutProgress();
                    
                    if (success) {
                        window.showToast('toast-workout-reset', false);
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    } else {
                        window.showToast('toast-workout-reset-error', true);
                    }
                }
            });
        } else {
            summaryContainer.innerHTML = '<p><strong>Rest day</strong>: No workout scheduled</p>';
            startButton.style.display = 'none';
            regenerateButton.style.display = 'none';
            resetButton.style.display = 'none';
        }
    }

    getWorkoutForDate(date) {
        if (!this.workoutData?.workoutPlan?.workout) return null;
        const dayOfWeek = date.getDay();
        return this.workoutData.workoutPlan.workout.find(w => w.day_of_the_week === dayOfWeek);
    }

    attachEventListeners() {
        document.querySelector('.prev-month').addEventListener('click', () => {
            const newDate = new Date(this.currentDate);
            newDate.setMonth(this.currentDate.getMonth() - 1);
            
            // Only allow going back to the start date's month
            if (newDate.getFullYear() > this.startDate.getFullYear() || 
                (newDate.getFullYear() === this.startDate.getFullYear() && 
                 newDate.getMonth() >= this.startDate.getMonth())) {
                this.currentDate = newDate;
                this.render();
                this.updateNavigationButtons();
            }
        });

        document.querySelector('.next-month').addEventListener('click', () => {
            const newDate = new Date(this.currentDate);
            newDate.setMonth(this.currentDate.getMonth() + 1);
            
            // Only allow going forward to the end date's month
            if (newDate.getFullYear() < this.endDate.getFullYear() || 
                (newDate.getFullYear() === this.endDate.getFullYear() && 
                 newDate.getMonth() <= this.endDate.getMonth())) {
                this.currentDate = newDate;
                this.render();
                this.updateNavigationButtons();
            }
        });

        // Initial button state
        this.updateNavigationButtons();
    }

    getExerciseList(workout) {
        if (!workout.main_workout) return 'No exercises';
        return workout.main_workout
            .map(exercise => exercise.exercise_id)
            .join(', ');
    }

    getWorkoutDuration(workout) {
        if (!workout?.estimated_workout_time_in_seconds) return 0;
        return Math.round(workout.estimated_workout_time_in_seconds / 60); // Convert to minutes
    }

    getPhaseNumber(date) {
        if (!this.workoutData?.workoutPlan?.number_of_weeks_per_phase) return 1;
        
        const startDateStripped = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
        const dateStripped = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Calculate weeks elapsed since start date, ignoring time
        const weeksDiff = Math.floor((dateStripped - startDateStripped) / (7 * 24 * 60 * 60 * 1000));
        
        // Calculate current phase (1-based)
        const weeksPerPhase = this.workoutData.workoutPlan.number_of_weeks_per_phase;
        const currentPhase = Math.floor(weeksDiff / weeksPerPhase) + 1;
        
        return currentPhase;
    }

    getOrdinalSuffix(number) {
        const j = number % 10;
        const k = number % 100;
        if (j == 1 && k != 11) {
            return number + "st";
        }
        if (j == 2 && k != 12) {
            return number + "nd";
        }
        if (j == 3 && k != 13) {
            return number + "rd";
        }
        return number + "th";
    }

    async regenerateWorkout() {
        try {
            const token = localStorage.getItem('login-token');
            const response = await fetch(`${window.CONFIG.API_URL}/profile/workout/regenerate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to regenerate workout');
            }

            return true;
        } catch (error) {
            console.error('Error regenerating workout:', error);
            return false;
        }
    }

    async resetWorkoutProgress() {
        try {
            const token = localStorage.getItem('login-token');
            const response = await fetch(`${window.CONFIG.API_URL}/profile/workout/reset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to reset workout progress');
            }

            return true;
        } catch (error) {
            console.error('Error resetting workout progress:', error);
            return false;
        }
    }

    updateNavigationButtons() {
        const prevButton = document.querySelector('.prev-month');
        const nextButton = document.querySelector('.next-month');
        
        // Check if we can go back
        const prevDate = new Date(this.currentDate);
        prevDate.setMonth(this.currentDate.getMonth() - 1);
        const canGoBack = prevDate.getFullYear() > this.startDate.getFullYear() || 
            (prevDate.getFullYear() === this.startDate.getFullYear() && 
             prevDate.getMonth() >= this.startDate.getMonth());
        
        // Check if we can go forward
        const nextDate = new Date(this.currentDate);
        nextDate.setMonth(this.currentDate.getMonth() + 1);
        const canGoForward = nextDate.getFullYear() < this.endDate.getFullYear() || 
            (nextDate.getFullYear() === this.endDate.getFullYear() && 
             nextDate.getMonth() <= this.endDate.getMonth());
        
        // Update button states
        prevButton.classList.toggle('disabled', !canGoBack);
        nextButton.classList.toggle('disabled', !canGoForward);
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WorkoutCalendar();
}); 