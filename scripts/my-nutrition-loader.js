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
        document.getElementById('bmrValue').textContent = 
            `${Math.round(this.nutritionData.bmr)} calories`;
        document.getElementById('tdeeValue').textContent = 
            `${Math.round(this.nutritionData.tdee)} calories`;
        document.getElementById('calorieAdjustment').textContent = 
            `${this.nutritionData.recommendations.calorieAdjustment > 0 ? '+' : ''}${this.nutritionData.recommendations.calorieAdjustment} calories`;
        document.getElementById('hydrationGoal').textContent = 
            `${this.nutritionData.recommendations.hydration} liters`;

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
                    <h2>Meal ${index + 1}</h2>
                    <span class="meal-time">${this.formatTime(timing)}</span>
                </div>
                ${mealData ? this.createMealContent(mealData) : ''}
            `;
            
            mealsContainer.appendChild(mealCard);
        });
    }

    createMealContent(mealData) {
        return `
            <div class="meal-content">
                <div class="meal-stats">
                    <span class="meal-calories">${mealData.totalMealCalories} cal</span>
                    <span class="meal-percentage">${mealData.mealCaloriePercentage}% of daily</span>
                </div>
                
                <div class="ingredients-section">
                    <h4>Ingredients</h4>
                    <ul class="ingredients-list">
                        ${mealData.recipe.ingredients.map(ingredient => `
                            <li>${ingredient.amountValue} ${ingredient.amountType} ${ingredient.food}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="instructions-section">
                    <h4>Instructions</h4>
                    <ol class="instructions-list">
                        ${mealData.recipe.instructions.map(instruction => {
                            const formatIngredients = (ingredients) => {
                                if (ingredients.length <= 1) return ingredients.join('');
                                return ingredients.slice(0, -1).join(', ') + ' and ' + ingredients.slice(-1);
                            };
                            
                            return `<li>${instruction.action} ${formatIngredients(instruction.subjectIngredients)} 
                                ${instruction.objectIngredients.length ? 
                                    instruction.preposition[0] + ' ' + formatIngredients(instruction.objectIngredients) : ''}</li>`;
                        }).join('')}
                    </ol>
                </div>
                
                <div class="nutrition-distribution">
                    <h4>Nutrition Distribution</h4>
                    <div class="macro-bars">
                        <div class="macro-bar">
                            <span class="macro-label">Protein</span>
                            <div class="bar-fill" style="width: ${mealData.nutritionDistribution.protein}%"></div>
                            <span class="macro-percentage">${mealData.nutritionDistribution.protein}%</span>
                        </div>
                        <div class="macro-bar">
                            <span class="macro-label">Carbs</span>
                            <div class="bar-fill" style="width: ${mealData.nutritionDistribution.carbs}%"></div>
                            <span class="macro-percentage">${mealData.nutritionDistribution.carbs}%</span>
                        </div>
                        <div class="macro-bar">
                            <span class="macro-label">Fats</span>
                            <div class="bar-fill" style="width: ${mealData.nutritionDistribution.fats}%"></div>
                            <span class="macro-percentage">${mealData.nutritionDistribution.fats}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="time-info">
                    <span class="prep-time">
                        <i class="time-icon"></i>
                        Prep: ${mealData.recipe.prepTime} min
                    </span>
                    <span class="cook-time">
                        <i class="time-icon"></i>
                        Cook: ${mealData.recipe.cookTime} min
                    </span>
                </div>
            </div>
        `;
    }
}

// Initialize and load nutrition profile
document.addEventListener('DOMContentLoaded', async () => {
    const loader = new NutritionProfileLoader();
    await loader.loadNutritionProfile();
});

function createMealCard(mealData) {
    const template = document.querySelector('.meal-card');
    const card = template.cloneNode(true);
    
    // Set meal name and stats
    card.querySelector('.meal-name').textContent = mealData.recipe.name;
    card.querySelector('.meal-calories').textContent = `${mealData.totalMealCalories} cal`;
    card.querySelector('.meal-percentage').textContent = `${mealData.mealCaloriePercentage}%`;
    
    // Populate ingredients
    const ingredientsList = card.querySelector('.ingredients-list');
    mealData.recipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = `${ingredient.amountValue} ${ingredient.amountType} ${ingredient.food}`;
        ingredientsList.appendChild(li);
    });
    
    // Populate instructions
    const instructionsList = card.querySelector('.instructions-list');
    mealData.recipe.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = `${instruction.action} ${instruction.subjectIngredients.join(', ')} ${
            instruction.objectIngredients.length ? 'to ' + instruction.objectIngredients.join(', ') : ''
        }`;
        instructionsList.appendChild(li);
    });
    
    // Set nutrition distribution
    const bars = card.querySelectorAll('.bar-fill');
    bars[0].style.width = `${mealData.nutritionDistribution.protein}%`;
    bars[1].style.width = `${mealData.nutritionDistribution.carbs}%`;
    bars[2].style.width = `${mealData.nutritionDistribution.fats}%`;
    
    // Set time information
    card.querySelector('.prep-time .time-value').textContent = `${mealData.recipe.prepTime} min`;
    card.querySelector('.cook-time .time-value').textContent = `${mealData.recipe.cookTime} min`;
    
    return card;
}