class NutritionProfileLoader {
    constructor() {
        this.nutritionData = null;
    }

    async loadNutritionProfile() {
        try {
            const token = localStorage.getItem('login-token');
            const response = await fetch(`${window.CONFIG.API_URL}/profile/nutrition`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load nutrition profile');
            }

            this.nutritionJson = await response.json();
            this.nutritionData = this.nutritionJson.nutritionProfile;
            this.updateUI();
        } catch (error) {
            console.error('Error loading nutrition profile:', error);
        }
    }

    formatTime(time) {
        // For HHMM format (e.g., 1100 for 11:00 AM, 1400 for 2:00 PM)
        const hours = Math.floor(time / 100);
        const mins = time % 100;
        
        // Convert to 12-hour format
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight
        
        return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
    }

    updateUI() {
        // Update basic stats
        const bmrElement = document.getElementById('bmrValue');
        bmrElement.setAttribute('data-text-key', 'nutrition-bmr-calories');
        bmrElement.setAttribute('data-placeholder-bmr', Math.round(this.nutritionData.bmr));

        const tdeeElement = document.getElementById('tdeeValue');
        tdeeElement.setAttribute('data-text-key', 'nutrition-tdee-calories');
        tdeeElement.setAttribute('data-placeholder-tdee', Math.round(this.nutritionData.tdee));

        const calorieAdjustment = document.getElementById('calorieAdjustment');
        calorieAdjustment.setAttribute('data-text-key', 'nutrition-calorie-adjustment');
        calorieAdjustment.setAttribute('data-placeholder-adjustment', 
            `${this.nutritionData.recommendations.calorieAdjustment > 0 ? '+' : ''}${this.nutritionData.recommendations.calorieAdjustment}`);

        const hydrationGoal = document.getElementById('hydrationGoal');
        hydrationGoal.setAttribute('data-text-key', 'nutrition-hydration-goal');
        hydrationGoal.setAttribute('data-placeholder-liters', this.nutritionData.recommendations.hydration);

        // Update macro breakdown
        const macros = this.nutritionData.recommendations.macroBreakdown;
        const proteinBar = document.querySelector('.macro-bar.protein');
        const carbsBar = document.querySelector('.macro-bar.carbs');
        const fatsBar = document.querySelector('.macro-bar.fats');

        proteinBar.style.setProperty('--width', `${macros.protein}%`);
        carbsBar.style.setProperty('--width', `${macros.carbs}%`);
        fatsBar.style.setProperty('--width', `${macros.fats}%`);

        proteinBar.querySelector('.macro-value').textContent = `${macros.protein}%`;
        carbsBar.querySelector('.macro-value').textContent = `${macros.carbs}%`;
        fatsBar.querySelector('.macro-value').textContent = `${macros.fats}%`;

        // Display meal timings and recipes
        const mealsContainer = document.querySelector('.meals-container');
        const mealTimings = this.nutritionData.recommendations.mealTimings;
        
        mealsContainer.innerHTML = ''; // Clear existing content
        
        mealTimings.forEach((timing, index) => {
            const mealData = this.nutritionData.recommendations.meals[index];
            const mealCard = document.createElement('div');
            mealCard.className = 'meal-card';
            
            mealCard.innerHTML = `
                <div class="meal-header">
                    <h2 data-text-key="meal-number" data-placeholder-meal-number="${index + 1}"></h2>
                    <span class="meal-time">${this.formatTime(timing)}</span>
                </div>
                ${mealData ? this.createMealContent(mealData) : ''}
            `;
            
            mealsContainer.appendChild(mealCard);
        });

        // Update all strings after setting data-text-key attributes
        window.stringsLoaded.then(() => {
            updatePageStrings();
        }).catch(error => {
            console.error('Error updating strings:', error);
        });
    }

