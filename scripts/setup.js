document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('profileSetupForm');
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressFill = document.querySelector('.progress-fill');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    let currentStep = 1;
    const totalSteps = 7;

    const primaryGoalInputs = document.querySelectorAll('input[name="primary_goal"]');

    const handleGoalChange = (e) => {
        // Hide all preference sections first
        document.querySelectorAll('.preference-section').forEach(section => {
            if (section.id !== 'workoutEnvironmentPreferences') {
                section.style.display = 'none';
            }
        });

        // Clear any previously selected preferences
        document.querySelectorAll('input[name="weight_loss_preference"], input[name="muscle_gain_preference"], input[name="performance_preference"], input[name="maintenance_preference"], input[name="wellness_preference"]').forEach(input => {
            input.required = false;
        });

        // Workout environment is always required
        document.querySelectorAll('input[name="workout_environment"]').forEach(input => {
            input.required = true;
        });

        // Show relevant section based on selected goal
        const goal = e.target.value;
        switch (goal) {
            case 'weightLoss':
                document.getElementById('weightLossPreferences').style.display = 'block';
                document.querySelectorAll('input[name="weight_loss_preference"]').forEach(input => {
                    input.required = true;
                });
                break;
            case 'muscleGain':
                document.getElementById('muscleGainPreferences').style.display = 'block';
                document.querySelectorAll('input[name="muscle_gain_preference"]').forEach(input => {
                    input.required = true;
                });
                break;
            case 'performance':
                document.getElementById('performancePreferences').style.display = 'block';
                document.querySelectorAll('input[name="performance_preference"]').forEach(input => {
                    input.required = true;
                });
                break;
            case 'maintenance':
                document.getElementById('maintenancePreferences').style.display = 'block';
                document.querySelectorAll('input[name="maintenance_preference"]').forEach(input => {
                    input.required = true;
                });
                break;
            case 'wellness':
                document.getElementById('wellnessPreferences').style.display = 'block';
                document.querySelectorAll('input[name="wellness_preference"]').forEach(input => {
                    input.required = true;
                });
                break;
        }
    };

    primaryGoalInputs.forEach(input => {
        input.addEventListener('change', handleGoalChange);
    });

    // Initialize progress bar
    updateProgressBar();

    // Add click handlers to progress steps
    progressSteps.forEach(step => {
        step.addEventListener('click', () => {
            const stepNumber = parseInt(step.dataset.step);
            if (canNavigateToStep(stepNumber)) {
                navigateToStep(stepNumber);
            }
        });

        // Add keyboard navigation
        step.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const stepNumber = parseInt(step.dataset.step);
                if (canNavigateToStep(stepNumber)) {
                    navigateToStep(stepNumber);
                }
            }
        });
    });

    function canNavigateToStep(stepNumber) {
        // Can always go back
        if (stepNumber < currentStep) return true;
        
        // Can only go forward one step at a time and must validate current step
        return stepNumber === currentStep + 1 && validateCurrentStep();
    }

    function navigateToStep(stepNumber) {
        if (stepNumber === currentStep) return;

        const direction = stepNumber > currentStep ? 'forward' : 'backward';
        currentStep = stepNumber;
        updateFormSteps(direction);
    }

    function updateProgressBar() {
        // Update progress fill
        const progress = (((currentStep - 1) / (totalSteps)) * 100) * 1.1;
        progressFill.style.width = `${progress}%`;

        // Update step states
        progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed', 'disabled');
            
            if (stepNum === currentStep) {
                step.classList.add('active');
            } else if (stepNum < currentStep) {
                step.classList.add('completed');
            } else if (!canNavigateToStep(stepNum)) {
                step.classList.add('disabled');
            }
        });
    }

    function updateFormSteps(direction = 'forward') {
        steps.forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.remove('hidden');
                step.style.animation = direction === 'forward' 
                    ? 'fadeIn 0.5s ease forwards'
                    : 'fadeIn 0.5s ease forwards reverse';
            } else {
                step.classList.add('hidden');
            }
        });

        updateProgressBar();

        // Update buttons
        prevBtn.disabled = currentStep === 1;
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }

    // Initialize BMI calculation
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const bmiValue = document.getElementById('bmiValue');

    function calculateBMI() {
        if (weightInput.value && heightInput.value) {
            const weight = parseFloat(weightInput.value);
            const height = parseFloat(heightInput.value) / 100; // Convert cm to meters
            const bmi = (weight / (height * height)).toFixed(1);
            bmiValue.textContent = bmi;
        }
    }

    weightInput?.addEventListener('input', calculateBMI);
    heightInput?.addEventListener('input', calculateBMI);

    function validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const requiredInputs = currentStepElement.querySelectorAll('input[required], select[required]');
        
        let isValid = true;
        requiredInputs.forEach(input => {
            if (input.type === 'radio') {
                const radioGroup = currentStepElement.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked) isValid = false;
            } else {
                if (!input.value) isValid = false;
            }
        });

        return isValid;
    }

    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            navigateToStep(currentStep + 1);
        } else {
            window.showToast('toast-fill-fields', true);
        }
    });

    prevBtn.addEventListener('click', () => {
        navigateToStep(currentStep - 1);
    });

    // Form submission
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!validateCurrentStep()) {
            window.showToast('toast-fill-fields', true);
            return;
        }

        // Add loading state and disable button
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const profileData = {
            basicInfo: {
                age: parseInt(formData.get('age')),
                gender: formData.get('gender')
            },
            bodyMetrics: {
                weight: parseFloat(formData.get('weight')),
                height: parseFloat(formData.get('height')),
                bodyFat: formData.get('bodyFat') ? parseFloat(formData.get('bodyFat')) : null,
                bmi: parseFloat(bmiValue.textContent)
            },
            lifestyle: {
                activityLevel: formData.get('activityLevel'),
                dietaryPreferences: Array.from(formData.getAll('diet')),
                allergies: Array.from(formData.getAll('allergies')),
                healthConditions: Array.from(formData.getAll('health'))
            },
            goals: {
                preferences: (() => {
                    const goal = formData.get('primary_goal');
                    const environment = formData.get('workout_environment');
                    switch (goal) {
                        case 'muscleGain':
                            return {
                                muscleGain: {
                                    type: formData.get('muscle_gain_preference'),
                                    environment: environment
                                },
                                weightLoss: null,
                                performance: null,
                                maintenance: null,
                                wellness: null
                            };
                        case 'weightLoss':
                            return {
                                muscleGain: null,
                                weightLoss: {
                                    type: formData.get('weight_loss_preference'),
                                    environment: environment
                                },
                                performance: null,
                                maintenance: null,
                                wellness: null
                            };
                        case 'performance':
                            return {
                                muscleGain: null,
                                weightLoss: null,
                                performance: {
                                    type: formData.get('performance_preference'),
                                    environment: environment
                                },
                                maintenance: null,
                                wellness: null
                            };
                        case 'maintenance':
                            return {
                                muscleGain: null,
                                weightLoss: null,
                                performance: null,
                                maintenance: {
                                    type: formData.get('maintenance_preference'),
                                    environment: environment
                                },
                                wellness: null
                            };
                        case 'wellness':
                            return {
                                muscleGain: null,
                                weightLoss: null,
                                performance: null,
                                maintenance: null,
                                wellness: {
                                    type: formData.get('wellness_preference'),
                                    environment: environment
                                }
                            };
                        default:
                            return {
                                muscleGain: null,
                                weightLoss: null,
                                performance: null,
                                maintenance: null,
                                wellness: null
                            };
                    }
                })(),
                primaryGoal: formData.get('primary_goal'),
                frequency: formData.get('exercise_frequency'),
                intensity: formData.get('exercise_intensity')
            },
            ingredients: Array.from(document.querySelectorAll('input[name="ingredients"]:checked'))
                .map(input => input.value)
        };
        
        try {
            const token = localStorage.getItem('login-token');
            const response = await fetch(`${window.CONFIG.API_URL}/profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                window.showToast('toast-profile-save', false);
                setTimeout(() => {
                    window.location.href = '/dashboard';
                    //console.log('Profile saved');
                }, 1500);
            } else {
                throw new Error('Failed to save profile');
            }
        } catch (error) {
            window.showToast('toast-profile-save-error', true);
            console.error('Error:', error);
            // Remove loading state and re-enable button on error
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    async function loadProfile() {
        try {
            // Wait for auth state to be initialized if needed
            if (window.authState && !window.authState.isInitialized) {
                await window.authState.init();
            }

            if (!window.userData.profile) {
                return;
            }

            const profile = window.userData.profile;
            
            // Basic Info
            document.getElementById('age').value = profile.basicInfo.age;
            const genderRadios = document.querySelectorAll('input[name="gender"]');
            genderRadios.forEach(radio => {
                if (radio.value === profile.basicInfo.gender) {
                    radio.checked = true;
                }
            });

            // Body Metrics
            document.getElementById('weight').value = profile.bodyMetrics.weight;
            document.getElementById('height').value = profile.bodyMetrics.height;
            if (profile.bodyMetrics.bodyFat) {
                document.getElementById('bodyFat').value = profile.bodyMetrics.bodyFat;
            }
            // Trigger BMI calculation
            calculateBMI();

            // Lifestyle
            const activityRadios = document.querySelectorAll('input[name="activityLevel"]');
            activityRadios.forEach(radio => {
                if (radio.value === profile.lifestyle.activityLevel) {
                    radio.checked = true;
                }
            });

            // Multiple selections (checkboxes)
            profile.lifestyle.dietaryPreferences.forEach(diet => {
                const checkbox = document.querySelector(`input[name="diet"][value="${diet}"]`);
                if (checkbox) checkbox.checked = true;
            });

            profile.lifestyle.allergies.forEach(allergy => {
                const checkbox = document.querySelector(`input[name="allergies"][value="${allergy}"]`);
                if (checkbox) checkbox.checked = true;
            });

            profile.lifestyle.healthConditions.forEach(condition => {
                const checkbox = document.querySelector(`input[name="health"][value="${condition}"]`);
                if (checkbox) checkbox.checked = true;
            });

            // Goals
            const goalRadios = document.querySelectorAll('input[name="primary_goal"]');
            goalRadios.forEach(radio => {
                if (radio.value === profile.goals.primaryGoal) {
                    radio.checked = true;
                }
            });

            // Load preferences based on goal type
            if (profile.goals.preferences) {
                switch (profile.goals.primaryGoal) {
                    case 'weightLoss':
                        const weightLossRadio = document.querySelector(`input[name="weight_loss_preference"][value="${profile.goals.preferences.weightLoss.type}"]`);
                        const weightLossEnvRadio = document.querySelector(`input[name="workout_environment"][value="${profile.goals.preferences.weightLoss.environment}"]`);
                        if (weightLossRadio) weightLossRadio.checked = true;
                        if (weightLossEnvRadio) weightLossEnvRadio.checked = true;
                        break;
                    case 'muscleGain':
                        const muscleTypeRadio = document.querySelector(`input[name="muscle_gain_preference"][value="${profile.goals.preferences.muscleGain.type}"]`);
                        const muscleEnvRadio = document.querySelector(`input[name="workout_environment"][value="${profile.goals.preferences.muscleGain.environment}"]`);
                        if (muscleTypeRadio) muscleTypeRadio.checked = true;
                        if (muscleEnvRadio) muscleEnvRadio.checked = true;
                        break;
                    case 'performance':
                        const performanceRadio = document.querySelector(`input[name="performance_preference"][value="${profile.goals.preferences.performance.type}"]`);
                        const performanceEnvRadio = document.querySelector(`input[name="workout_environment"][value="${profile.goals.preferences.performance.environment}"]`);
                        if (performanceRadio) performanceRadio.checked = true;
                        if (performanceEnvRadio) performanceEnvRadio.checked = true;
                        break;
                    case 'maintenance':
                        const maintenanceRadio = document.querySelector(`input[name="maintenance_preference"][value="${profile.goals.preferences.maintenance.type}"]`);
                        const maintenanceEnvRadio = document.querySelector(`input[name="workout_environment"][value="${profile.goals.preferences.maintenance.environment}"]`);
                        if (maintenanceRadio) maintenanceRadio.checked = true;
                        if (maintenanceEnvRadio) maintenanceEnvRadio.checked = true;
                        break;
                    case 'wellness':
                        const wellnessRadio = document.querySelector(`input[name="wellness_preference"][value="${profile.goals.preferences.wellness.type}"]`);
                        const wellnessEnvRadio = document.querySelector(`input[name="workout_environment"][value="${profile.goals.preferences.wellness.environment}"]`);
                        if (wellnessRadio) wellnessRadio.checked = true;
                        if (wellnessEnvRadio) wellnessEnvRadio.checked = true;
                        break;
                }
            }

            // Trigger preference display
            handleGoalChange({ target: { value: profile.goals.primaryGoal } });

            // Exercise Schedule
            const frequencyRadios = document.querySelectorAll('input[name="exercise_frequency"]');
            frequencyRadios.forEach(radio => {
                if (radio.value === profile.goals.frequency) {
                    radio.checked = true;
                }
            });

            // Exercise Intensity
            const intensityRadios = document.querySelectorAll('input[name="exercise_intensity"]');
            intensityRadios.forEach(radio => {
                if (radio.value === profile.goals.intensity) {
                    radio.checked = true;
                }
            });

            // Ingredients
            if (profile.ingredients && profile.ingredients.length > 0) {
                // First check all ingredients
                document.querySelectorAll('input[name="ingredients"]').forEach(checkbox => {
                    checkbox.checked = true;
                });
                // Then uncheck those not in the profile's ingredients
                document.querySelectorAll('input[name="ingredients"]').forEach(checkbox => {
                    if (!profile.ingredients.includes(checkbox.value)) {
                        checkbox.checked = false;
                    }
                });
            } else {
                // If no ingredients data exists, check all ingredients
                document.querySelectorAll('input[name="ingredients"]').forEach(checkbox => {
                    checkbox.checked = true;
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            window.showToast('toast-profile-load-error', true);
        }
    }

    // Initialize form
    updateFormSteps();
    loadProfile();

    // Ingredients handling
    const ingredients = [
        'salt', 'sugar', 'olive_oil', 'vegetable_oil', 'flour', 'teff_flour', 
        'corn_flour', 'rice_flour', 'egg', 'milk', 'butter', 'cheese', 'tomato', 
        'onion', 'garlic', 'ginger', 'lemon', 'chili_powder', 'black_pepper', 'berbere', 
        'mitmita', 'shiro_powder', 'potato', 'carrot', 'green_beans', 'bell_pepper', 
        'spinach', 'cabbage', 'lentils', 'chickpeas', 'apple', 'banana', 'mango', 
        'pineapple', 'orange', 'zucchini', 'rice', 'chicken_broth', 'beef_broth', 
        'rosemary', 'gesho_leaves', 'injera', 'red_pepper', 'wheat_flour', 'barley', 
        'honey', 'green_chili', 'cooking_oil', 'yogurt', 'beef', 'chicken', 'fish', 
        'tomato_paste', 'eggplant', 'corn', 'pumpkin', 'avocado', 'watermelon', 
        'grapes', 'papaya', 'coffee_beans', 'peanuts', 'almonds', 'sesame_seeds', 
        'sunflower_seeds', 'raisins', 'coconut', 'spaghetti', 'bread_crumbs', 
        'cocoa_powder', 'soy_sauce', 'coconut_milk', 'all_purpose_flour', 
        'granulated_sugar', 'brown_sugar', 'pasta', 'bread', 'oats', 'broccoli', 
        'lettuce', 'mushrooms', 'peas', 'mustard', 'ketchup', 'mayonnaise', 'sugarcane', 
        'maize', 'sorghum', 'wheat', 'fava_beans', 'groundnuts', 'red_meat', 
        'coconut_oil', 'beans', 'meat', 'sweet_potatoes', 'liver', 'fortified_milk', 
        'herbal_teas', 'fermented_milk', 'dark_chocolate', 'nuts'
    ];

    function initializeIngredients() {
        const grid = document.getElementById('ingredientsGrid');
        const searchInput = document.getElementById('ingredientSearch');

        function createIngredientElement(ingredient) {
            const label = document.createElement('label');
            label.className = 'ingredient-item';
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = 'ingredients';
            input.value = ingredient;
            input.checked = true;
            
            const content = document.createElement('div');
            content.className = 'ingredient-content';

            const span = document.createElement('span');
            span.setAttribute('data-text-key', `${ingredient}`);
            span.textContent = ingredient.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');

            content.appendChild(span);
            label.appendChild(input);
            label.appendChild(content);
            return label;
        }

        function renderIngredients(filterText = '') {
            grid.innerHTML = '';
            
            const filteredIngredients = ingredients.filter(ing => 
                ing.toLowerCase().includes(filterText.toLowerCase())
            );
            
            filteredIngredients.forEach(ingredient => {
                grid.appendChild(createIngredientElement(ingredient));
            });
        }

        searchInput.addEventListener('input', (e) => {
            renderIngredients(e.target.value);
        });

        renderIngredients();
    }

    // Initialize ingredients when DOM is loaded
    initializeIngredients();
}); 