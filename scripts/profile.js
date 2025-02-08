document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Wait for auth state to be initialized
        if (window.authState) {
            await window.authState.init();
        }

        if (!window.authState || !window.authState.isTokenPresent) {
            window.location.href = '/';
            return;
        }

        const userData = await window.userData.user;
        if (userData && userData.user.phone) {
            document.getElementById('profilePhone').textContent = "+251" + userData.user.phone;
        }

        if (!window.userData.profile) {
            throw new Error('Failed to load profile');
        }

        const profile = window.userData.profile;
        
        // Basic Info
        document.getElementById('profileAge').textContent = profile.basicInfo.age;
        document.getElementById('profileGender').setAttribute('data-text-key', 
            `gender-${profile.basicInfo.gender}`);

        // Body Metrics
        document.getElementById('profileWeight').textContent = profile.bodyMetrics.weight;
        document.getElementById('profileHeight').textContent = profile.bodyMetrics.height;

        document.getElementById('profileBMI').textContent = profile.bodyMetrics.bmi.toFixed(1);
        document.getElementById('profileBodyFat').textContent = 
            profile.bodyMetrics.bodyFat ? `${profile.bodyMetrics.bodyFat}%` : '--';

        // Lifestyle
        const activityLabels = {
            sedentary: 'sedentary-activity',
            light: 'light-activity',
            moderate: 'moderate-activity',
            active: 'active-activity',
            very_active: 'very-active-activity'
        };
        document.getElementById('profileActivity').setAttribute('data-text-key', 
            activityLabels[profile.lifestyle.activityLevel]);

        // Create tags for dietary preferences
        const dietContainer = document.getElementById('profileDiet');
        dietContainer.innerHTML = ''; // Clear existing content
        if (profile.lifestyle.dietaryPreferences.length > 0) {
            profile.lifestyle.dietaryPreferences.forEach(diet => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.setAttribute('data-text-key', diet);
                dietContainer.appendChild(tag);
            });
        } else {
            dietContainer.setAttribute('data-text-key', 'none-specified');
        }

        // Create tags for allergies
        const allergiesContainer = document.getElementById('profileAllergies');
        allergiesContainer.innerHTML = ''; // Clear existing content
        if (profile.lifestyle.allergies.length > 0) {
            profile.lifestyle.allergies.forEach(allergy => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.setAttribute('data-text-key', allergy);
                allergiesContainer.appendChild(tag);
            });
        } else {
            allergiesContainer.setAttribute('data-text-key', 'none-reported');
        }

        // Create tags for health conditions
        const healthContainer = document.getElementById('profileHealth');
        healthContainer.innerHTML = ''; // Clear existing content
        if (profile.lifestyle.healthConditions.length > 0) {
            profile.lifestyle.healthConditions.forEach(condition => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.setAttribute('data-text-key', condition);
                healthContainer.appendChild(tag);
            });
        } else {
            healthContainer.setAttribute('data-text-key', 'none-reported');
        }

        // Goals
        const goalLabels = {
            weightLoss: 'goal-weight-loss',
            muscleGain: 'goal-muscle-gain',
            maintenance: 'goal-maintenance',
            performance: 'goal-performance',
            wellness: 'goal-wellness'
        };
        document.getElementById('profileGoal').setAttribute('data-text-key', 
            goalLabels[profile.goals.primaryGoal]);

        // Workout Preferences
        if (profile.goals.preferences && profile.goals.preferences[profile.goals.primaryGoal]) {
            const prefs = profile.goals.preferences[profile.goals.primaryGoal];
            
            // Create a mapping of preference labels based on goal type
            const preferenceLabels = {
                weightLoss: {
                    cardio: 'cardio-focus',
                    hiit: 'hiit-training',
                    mixed: 'mixed-training'
                },
                muscleGain: {
                    full_body: 'full-body',
                    split: 'split-routine'
                },
                maintenance: {
                    balanced: 'balanced-training',
                    strength_focused: 'strength-maintenance',
                    cardio_focused: 'cardio-maintenance'
                },
                performance: {
                    strength: 'strength-performance',
                    endurance: 'endurance-focus',
                    power: 'power-development'
                },
                wellness: {
                    mind_body: 'mind-body-balance',
                    functional: 'functional-fitness',
                    mobility: 'mobility-focus'
                }
            };

            // Handle workout type based on goal
            const goalLabels = preferenceLabels[profile.goals.primaryGoal];
            if (prefs && prefs.type) {
                document.getElementById('profileWorkoutType').setAttribute('data-text-key', 
                    goalLabels[prefs.type] || prefs.type);
                
                const environmentElement = document.getElementById('profileWorkoutEnvironment');
                if (environmentElement) {
                    const environmentContainer = environmentElement.closest('.info-item');
                    if (prefs.environment) {
                        environmentContainer.style.display = '';
                        const envLabels = {
                            gym: 'environment-gym',
                            home: 'environment-home',
                            outdoor: 'environment-outdoor'
                        };
                        environmentElement.setAttribute('data-text-key', 
                            envLabels[prefs.environment] || prefs.environment);
                    } else {
                        environmentContainer.style.display = 'none';
                    }
                }
            }
        }

        // Frequency
        const frequencyLabels = {
            three_day: 'frequency-three-day',
            four_day: 'frequency-four-day',
            five_day: 'frequency-five-day'
        };
        document.getElementById('profileFrequency').setAttribute('data-text-key', 
            frequencyLabels[profile.goals.frequency] || profile.goals.frequency);

        // Intensity
        const intensityLabels = {
            beginner: 'intensity-beginner',
            intermediate: 'intensity-intermediate',
            advanced: 'intensity-advanced'
        };
        document.getElementById('profileIntensity').setAttribute('data-text-key', 
            intensityLabels[profile.goals.intensity] || profile.goals.intensity);

        // Update all strings after setting data-text-key attributes
        window.stringsLoaded.then(() => {
            updatePageStrings();
        }).catch(error => {
            console.error('Error updating strings:', error);
        });

    } catch (error) {
        console.error('Error loading profile:', error);
    }
});