    createMealContent(mealData) {
        const lang = localStorage.getItem('app-language');
        const conjunction = lang === 'en' ? 'and' : 'እና';
        const separator = lang === 'en' ? ',' : '፣ ';
        
        return `
            <div class="meal-content">
                <h3 class="meal-name">
                    <span style="display: ${lang === 'en' ? 'inline' : 'none'}">${mealData.recipe.name.en}</span>
                    <span style="display: ${lang === 'en' ? 'none' : 'inline'}">${mealData.recipe.name.am}</span>
                </h3>
                <div class="meal-stats">
                    <span class="meal-calories" data-text-key="meal-calories" 
                        data-placeholder-meal-calories="${mealData.totalMealCalories}"></span>
                    <span class="meal-percentage" data-text-key="meal-percentage" 
                        data-placeholder-meal-percentage="${mealData.mealCaloriePercentage}"></span>
                </div>
                
                <div class="ingredients-section">
                    <h4 data-text-key="ingredients-title"></h4>
                    <ul class="ingredients-list">
                        ${mealData.recipe.ingredients.map(ingredient => `
                            <li>${ingredient.amountValue} <span data-text-key="${ingredient.amountType}"></span> <span data-text-key="${ingredient.food}"></span></li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="instructions-section">
                    <h4 data-text-key="instructions-title"></h4>
                    <ol class="instructions-list">
                        ${mealData.recipe.instructions.map(instruction => 
                            this.formatInstructionStep(instruction, lang)
                        ).join('')}
                    </ol>
                </div>
                
                <div class="nutrition-distribution">
                    <h4 data-text-key="nutrition-distribution-title"></h4>
                    <div class="macro-bars">
                        <div class="macro-bar">
                            <span class="macro-label" data-text-key="macro-label-protein"></span>
                            <div class="bar-fill" style="width: ${mealData.nutritionDistribution.protein}%"></div>
                            <span class="macro-percentage">${mealData.nutritionDistribution.protein}%</span>
                        </div>
                        <div class="macro-bar">
                            <span class="macro-label" data-text-key="macro-label-carbs"></span>
                            <div class="bar-fill" style="width: ${mealData.nutritionDistribution.carbs}%"></div>
                            <span class="macro-percentage">${mealData.nutritionDistribution.carbs}%</span>
                        </div>
                        <div class="macro-bar">
                            <span class="macro-label" data-text-key="macro-label-fats"></span>
                            <div class="bar-fill" style="width: ${mealData.nutritionDistribution.fats}%"></div>
                            <span class="macro-percentage">${mealData.nutritionDistribution.fats}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="time-info">
                    <span class="prep-time">
                        <i class="time-icon"></i>
                        <span data-text-key="prep-time" data-placeholder-prep-time="${mealData.recipe.prepTime}"></span>
                    </span>
                    <span class="cook-time">
                        <i class="time-icon"></i>
                        <span data-text-key="cook-time" data-placeholder-cook-time="${mealData.recipe.cookTime}"></span>
                    </span>
                </div>
            </div>
        `;
    }

    formatInstructionStep(instruction, lang) {
        const formatIngredients = (ingredients) => {
            if (ingredients.length <= 1) {
                return `<span data-text-key="${ingredients[0]}"></span>`;
            }
            
            const lastIngredient = `<span data-text-key="${ingredients[ingredients.length - 1]}"></span>`;
            const otherIngredients = ingredients.slice(0, -1).map(ing => 
                `<span data-text-key="${ing}"></span>`
            ).join(lang === 'en' ? ', ' : '፣ ');
            
            const conjunction = lang === 'en' ? 'and' : 'እና';
            return `${otherIngredients} ${conjunction} ${lastIngredient}`;
        };

        if (lang === 'en') {
            // English: Subject-Verb-Object structure
            return `<li><span data-text-key="${instruction.action}"></span> ${formatIngredients(instruction.subjectIngredients)} 
                ${instruction.objectIngredients.length ? 
                    `<span data-text-key="${instruction.preposition[0]}"></span> ${formatIngredients(instruction.objectIngredients)}` : ''}</li>`;
        } else {
            // Amharic: Object-Preposition-Subject-Action structure
            return `<li>${instruction.objectIngredients.length ? 
                `${formatIngredients(instruction.objectIngredients)} <span data-text-key="${instruction.preposition[0]}"></span> ` : ''}
                ${formatIngredients(instruction.subjectIngredients)} 
                <span data-text-key="${instruction.action}"></span></li>`;
        }
    }
}

// Initialize and load nutrition profile
document.addEventListener('DOMContentLoaded', async () => {
    const loader = new NutritionProfileLoader();
    await loader.loadNutritionProfile();
});