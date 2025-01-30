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
        document.getElementById('profileGender').textContent = 
            profile.basicInfo.gender.charAt(0).toUpperCase() + profile.basicInfo.gender.slice(1);

        // Body Metrics
        document.getElementById('profileWeight').textContent = `${profile.bodyMetrics.weight} kg`;
        document.getElementById('profileHeight').textContent = `${profile.bodyMetrics.height} cm`;
        document.getElementById('profileBMI').textContent = profile.bodyMetrics.bmi.toFixed(1);
        document.getElementById('profileBodyFat').textContent = 
            profile.bodyMetrics.bodyFat ? `${profile.bodyMetrics.bodyFat}%` : 'Not specified';

        // Lifestyle
        const activityLabels = {
            sedentary: 'Sedentary',
            light: 'Light Activity',
            moderate: 'Moderate Activity',
            active: 'Active',
            very_active: 'Very Active'
        };
        document.getElementById('profileActivity').textContent = 
            activityLabels[profile.lifestyle.activityLevel];

        // Create tags for dietary preferences
        const dietContainer = document.getElementById('profileDiet');
        dietContainer.innerHTML = ''; // Clear existing content
        if (profile.lifestyle.dietaryPreferences.length > 0) {
            profile.lifestyle.dietaryPreferences.forEach(diet => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = diet.charAt(0).toUpperCase() + diet.slice(1);
                dietContainer.appendChild(tag);
            });
        } else {
            dietContainer.textContent = 'None specified';
        }

        // Create tags for allergies
        const allergiesContainer = document.getElementById('profileAllergies');
        allergiesContainer.innerHTML = ''; // Clear existing content
        if (profile.lifestyle.allergies.length > 0) {
            profile.lifestyle.allergies.forEach(allergy => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = allergy.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                allergiesContainer.appendChild(tag);
            });
        } else {
            allergiesContainer.textContent = 'None reported';
        }

        // Create tags for health conditions
        const healthContainer = document.getElementById('profileHealth');
        healthContainer.innerHTML = ''; // Clear existing content
        if (profile.lifestyle.healthConditions.length > 0) {
            profile.lifestyle.healthConditions.forEach(condition => {
                const tag = document.createElement('span');
                tag.className = 'tag';
                tag.textContent = condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                healthContainer.appendChild(tag);
            });
        } else {
            healthContainer.textContent = 'None reported';
        }

        // Goals
        const goalLabels = {
            weight_loss: 'Weight Loss',
            muscleGain: 'Muscle Gain',
            maintenance: 'Maintenance',
            performance: 'Performance Improvement',
            wellness: 'Overall Wellness'
        };
        document.getElementById('profileGoal').textContent = goalLabels[profile.goals.primaryGoal];

        // Workout Preferences
        if (profile.goals.preferences && profile.goals.preferences[profile.goals.primaryGoal]) {
            const prefs = profile.goals.preferences[profile.goals.primaryGoal];
            
            // Handle workout type
            if (prefs.type) {
                const typeLabels = {
                    full_body: 'Full Body',
                    upper_lower: 'Upper/Lower Split',
                    push_pull: 'Push/Pull Split'
                };
                document.getElementById('profileWorkoutType').textContent = typeLabels[prefs.type] || prefs.type;
            }

            // Handle environment
            if (prefs.environment) {
                const envLabels = {
                    gym: 'Gym',
                    home: 'Home',
                    outdoor: 'Outdoor'
                };
                document.getElementById('profileWorkoutEnvironment').textContent = 
                    envLabels[prefs.environment] || prefs.environment;
            }
        }

        // Frequency
        const frequencyLabels = {
            three_day: '3 Days',
            four_day: '4 Days',
            five_day: '5 Days',
            six_day: '6 Days'
        };
        document.getElementById('profileFrequency').textContent = 
            frequencyLabels[profile.goals.frequency] || profile.goals.frequency;

        // Intensity
        const intensityLabels = {
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced'
        };
        document.getElementById('profileIntensity').textContent = 
            intensityLabels[profile.goals.intensity] || profile.goals.intensity;

    } catch (error) {
        console.error('Error loading profile:', error);
        // You might want to show an error message to the user
    }
});
