document.addEventListener('DOMContentLoaded', async function() {
    let topicId = null;
    try {
        const urlParams = new URLSearchParams(window.location.search);
        topicId = urlParams.get('topic');
    } catch (error) {
        console.error('No topic id found:', error);
        showError();
    }

    if (topicId) {
        try {
            await loadLearningNavigation(topicId);
            await loadLearningContent(topicId);
        } catch (error) {
            console.error('Error loading learning content:', error);
            showError();
        }
    }

    // Update text strings after rendering
    window.stringsLoaded.then(() => {
        updatePageStrings();
    }).catch(error => {
        console.error('Error updating strings:', error);
    });
});

function showError() {
    const nutritionLearnWrapper = document.querySelector('.nutrition-learn-wrapper');
    if (nutritionLearnWrapper) {
        nutritionLearnWrapper.innerHTML = `
            <div class="error-message">
                <h2 data-text-key="nutrition-learn-error"></h2>
            </div>
        `;
    }
}

async function loadLearningNavigation(activeTopic) {
    // Load navigation data
    const response = await fetch('/nutrition/learn-categories.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const navigationData = await response.json();
    
    const learningNavigation = document.querySelector('.learning-navigation');
    if (!learningNavigation) {
        throw new Error('Learning navigation container not found');
    }

    // Clear existing content
    learningNavigation.innerHTML = '';

    // Find section with active item and get active topic
    let activeSectionKey = null;
    Object.entries(navigationData).forEach(([sectionKey, sectionData]) => {
        if (sectionData.items.some(item => item.id === activeTopic)) {
            activeSectionKey = sectionKey;
        }
    });

    // Render navigation
    Object.entries(navigationData).forEach(([sectionKey, sectionData]) => {
        const section = document.createElement('div');
        section.className = 'nav-section';
        
        const isActiveSection = sectionKey === activeSectionKey;
        
        section.innerHTML = `
            <div class="nav-section-header">
                <h3 class="nutrition-navigation-header" data-text-key="${sectionData.title}">
                    ${sectionData.title}
                </h3>
                <span class="toggle-icon">${isActiveSection ? '−' : '+'}</span>
            </div>
            <ul class="nutrition-navigation-items${isActiveSection ? ' expanded' : ''}">
                ${sectionData.items.map(item => `
                    <li>
                        <a href="/nutrition/learn?topic=${item.id}" 
                           class="nav-link${item.id === activeTopic ? ' active' : ''}"
                           data-text-key="${item.textKey}">
                            ${item.textKey}
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
        
        learningNavigation.appendChild(section);
    });

    // Add click handlers for section headers
    learningNavigation.addEventListener('click', (e) => {
        if (e.target.classList.contains('nutrition-navigation-header') || e.target.classList.contains('toggle-icon')) {
            const header = e.target.closest('.nav-section-header');
            const section = header.parentElement;
            const items = section.querySelector('.nutrition-navigation-items');
            const icon = section.querySelector('.toggle-icon');
            
            items.classList.toggle('expanded');
            icon.textContent = items.classList.contains('expanded') ? '−' : '+';
        }
    });
}

async function loadLearningContent(topicId) {
    const learningContent = document.querySelector('.learning-content');
    if (!learningContent) {
        throw new Error('Learning content container not found');
    }

    if (topicId === 'basics') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="nutrition-basics-title">Nutrition Basics</h1>
                <p data-text-key="nutrition-basics-description"><i>Learn the fundamentals of nutrition for a healthier lifestyle.</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-basics-intro-title">Introduction to Nutrition</h2>
                <ul>
                    <li><p data-text-key="nutrition-basics-intro-item-1">Nutrition is essential for reaching your fitness goals, whether you're aiming for fat loss, muscle gain, or overall health</p></li>
                    <li><p data-text-key="nutrition-basics-intro-item-2">Good nutrition fuels your body, supports muscle repair, boosts exercise performance, and enhances recovery</p></li>
                    <li><p data-text-key="nutrition-basics-intro-item-3">Without the right nutrients, your workouts will be less effective, and progress will slow down</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-energy-balance-title">Energy Balance</h2>
                <ul>
                    <li><p data-text-key="nutrition-energy-balance-item-1">Energy balance is key—eating more calories than you burn leads to weight gain</p></li>
                    <li><p data-text-key="nutrition-energy-balance-item-2">Eating fewer calories creates a caloric deficit for fat loss</p></li>
                    <li><p data-text-key="nutrition-energy-balance-item-3">Understanding your caloric needs is crucial for achieving your goals</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-macronutrients-title">Macronutrients: The Big Three</h2>
                <div class="macro-breakdown">
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-macro-percentage-carbs">45-65%</span>
                        <span class="macro-label" data-text-key="nutrition-macro-label-carbs">Carbs</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-macro-percentage-protein">20-35%</span>
                        <span class="macro-label" data-text-key="nutrition-macro-label-protein">Protein</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-macro-percentage-fats">20-35%</span>
                        <span class="macro-label" data-text-key="nutrition-macro-label-fats">Fats</span>
                    </div>
                </div>
                <ul>
                    <li><p data-text-key="nutrition-macronutrients-item-1"><b>Carbohydrates:</b> Primary energy source, especially during exercise. Complex carbs provide sustained energy</p></li>
                    <li><p data-text-key="nutrition-macronutrients-item-2"><b>Protein:</b> Essential for muscle repair, recovery, and growth. Helps preserve muscle mass during weight loss</p></li>
                    <li><p data-text-key="nutrition-macronutrients-item-3"><b>Fats:</b> Important for hormone regulation, brain function, and vitamin absorption</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-micronutrients-title">Micronutrients & Hydration</h2>
                <ul>
                    <li><p data-text-key="nutrition-micronutrients-item-1">Vitamins and minerals are vital for energy production, immune function, and overall health</p></li>
                    <li><p data-text-key="nutrition-micronutrients-item-2">Proper hydration is essential for digestion, nutrient absorption, and muscle function</p></li>
                    <li><p data-text-key="nutrition-micronutrients-item-3">Electrolytes maintain fluid balance during exercise</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-fiber-title">Fiber and Digestive Health</h2>
                <ul>
                    <li><p data-text-key="nutrition-fiber-item-1">Fiber aids in digestion, keeps you full longer, and supports heart health</p></li>
                    <li><p data-text-key="nutrition-fiber-item-2">Soluble fiber (in oats and beans) helps lower cholesterol</p></li>
                    <li><p data-text-key="nutrition-fiber-item-3">Insoluble fiber (in whole grains and vegetables) aids digestion</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-balanced-diet-title">Building a Balanced Diet</h2>
                <ul>
                    <li><p data-text-key="nutrition-balanced-diet-item-1">Focus on nutrient-dense whole foods including fruits, vegetables, and lean proteins</p></li>
                    <li><p data-text-key="nutrition-balanced-diet-item-2">Include adequate fiber for digestive health and satiety</p></li>
                    <li><p data-text-key="nutrition-balanced-diet-item-3">Balance portion sizes to support your specific goals</p></li>
                    <li><p data-text-key="nutrition-balanced-diet-item-4">Prioritize vegetables, fruits, whole grains, lean proteins, and healthy fats</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-body-effects-title">How Nutrition Affects Your Body</h2>
                <ul>
                    <li><p data-text-key="nutrition-body-effects-item-1">Supports muscle growth and recovery through protein synthesis</p></li>
                    <li><p data-text-key="nutrition-body-effects-item-2">Maintains energy levels through proper carbohydrate intake</p></li>
                    <li><p data-text-key="nutrition-body-effects-item-3">Boosts immune function through adequate vitamin and mineral intake</p></li>
                    <li><p data-text-key="nutrition-body-effects-item-4">Improves mental clarity and cognitive function</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'macros') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="macro-tracking-title">Macro Tracking</h1>
                <p data-text-key="macro-tracking-description"><i>Track your macronutrients and calories for optimal results</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-what-is-macro-tracking">What is Macro Tracking?</h2>
                <ul>
                    <li><p data-text-key="nutrition-macro-monitoring">Macro tracking involves monitoring your intake of the three main macronutrients: proteins, carbohydrates, and fats</p></li>
                    <li><p data-text-key="nutrition-structured-approach">This method provides a structured approach to nutrition while maintaining flexibility in food choices</p></li>
                    <li><p data-text-key="nutrition-food-effects">It helps you understand how different foods affect your body and goals</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-benefits-of-tracking">Benefits of Tracking Macros</h2>
                <ul>
                    <li><p data-text-key="nutrition-personalized-nutrition"><b>Personalized Nutrition:</b> Customize your diet based on your specific goals and body type</p></li>
                    <li><p data-text-key="nutrition-flexible-dieting"><b>Flexible Dieting:</b> Enjoy your favorite foods while staying within your nutritional targets</p></li>
                    <li><p data-text-key="nutrition-better-results"><b>Better Results:</b> Optimize body composition by ensuring proper nutrient ratios</p></li>
                    <li><p data-text-key="nutrition-increased-awareness"><b>Increased Awareness:</b> Learn about food composition and make informed choices</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-macro-goals">Macro Goals by Objective</h2>
                <div class="macro-breakdown">
                    <div class="macro-item">
                        <h3 data-text-key="nutrition-fat-loss">Fat Loss</h3>
                        <div class="macro-row">
                            <span class="macro-percentage" data-text-key="nutrition-fat-loss-protein">30-35%</span>
                            <span class="macro-label" data-text-key="nutrition-fat-loss-protein-label">Protein</span>
                        </div>
                        <div class="macro-row">
                            <span class="macro-percentage" data-text-key="nutrition-fat-loss-carbs">35-40%</span>
                            <span class="macro-label" data-text-key="nutrition-fat-loss-carbs-label">Carbs</span>
                        </div>
                        <div class="macro-row">
                            <span class="macro-percentage" data-text-key="nutrition-fat-loss-fats">25-30%</span>
                            <span class="macro-label" data-text-key="nutrition-fat-loss-fats-label">Fats</span>
                        </div>
                    </div>
                    <div class="macro-item">
                        <h3 data-text-key="nutrition-macro-muscle-gain-title">Muscle Gain</h3>
                        <div class="macro-row">
                            <span class="macro-percentage" data-text-key="nutrition-macro-muscle-gain-protein">25-30%</span>
                            <span class="macro-label" data-text-key="nutrition-macro-muscle-gain-protein-label">Protein</span>
                        </div>
                        <div class="macro-row">
                            <span class="macro-percentage" data-text-key="nutrition-macro-muscle-gain-carbs">45-55%</span>
                            <span class="macro-label" data-text-key="nutrition-macro-muscle-gain-carbs-label">Carbs</span>
                        </div>
                        <div class="macro-row">
                            <span class="macro-percentage" data-text-key="nutrition-macro-muscle-gain-fats">20-25%</span>
                            <span class="macro-label" data-text-key="nutrition-macro-muscle-gain-fats-label">Fats</span>
                        </div>
                    </div>
                    <div class="macro-item">
                        <h3 data-text-key="nutrition-maintenance">Maintenance</h3>
                        <div class="macro-row">
                            <span class="macro-percentage" data-text-key="nutrition-maintenance-protein">25-30%</span>
                            <span class="macro-label" data-text-key="nutrition-maintenance-protein-label">Protein</span>
                        </div>
                        <div class="macro-row">
                            <span class="macro-percentage" data-text-key="nutrition-maintenance-carbs">40-50%</span>
                            <span class="macro-label" data-text-key="nutrition-maintenance-carbs-label">Carbs</span>
                        </div>
                        <div class="macro-row">
                            <span class="macro-percentage" data-text-key="nutrition-maintenance-fats">25-30%</span>
                            <span class="macro-label" data-text-key="nutrition-maintenance-fats-label">Fats</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-how-to-track">How to Track Macros</h2>
                <ul>
                    <li><p data-text-key="nutrition-calculate-calories">Calculate your daily calorie needs based on your goal and activity level</p></li>
                    <li><p data-text-key="nutrition-determine-ratios">Determine your macro ratios based on your objective (fat loss, muscle gain, or maintenance)</p></li>
                    <li><p data-text-key="nutrition-food-tracking-app">Use a food tracking app to log your meals and monitor macro intake</p></li>
                    <li><p data-text-key="nutrition-weigh-measure">Weigh and measure portions for accuracy</p></li>
                    <li><p data-text-key="nutrition-adjust-targets">Adjust your targets based on progress and results</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-tips-for-success">Tips for Success</h2>
                <ul>
                    <li><p data-text-key="nutrition-plan-meals">Plan meals in advance to hit your macro targets</p></li>
                    <li><p data-text-key="nutrition-read-labels">Learn to read nutrition labels accurately</p></li>
                    <li><p data-text-key="nutrition-focus-whole-foods">Focus on whole, nutrient-dense foods</p></li>
                    <li><p data-text-key="nutrition-be-flexible">Be consistent but flexible - occasional variations won't derail your progress</p></li>
                    <li><p data-text-key="nutrition-track-progress">Track progress through measurements and photos, not just the scale</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-common-tools">Common Tracking Tools</h2>
                <ul>
                    <li><p data-text-key="nutrition-tena-prime">TenaPrime: Built-in nutrition tracking to monitor your daily intake and progress</p></li>
                    <li><p data-text-key="nutrition-food-scale">Digital Food Scale: Essential for accurate portion measurement and macro calculations</p></li>
                    <li><p data-text-key="nutrition-measuring-cups">Measuring Cups & Spoons: Helpful for portion control and recipe measurements</p></li>
                    <li><p data-text-key="nutrition-food-journal">Food Journal: Track meals, portions, and timing in a notebook or digital format</p></li>
                    <li><p data-text-key="nutrition-calculator">Nutrition Calculator: Use online tools to determine your daily macro needs</p></li>
                    <li><p data-text-key="nutrition-progress-journal">Progress Journal: Record measurements, photos, and energy levels to track results</p></li>
                    <li><p data-text-key="nutrition-meal-template">Meal Planning Template: Plan your meals in advance to hit macro targets</p></li>
                    <li><p data-text-key="nutrition-database-reference">Food Database Reference: Keep a list of common foods and their macro content</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'meal-prep') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="meal-prep-title">Meal Preparation</h1>
                <p data-text-key="meal-prep-description"><i>Tips and strategies for efficient meal planning and prep.</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-what-is-meal-prep">What is Meal Prep?</h2>
                <ul>
                    <li><p data-text-key="nutrition-meal-prep-planning">Meal prep involves planning, cooking, and portioning meals in advance</p></li>
                    <li><p data-text-key="nutrition-strategic-approach">It's a strategic approach to ensure you have healthy, balanced meals ready when needed</p></li>
                    <li><p data-text-key="nutrition-consistent-habits">Helps maintain consistent nutrition habits and supports fitness goals</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-key-benefits">Key Benefits</h2>
                <ul>
                    <li><p data-text-key="nutrition-time-efficiency"><b>Time Efficiency:</b> Save hours during the week by batch cooking</p></li>
                    <li><p data-text-key="nutrition-better-nutrition"><b>Better Nutrition:</b> Control portions and ingredients for optimal results</p></li>
                    <li><p data-text-key="nutrition-cost-savings"><b>Cost Savings:</b> Reduce food waste and expensive takeout meals</p></li>
                    <li><p data-text-key="nutrition-goal-achievement"><b>Goal Achievement:</b> Stay on track with your nutrition targets</p></li>
                    <li><p data-text-key="nutrition-stress-reduction"><b>Stress Reduction:</b> Eliminate daily decisions about what to eat</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-getting-started">Getting Started</h2>
                <ul>
                    <li><p data-text-key="nutrition-choose-prep-day"><b>Choose Your Prep Day:</b> Pick a consistent day for weekly meal preparation</p></li>
                    <li><p data-text-key="nutrition-plan-menu"><b>Plan Your Menu:</b> Select recipes that align with your goals</p></li>
                    <li><p data-text-key="nutrition-create-shopping-list"><b>Create a Shopping List:</b> Buy ingredients in bulk when possible</p></li>
                    <li><p data-text-key="nutrition-quality-containers"><b>Invest in Quality Containers:</b> Get proper storage containers for portioning</p></li>
                    <li><p data-text-key="nutrition-start-small"><b>Start Small:</b> Begin with 2-3 days of meals and gradually increase</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-essential-equipment">Essential Equipment</h2>
                <ul>
                    <li><p data-text-key="nutrition-storage-containers"><b>Storage Containers:</b> BPA-free containers in various sizes</p></li>
                    <li><p data-text-key="nutrition-kitchen-scale"><b>Kitchen Scale:</b> For accurate portion control</p></li>
                    <li><p data-text-key="nutrition-meal-prep-bags"><b>Meal Prep Bags:</b> For transporting meals</p></li>
                    <li><p data-text-key="nutrition-large-sheet-pans"><b>Large Sheet Pans:</b> For batch cooking vegetables</p></li>
                    <li><p data-text-key="nutrition-food-processor"><b>Food Processor:</b> For quick vegetable prep</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-smart-prep-strategies">Smart Prep Strategies</h2>
                <ul>
                    <li><p data-text-key="nutrition-batch-cook-proteins"><b>Batch Cook Proteins:</b> Prepare multiple portions of chicken, fish, or legumes</p></li>
                    <li><p data-text-key="nutrition-roast-vegetables"><b>Roast Vegetables:</b> Cook large batches of mixed vegetables for sides</p></li>
                    <li><p data-text-key="nutrition-prepare-base-carbs"><b>Prepare Base Carbs:</b> Cook rice, quinoa, or sweet potatoes in bulk</p></li>
                    <li><p data-text-key="nutrition-pre-portion-snacks"><b>Pre-portion Snacks:</b> Divide nuts, fruits, and vegetables into grab-and-go portions</p></li>
                    <li><p data-text-key="nutrition-make-breakfast-easy"><b>Make Breakfast Easy:</b> Prepare overnight oats or egg muffins in advance</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-food-safety-tips">Food Safety Tips</h2>
                <ul>
                    <li><p data-text-key="nutrition-store-meals-properly">Store meals properly in airtight containers</p></li>
                    <li><p data-text-key="nutrition-keep-meals-refrigerated">Keep cooked meals refrigerated and consume within 3-4 days</p></li>
                    <li><p data-text-key="nutrition-label-containers">Label containers with preparation dates</p></li>
                    <li><p data-text-key="nutrition-use-freezer-storage">Use freezer storage for longer-term meal storage</p></li>
                    <li><p data-text-key="nutrition-reheat-foods-properly">Reheat foods to proper temperature before consuming</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-sample-meal-plan">Sample Meal Prep Plan</h2>
                <ul>
                    <li><p data-text-key="nutrition-breakfast"><b>Breakfast:</b> Overnight oats with protein powder and berries</p></li>
                    <li><p data-text-key="nutrition-lunch"><b>Lunch:</b> Grilled chicken, quinoa, and roasted vegetables</p></li>
                    <li><p data-text-key="nutrition-snacks"><b>Snacks:</b> Greek yogurt parfait or protein energy balls</p></li>
                    <li><p data-text-key="nutrition-dinner"><b>Dinner:</b> Baked salmon with sweet potato and steamed broccoli</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-final-thoughts">Final Thoughts</h2>
                <ul>
                    <li><p data-text-key="nutrition-invest-in-health">Meal prep is an investment in your health and fitness journey</p></li>
                    <li><p data-text-key="nutrition-start-small-habits">Start small and build consistent habits over time</p></li>
                    <li><p data-text-key="nutrition-progress-over-perfection">Remember that perfection isn't the goal - progress is what matters</p></li>
                    <li><p data-text-key="nutrition-adjust-strategy">Adjust your meal prep strategy as your needs and schedule change</p></li>
                    <li><p data-text-key="nutrition-time-investment">The time you spend preparing meals is time invested in reaching your fitness goals</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'carbs') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="carbs-title">Carbohydrates</h1>
                <p data-text-key="carbs-description"><i>Your Body's Primary Fuel</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-function">Function</h2>
                <ul>
                    <li><p data-text-key="nutrition-carbs-energy-source">Carbs are the body's preferred source of energy, especially during exercise</p></li>
                    <li><p data-text-key="nutrition-carbs-glucose">They are broken down into glucose, which fuels your muscles and brain</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-types-of-carbs">Types of Carbs</h2>
                <ul>
                    <li><p data-text-key="nutrition-simple-carbs"><b>Simple Carbs:</b> Found in foods like fruits, honey, and sugary snacks, these provide quick energy but can lead to blood sugar spikes</p></li>
                    <li><p data-text-key="nutrition-complex-carbs"><b>Complex Carbs:</b> Found in whole grains (like oats, quinoa, and brown rice), legumes, and vegetables, these provide sustained energy and are packed with fiber</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-how-much-to-consume">How Much to Consume</h2>
                <ul>
                    <li><p data-text-key="nutrition-carbs-general-health-fitness"><b>For General Health & Fitness:</b> Aim for 45-65% of your total daily calories from carbs</p></li>
                    <li><p data-text-key="nutrition-carbs-active-individuals"><b>For Active Individuals:</b> If you're highly active, carbs should make up 50-70% of your daily intake</p></li>
                    <li><p data-text-key="nutrition-carbs-fat-loss"><b>For Fat Loss:</b> Carbs should make up around 40-50% of your intake, focusing on whole, fiber-rich carbs</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-best-sources">Best Sources</h2>
                <ul>
                    <li><p data-text-key="nutrition-whole-grains">Whole grains (oats, quinoa, brown rice)</p></li>
                    <li><p data-text-key="nutrition-vegetables">Vegetables (sweet potatoes, leafy greens)</p></li>
                    <li><p data-text-key="nutrition-fruits">Fruits (apples, berries, bananas)</p></li>
                    <li><p data-text-key="nutrition-beans-legumes">Beans and legumes (lentils, chickpeas)</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'protein') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="protein-title">Proteins</h1>
                <p data-text-key="protein-description"><i>The Building Blocks of Muscle</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-function">Function</h2>
                <ul>
                    <li><p data-text-key="nutrition-repair-muscle">Protein is essential for repairing and building muscle tissue</p></li>
                    <li><p data-text-key="nutrition-post-workout-protein">After a workout, your muscles need protein to recover and grow stronger</p></li>
                    <li><p data-text-key="nutrition-immune-support">Protein also supports immune function and the production of enzymes and hormones</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-how-much-to-consume">How Much to Consume</h2>
                <ul>
                    <li><p data-text-key="nutrition-protein-general-health"><b>For General Health:</b> Aim for 10-35% of your total daily calories from protein</p></li>
                    <li><p data-text-key="nutrition-protein-muscle-gain"><b>For Muscle Gain or Strength Training:</b> Consume about 1.2 to 2.2 grams of protein per kilogram of body weight</p></li>
                    <li><p data-text-key="nutrition-protein-fat-loss"><b>For Fat Loss:</b> Higher protein intake (1.6-2.2 g/kg) can help preserve lean muscle mass while losing fat</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-best-sources">Best Sources</h2>
                <ul>
                    <li><p data-text-key="nutrition-lean-meats">Lean meats (chicken, turkey, fish)</p></li>
                    <li><p data-text-key="nutrition-eggs-dairy">Eggs and dairy products</p></li>
                    <li><p data-text-key="nutrition-plant-based">Plant-based options (tofu, legumes)</p></li>
                    <li><p data-text-key="nutrition-protein-grains">Protein-rich grains like quinoa</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-timing-protein">Timing Your Protein Intake</h2>
                <ul>
                    <li><p data-text-key="nutrition-spread-protein">Spread protein intake throughout the day for optimal absorption</p></li>
                    <li><p data-text-key="nutrition-post-exercise-protein">Consume protein within 2 hours after exercise for better recovery</p></li>
                    <li><p data-text-key="nutrition-protein-each-meal">Include a protein source with each meal to maintain muscle mass</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'fats') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="fats-title">Fats</h1>
                <p data-text-key="fats-description"><i>Essential for Hormones and Energy</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-function">Function</h2>
                <ul>
                    <li><p data-text-key="nutrition-hormone-production">Fats are crucial for hormone production (including fat-burning hormones like leptin)</p></li>
                    <li><p data-text-key="nutrition-brain-function">Essential for brain function and the absorption of fat-soluble vitamins (A, D, E, K)</p></li>
                    <li><p data-text-key="nutrition-long-lasting-energy">Provide long-lasting energy, especially during low-intensity or endurance activities</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-types-of-fats">Types of Fats</h2>
                <ul>
                    <li><p data-text-key="nutrition-unsaturated-fats"><b>Unsaturated Fats:</b> Healthy fats found in olive oil, avocados, nuts, seeds, and fatty fish. These fats reduce inflammation and support heart health</p></li>
                    <li><p data-text-key="nutrition-saturated-fats"><b>Saturated Fats:</b> Found in animal products like meat, butter, and cheese. While they're necessary in moderation, excessive saturated fat intake can negatively impact heart health</p></li>
                    <li><p data-text-key="nutrition-trans-fats"><b>Trans Fats:</b> Artificial fats found in processed foods and should be avoided as they are harmful to your health</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-how-much-to-consume">How Much to Consume</h2>
                <ul>
                    <li><p data-text-key="nutrition-fats-general-health"><b>For General Health:</b> Aim for 20-35% of your total daily calories from fats, focusing on unsaturated fats</p></li>
                    <li><p data-text-key="nutrition-fats-fat-loss"><b>For Fat Loss:</b> Keep fat intake moderate (20-30% of total calories), ensuring the majority comes from healthy sources</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-best-sources">Best Sources</h2>
                <ul>
                    <li><p data-text-key="nutrition-olive-coconut-oil">Olive oil and coconut oil</p></li>
                    <li><p data-text-key="nutrition-nuts-seeds">Nuts and seeds</p></li>
                    <li><p data-text-key="nutrition-fatty-fish">Fatty fish (salmon, mackerel)</p></li>
                    <li><p data-text-key="nutrition-avocados">Avocados</p></li>
                    <li><p data-text-key="nutrition-eggs-fat-dairy">Eggs and full-fat dairy (in moderation)</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'vitamins') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="vitamins-title">Vitamins</h1>
                <p data-text-key="vitamins-description"><i>Your Body's Guardians</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-overview">Overview</h2>
                <ul>
                    <li><p data-text-key="nutrition-vitamin-functions">Vitamins help your body function properly, support immune health, promote energy production, and assist in muscle recovery</p></li>
                    <li><p data-text-key="nutrition-vitamin-categories">They are divided into two categories: fat-soluble and water-soluble</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-fat-soluble-vitamins">Fat-Soluble Vitamins (A, D, E, K)</h2>
                <ul>
                    <li><p data-text-key="nutrition-vitamin-a"><b>Vitamin A:</b> Supports vision, skin health, and immune function. Found in carrots, sweet potatoes, and leafy greens</p></li>
                    <li><p data-text-key="nutrition-vitamin-d"><b>Vitamin D:</b> Essential for bone health, immune support, and muscle function. Get it from sunlight, fatty fish, and fortified dairy products</p></li>
                    <li><p data-text-key="nutrition-vitamin-e"><b>Vitamin E:</b> A powerful antioxidant that helps protect cells from damage. Found in nuts, seeds, and leafy greens</p></li>
                    <li><p data-text-key="nutrition-vitamin-k"><b>Vitamin K:</b> Important for blood clotting and bone health. Found in leafy greens, broccoli, and cabbage</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-water-soluble-vitamins">Water-Soluble Vitamins</h2>
                <ul>
                    <li><p data-text-key="nutrition-vitamin-c"><b>Vitamin C:</b> Boosts the immune system, supports skin health, and aids in wound healing. Found in citrus fruits, bell peppers, and strawberries</p></li>
                    <li><p data-text-key="nutrition-b-vitamins"><b>B Vitamins:</b> Vital for energy production, brain function, and red blood cell formation</p></li>
                    <li><p data-text-key="nutrition-b1-thiamine"><b>B1 (Thiamine):</b> Helps convert food into energy</p></li>
                    <li><p data-text-key="nutrition-b2-riboflavin"><b>B2 (Riboflavin):</b> Important for growth and red blood cell production</p></li>
                    <li><p data-text-key="nutrition-b3-niacin"><b>B3 (Niacin):</b> Supports metabolism and skin health</p></li>
                    <li><p data-text-key="nutrition-b6-pyridoxine"><b>B6 (Pyridoxine):</b> Crucial for brain health and immune function</p></li>
                    <li><p data-text-key="nutrition-b12"><b>B12:</b> Key for nerve function and red blood cell formation, found mainly in animal products</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-how-much-to-consume">How Much to Consume</h2>
                <ul>
                    <li><p data-text-key="nutrition-small-amounts">Vitamins are typically consumed in small amounts</p></li>
                    <li><p data-text-key="nutrition-balanced-diet-eat">Eat a balanced diet rich in fruits, vegetables, and whole grains to meet your needs</p></li>
                    <li><p data-text-key="nutrition-health-conditions">Those with specific health conditions or dietary restrictions may need extra attention to certain vitamins</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-common-deficiencies">Common Vitamin Deficiencies</h2>
                <ul>
                    <li><p data-text-key="nutrition-vitamin-d-deficiency"><b>Vitamin D:</b> Can lead to weak bones and muscle weakness. Essential for immunity and mood regulation</p></li>
                    <li><p data-text-key="nutrition-vitamin-c-deficiency"><b>Vitamin C:</b> Can cause weakened immunity, slow wound healing, and skin problems</p></li>
                    <li><p data-text-key="nutrition-vitamin-b12-deficiency"><b>Vitamin B12:</b> Can result in fatigue, weakness, and neurological issues</p></li>
                    <li><p data-text-key="nutrition-vitamin-a-deficiency"><b>Vitamin A:</b> May cause night blindness and weakened immune system</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'minerals') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="minerals-title">Minerals</h1>
                <p data-text-key="minerals-description"><i>Supporting Key Functions</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-overview">Overview</h2>
                <ul>
                    <li><p data-text-key="nutrition-mineral-functions">Minerals are vital for maintaining a wide range of bodily functions, including bone health, muscle function, and hydration</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-essential-minerals">Essential Minerals</h2>
                <ul>
                    <li><p data-text-key="nutrition-minerals-calcium"><b>Calcium:</b> Essential for strong bones and teeth, muscle function, and nerve signaling. Found in dairy products, leafy greens, and fortified plant-based milk</p></li>
                    <li><p data-text-key="nutrition-minerals-iron"><b>Iron:</b> Important for transporting oxygen in the blood. Found in lean meats, beans, spinach, and fortified cereals</p></li>
                    <li><p data-text-key="nutrition-minerals-magnesium"><b>Magnesium:</b> Supports muscle function, energy production, and bone health. Found in nuts, seeds, whole grains, and leafy vegetables</p></li>
                    <li><p data-text-key="nutrition-minerals-potassium"><b>Potassium:</b> Regulates fluid balance, muscle contractions, and heart function. Found in bananas, potatoes, spinach, and beans</p></li>
                    <li><p data-text-key="nutrition-minerals-zinc"><b>Zinc:</b> Crucial for immune function, protein synthesis, and wound healing. Found in meat, shellfish, legumes, and seeds</p></li>
                    <li><p data-text-key="nutrition-minerals-sodium"><b>Sodium:</b> Helps maintain fluid balance and nerve function. Found in salt, processed foods, and certain snacks (use in moderation)</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-how-much-to-consume">How Much to Consume</h2>
                <ul>
                    <li><p data-text-key="nutrition-varied-diet">Mineral requirements vary, but most people can meet their needs by eating a varied diet</p></li>
                    <li><p data-text-key="nutrition-balanced-diet">Include plenty of vegetables, fruits, whole grains, and protein-rich foods</p></li>
                    <li><p data-text-key="nutrition-calcium-importance">Calcium is especially important for those over 30 to maintain bone density</p></li>
                    <li><p data-text-key="nutrition-iron-essential">Iron is essential for individuals who are menstruating or pregnant</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-common-mineral-deficiencies">Common Mineral Deficiencies</h2>
                <ul>
                    <li><p data-text-key="nutrition-iron-deficiency"><b>Iron:</b> Can cause fatigue, decreased endurance, and weakness</p></li>
                    <li><p data-text-key="nutrition-magnesium-deficiency"><b>Magnesium:</b> Low levels can lead to muscle cramps, fatigue, and difficulty sleeping</p></li>
                    <li><p data-text-key="nutrition-calcium-deficiency"><b>Calcium:</b> Deficiency can lead to weak bones and increased risk of fractures</p></li>
                    <li><p data-text-key="nutrition-zinc-deficiency"><b>Zinc:</b> Can result in weakened immune system and slow wound healing</p></li>
                    <li><p data-text-key="nutrition-potassium-deficiency"><b>Potassium:</b> Low levels may cause muscle weakness, irregular heartbeat, and fatigue</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-tips-for-mineral-intake">Tips for Optimal Mineral Intake</h2>
                <ul>
                    <li><p data-text-key="nutrition-diverse-intake">Eat a rainbow of fruits and vegetables to ensure diverse mineral intake</p></li>
                    <li><p data-text-key="nutrition-consider-supplementation">Consider supplementation if you follow a restricted diet</p></li>
                    <li><p data-text-key="nutrition-enhance-iron-absorption">Pair iron-rich foods with vitamin C to enhance absorption</p></li>
                    <li><p data-text-key="nutrition-moderate-sodium">Be mindful of excessive sodium intake, which can affect other mineral balance</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'hydration') {
            learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="micro-hydration-title">Hydration</h1>
                <p data-text-key="micro-hydration-description"><i>Vital for Performance and Recovery</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-overview">Overview</h2>
                <ul>
                    <li><p data-text-key="nutrition-proper-hydration">Proper hydration is vital for maintaining energy, supporting exercise performance, and aiding recovery</p></li>
                    <li><p data-text-key="nutrition-water-functions">Water is involved in nearly every bodily function, from nutrient transport and temperature regulation to joint lubrication</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-why-hydration-matters">Why Hydration Matters</h2>
                <ul>
                    <li><p data-text-key="nutrition-regulating-temperature"><b>Regulating body temperature:</b> Helps cool the body during exercise</p></li>
                    <li><p data-text-key="nutrition-joint-health"><b>Joint health:</b> Keeps joints lubricated and reduces injury risk</p></li>
                    <li><p data-text-key="nutrition-nutrient-absorption"><b>Nutrient absorption:</b> Supports digestion and nutrient transport</p></li>
                    <li><p data-text-key="nutrition-muscle-function"><b>Muscle function:</b> Prevents cramps and supports muscle contractions</p></li>
                    <li><p data-text-key="nutrition-detoxification"><b>Detoxification:</b> Helps remove waste through urine and sweat</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-water-intake">How Much Water Do You Need?</h2>
                <ul>
                    <li><p data-text-key="nutrition-hydration-general-health-intake"><b>For General Health:</b> Women need about 2.7 liters of water per day, and men need about 3.7 liters</p></li>
                    <li><p data-text-key="nutrition-hydration-active-individuals-intake"><b>For Active Individuals:</b> Aim to drink an additional 500–700 ml per hour of moderate exercise</p></li>
                    <li><p data-text-key="nutrition-hydration-hot-climates-intake"><b>In Hot Climates:</b> You may need more fluids in hot conditions to prevent dehydration</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-signs-of-dehydration">Signs of Dehydration</h2>
                <ul>
                    <li><p data-text-key="nutrition-dehydration-fatigue">Fatigue, dizziness, or lightheadedness</p></li>
                    <li><p data-text-key="nutrition-dehydration-dry-mouth">Dry mouth and dark yellow urine</p></li>
                    <li><p data-text-key="nutrition-dehydration-muscle-cramps">Muscle cramps and headaches</p></li>
                    <li><p data-text-key="nutrition-dehydration-slow-recovery">Slower recovery post-exercise</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-hydrating-during-exercise">Hydrating During Exercise</h2>
                <ul>
                    <li><p data-text-key="nutrition-before-exercise"><b>Before Exercise:</b> Drink about 500–600 ml of water 1-2 hours before exercise</p></li>
                    <li><p data-text-key="nutrition-during-exercise"><b>During Exercise:</b> Drink about 200–300 ml every 15-20 minutes during moderate-intensity exercise</p></li>
                    <li><p data-text-key="nutrition-after-exercise"><b>After Exercise:</b> Rehydrate with 500–700 ml of water for every 0.5 kg of body weight lost during exercise</p></li>
                    <li><p data-text-key="nutrition-long-workouts">For long or intense workouts (over 1 hour), consider sports drinks to replace lost electrolytes</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-electrolytes-and-hydration">Electrolytes and Hydration</h2>
                <ul>
                    <li><p data-text-key="nutrition-electrolyte-functions">Electrolytes help maintain fluid balance and muscle function</p></li>
                    <li><p data-text-key="nutrition-sodium"><b>Sodium:</b> Found in sports drinks, salty snacks, and processed foods</p></li>
                    <li><p data-text-key="nutrition-potassium"><b>Potassium:</b> Found in bananas, oranges, potatoes, and spinach</p></li>
                    <li><p data-text-key="nutrition-magnesium"><b>Magnesium:</b> Found in nuts, seeds, leafy greens, and whole grains</p></li>
                    <li><p data-text-key="nutrition-electrolyte-drinks">For most workouts, water is sufficient, but for prolonged or intense activity, electrolyte drinks or supplements can help</p></li>
                </ul>
            </div>
            `;
    } else if (topicId === 'weight-loss') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="weight-loss-meal-plan-title">Weight Loss Meal Plan</h1>
                <p data-text-key="weight-loss-meal-plan-description"><i>Customized meal plans designed for healthy and sustainable weight loss.</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-caloric-deficit">Creating a Caloric Deficit</h2>
                <ul>
                    <li><p data-text-key="nutrition-consume-less-calories">Consume fewer calories than you burn to promote fat loss</p></li>
                    <li><p data-text-key="nutrition-calculate-tdee">Use tools to calculate your Total Daily Energy Expenditure (TDEE) and aim for a 500-750 kcal deficit</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-importance-of-protein">Importance of Protein</h2>
                <ul>
                    <li><p data-text-key="nutrition-preserve-muscle-mass">High-protein intake helps preserve muscle mass while losing fat</p></li>
                    <li><p data-text-key="nutrition-protein-intake">Aim for 1.6–2.2 grams of protein per kg of body weight</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-macronutrient-breakdown">Recommended Macronutrient Breakdown</h2>
                <div class="macro-breakdown">
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-protein-percentage-30-40">30-40%</span>
                        <span class="macro-label" data-text-key="nutrition-protein-label">Protein</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-carbs-percentage-30-40">30-40%</span>
                        <span class="macro-label" data-text-key="nutrition-carbs-label">Carbs</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-fats-percentage-20-30">20-30%</span>
                        <span class="macro-label" data-text-key="nutrition-fats-label">Fats</span>
                    </div>
                </div>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-meal-timing-frequency">Meal Timing and Frequency</h2>
                <ul>
                    <li><p data-text-key="nutrition-meal-options">Options include traditional meals (3-5/day) or intermittent fasting (e.g., 16:8 schedule)</p></li>
                    <li><p data-text-key="nutrition-nutrient-dense-foods">Focus on nutrient-dense, high-satiety foods to control hunger</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'muscle-gain') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="muscle-gain-meal-plan-title">Muscle Gain Meal Plan</h1>
                <p data-text-key="muscle-gain-meal-plan-description"><i>Nutrient-rich meal plans to support muscle growth and recovery.</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-calorie-surplus">Creating a Calorie Surplus</h2>
                <ul>
                    <li><p data-text-key="nutrition-calorie-surplus-intake">Consume 200-500 kcal above TDEE to fuel muscle growth</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-importance-of-protein">Importance of Protein</h2>
                <ul>
                    <li><p data-text-key="nutrition-protein-muscle-repair">Protein supports muscle repair and synthesis</p></li>
                    <li><p data-text-key="nutrition-protein-intake-muscle-gain">Aim for 1.8–2.5 grams of protein per kg of body weight</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-macronutrient-split">Macronutrient Split</h2>
                <div class="macro-breakdown">
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-protein-percentage-25-30">25-30%</span>
                        <span class="macro-label" data-text-key="nutrition-protein-label">Protein</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-carbs-percentage-40-50">40-50%</span>
                        <span class="macro-label" data-text-key="nutrition-carbs-label">Carbs</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-fats-percentage-20-30">20-30%</span>
                        <span class="macro-label" data-text-key="nutrition-fats-label">Fats</span>
                    </div>
                </div>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-pre-post-workout-nutrition">Pre and Post-Workout Nutrition</h2>
                <ul>
                    <li><p data-text-key="nutrition-pre-workout"><b>Pre-workout:</b> Carbs and protein for energy (e.g., a banana and whey protein)</p></li>
                    <li><p data-text-key="nutrition-post-workout"><b>Post-workout:</b> Protein-rich meal within 1-2 hours for recovery (e.g., chicken and rice)</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'maintenance') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="maintenance-meal-plan-title">Maintenance Meal Plan</h1>
                <p data-text-key="maintenance-meal-plan-description"><i>Balanced meal plans to maintain your current weight and health.</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-balancing-macronutrients">Balancing Macronutrients</h2>
                <ul>
                    <li><p data-text-key="nutrition-moderate-intake">Maintain a moderate intake of protein, carbs, and fats to support energy and health</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-focus-on-nutrient-dense-foods">Focus on Whole, Nutrient-Dense Foods</h2>
                <ul>
                    <li><p data-text-key="nutrition-prioritize-foods">Prioritize vegetables, fruits, whole grains, lean proteins, and healthy fats</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-eating-intuitively">Eating Intuitively</h2>
                <ul>
                    <li><p data-text-key="nutrition-hunger-fullness-cues">Listen to your body's hunger and fullness cues</p></li>
                    <li><p data-text-key="nutrition-avoid-restrictions">Avoid restrictive eating patterns; aim for sustainable habits</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'endurance') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="endurance-meal-plan-title">Endurance & Performance Enhancement</h1>
                <p data-text-key="endurance-meal-plan-description"><i>Optimized nutrition for endurance athletes and performance enhancement.</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-focus-on-carbohydrates">Focus on Carbohydrates</h2>
                <ul>
                    <li><p data-text-key="nutrition-carbs-primary-fuel">Carbs are the primary fuel source for endurance activities</p></li>
                    <li><p data-text-key="nutrition-carbs-intake">Consume 5-10 grams of carbs per kg of body weight based on activity level</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-pre-post-workout-importance">Importance of Pre- and Post-Workout Nutrition</h2>
                <ul>
                    <li><p data-text-key="nutrition-pre-workout-carb-meal"><b>Pre-workout:</b> Carb-heavy meal 2-3 hours before (e.g., oatmeal with fruit)</p></li>
                    <li><p data-text-key="nutrition-post-workout-recovery"><b>Post-workout:</b> Replenish glycogen with carbs and repair muscles with protein</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-optimal-hydration-strategies">Optimal Hydration Strategies</h2>
                <ul>
                    <li><p data-text-key="nutrition-consistent-hydration">Drink water consistently throughout the day</p></li>
                    <li><p data-text-key="nutrition-electrolytes-for-endurance">For prolonged activities (>60 minutes), include electrolytes</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'recomp') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="recomp-meal-plan-title">Body Recomposition</h1>
                <p data-text-key="recomp-meal-plan-description"><i>Strategic nutrition for simultaneous fat loss and muscle gain.</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-losing-fat-gaining-muscle">Simultaneously Losing Fat and Gaining Muscle</h2>
                <ul>
                    <li><p data-text-key="nutrition-caloric-deficit-protein">Maintain a slight caloric deficit while consuming high protein</p></li>
                    <li><p data-text-key="nutrition-strength-training">Engage in strength training to promote muscle growth</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-importance-of-protein">Importance of Protein</h2>
                <ul>
                    <li><p data-text-key="nutrition-protein-target">Target 2.0–2.4 grams of protein per kg of body weight</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-adjusting-macronutrient-split">Adjusting Macronutrient Split</h2>
                <div class="macro-breakdown">
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-protein-percentage-30-40">30-40%</span>
                        <span class="macro-label" data-text-key="nutrition-protein-label">Protein</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-carbs-percentage-30-40">30-40%</span>
                        <span class="macro-label" data-text-key="nutrition-carbs-label">Carbs</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-percentage" data-text-key="nutrition-fats-percentage-20-30">20-30%</span>
                        <span class="macro-label" data-text-key="nutrition-fats-label">Fats</span>
                    </div>
                </div>
                <ul>
                    <li><p data-text-key="nutrition-adjust-carbs">Adjust carbs based on energy expenditure and performance</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'plant-based') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="plant-based-diet-title">Plant-Based Diets</h1>
                <p data-text-key="plant-based-diet-description"><i>Nutritious plant-focused meals rich in proteins and essential nutrients.</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-overview">Overview</h2>
                <ul>
                    <li><p data-text-key="nutrition-plant-foods-focus">Plant-based diets focus on foods derived from plants, such as vegetables, fruits, grains, legumes, nuts, and seeds</p></li>
                    <li><p data-text-key="nutrition-vegetarian-definition">Vegetarian: Excludes meat, poultry, and fish, but may include dairy and eggs</p></li>
                    <li><p data-text-key="nutrition-vegan-definition">Vegan: Excludes all animal products, including meat, dairy, eggs, and honey</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-benefits">Benefits</h2>
                <ul>
                    <li><p data-text-key="nutrition-rich-in-nutrients">Rich in fiber, vitamins, and minerals</p></li>
                    <li><p data-text-key="nutrition-lower-disease-risk">Lower risk of chronic diseases such as heart disease, type 2 diabetes, and certain cancers</p></li>
                    <li><p data-text-key="nutrition-ethical-environmental-support">Supports ethical and environmental beliefs regarding animal welfare and sustainability</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-key-considerations">Key Considerations</h2>
                <ul>
                    <li><p data-text-key="nutrition-adequate-intake">Ensure adequate intake of protein, vitamin B12, iron, calcium, and omega-3 fatty acids</p></li>
                    <li><p data-text-key="nutrition-fortified-foods">Consider fortified foods or supplements for nutrients like vitamin B12 and vitamin D</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'low-carb') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="low-carb-diet-title">Low-Carb Diets</h1>
                <p data-text-key="low-carb-diet-description"><i>Reduced carbohydrate meals for weight management and metabolic health.</i></p>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-overview">Overview</h2>
                <ul>
                    <li><p data-text-key="nutrition-low-carb-focus">Low-carb diets focus on reducing carbohydrate intake and increasing protein and fat consumption</p></li>
                    <li><p data-text-key="nutrition-keto-diet"><b>Keto:</b> A very low-carb, high-fat, moderate-protein diet that aims to put the body into ketosis</p></li>
                    <li><p data-text-key="nutrition-atkins-diet"><b>Atkins:</b> A lower-carb diet that phases out carbs gradually over time</p></li>
                    <li><p data-text-key="nutrition-paleo-diet"><b>Paleo:</b> Emphasizes whole, unprocessed foods and excludes grains, legumes, dairy, and processed foods</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-benefits">Benefits</h2>
                <ul>
                    <li><p data-text-key="nutrition-weight-loss-improvement">Can lead to weight loss, improved insulin sensitivity, and better blood sugar control</p></li>
                    <li><p data-text-key="nutrition-cholesterol-improvement">May improve cholesterol levels and reduce the risk of metabolic syndrome</p></li>
                    <li><p data-text-key="nutrition-keto-benefits">Keto can enhance fat burning and is sometimes used to improve mental focus and energy</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-key-considerations">Key Considerations</h2>
                <ul>
                    <li><p data-text-key="nutrition-keto-side-effects">May cause initial side effects like fatigue, dizziness, and "keto flu"</p></li>
                    <li><p data-text-key="nutrition-sustainability">Long-term sustainability and nutrient balance should be considered</p></li>
                    <li><p data-text-key="nutrition-carb-restriction">Restricting carbs can limit fiber and certain nutrients like potassium and magnesium</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'mediterranean') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="mediterranean-diet-title">Mediterranean Diet</h1>
                <p data-text-key="mediterranean-diet-description"><i>Heart-healthy eating pattern inspired by Mediterranean cuisine.</i></p>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-overview">Overview</h2>
                <ul>
                    <li><p data-text-key="nutrition-whole-foods-focus">Emphasizes whole foods, healthy fats, lean proteins, and plenty of fruits and vegetables</p></li>
                    <li><p data-text-key="nutrition-olive-oil">Olive oil as the primary fat source</p></li>
                    <li><p data-text-key="nutrition-fish-seafood">Fish and seafood as the main animal protein</p></li>
                    <li><p data-text-key="nutrition-plant-based-foods">Whole grains, legumes, nuts, seeds, and plenty of fresh vegetables</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-benefits">Benefits</h2>
                <ul>
                    <li><p data-text-key="nutrition-heart-health">Promotes heart health by reducing the risk of cardiovascular diseases</p></li>
                    <li><p data-text-key="nutrition-antioxidants">High in antioxidants and anti-inflammatory foods</p></li>
                    <li><p data-text-key="nutrition-weight-management">Supports healthy weight management and improves longevity</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-key-considerations">Key Considerations</h2>
                <ul>
                    <li><p data-text-key="nutrition-portion-control">Moderate in calories, so portion control is essential for weight loss</p></li>
                    <li><p data-text-key="nutrition-diet-limitations">Great for overall health, but may not suit those with severe low-carb or high-protein goals</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'gluten-free') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="gluten-free-diet-title">Gluten-Free Diet</h1>
                <p data-text-key="gluten-free-diet-description"><i>Delicious meals without gluten-containing ingredients.</i></p>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-overview">Overview</h2>
                <ul>
                    <li><p data-text-key="nutrition-exclude-gluten">Excludes all foods containing gluten, a protein found in wheat, barley, rye, and oats</p></li>
                    <li><p data-text-key="nutrition-celiac-disease">Essential for individuals with celiac disease or a gluten intolerance</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-benefits">Benefits</h2>
                <ul>
                    <li><p data-text-key="nutrition-manage-gluten-sensitivity">Essential for managing celiac disease or gluten sensitivity</p></li>
                    <li><p data-text-key="nutrition-digestive-health">May improve digestive health, energy levels, and reduce inflammation in people with gluten-related disorders</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-key-considerations">Key Considerations</h2>
                <ul>
                    <li><p data-text-key="nutrition-gluten-free-not-necessary">Not necessary for people without gluten sensitivity; gluten-free products can be high in sugar and fat</p></li>
                    <li><p data-text-key="nutrition-naturally-gluten-free">Must focus on naturally gluten-free foods like rice, quinoa, potatoes, fruits, vegetables, and lean proteins</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'intermittent-fasting') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="if-diet-title">Intermittent Fasting (IF)</h1>
                <p data-text-key="if-diet-description"><i>Strategic eating patterns for metabolic health and weight management.</i></p>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-overview">Overview</h2>
                <ul>
                    <li><p data-text-key="nutrition-fasting-cycles">Involves cycling between periods of eating and fasting</p></li>
                    <li><p data-text-key="nutrition-16-8-fasting">16:8: Fast for 16 hours and eat within an 8-hour window</p></li>
                    <li><p data-text-key="nutrition-5-2-fasting">5:2: Eat normally for 5 days and restrict calories (around 500-600) for 2 non-consecutive days</p></li>
                    <li><p data-text-key="nutrition-alternate-day-fasting">Alternate-Day Fasting: Fast every other day</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-benefits">Benefits</h2>
                <ul>
                    <li><p data-text-key="nutrition-calorie-reduction">Can support weight loss by reducing calorie intake</p></li>
                    <li><p data-text-key="nutrition-metabolic-health">May improve metabolic health, blood sugar regulation, and insulin sensitivity</p></li>
                    <li><p data-text-key="nutrition-longevity-benefits">May support longevity and reduce the risk of chronic diseases</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-key-considerations">Key Considerations</h2>
                <ul>
                    <li><p data-text-key="nutrition-not-suitable-for-all">Not suitable for everyone; consult healthcare provider if you have certain health conditions</p></li>
                    <li><p data-text-key="nutrition-nutrient-dense-meals">Focus on nutrient-dense meals during eating windows</p></li>
                    <li><p data-text-key="nutrition-not-for-eating-disorders">Not recommended for people with eating disorders</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'dairy-free') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="dairy-free-diet-title">Dairy-Free Diet</h1>
                <p data-text-key="dairy-free-diet-description"><i>Nutritious meals without dairy products.</i></p>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-overview">Overview</h2>
                <ul>
                    <li><p data-text-key="nutrition-eliminate-dairy">Eliminates all forms of dairy, including milk, cheese, yogurt, and butter</p></li>
                    <li><p data-text-key="nutrition-dairy-free-reasons">Often adopted by people with lactose intolerance, dairy allergy, or those following a plant-based lifestyle</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-benefits">Benefits</h2>
                <ul>
                    <li><p data-text-key="nutrition-manage-lactose-symptoms">Helps manage symptoms of lactose intolerance or dairy allergies</p></li>
                    <li><p data-text-key="nutrition-reduce-discomfort">Can reduce bloating, digestive discomfort, and skin issues</p></li>
                    <li><p data-text-key="nutrition-alternative-to-dairy">Offers an alternative for those who avoid animal products</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-key-considerations">Key Considerations</h2>
                <ul>
                    <li><p data-text-key="nutrition-adequate-nutrients">Ensure adequate calcium, vitamin D, and protein intake through alternatives</p></li>
                    <li><p data-text-key="nutrition-fortified-milks">Choose fortified plant-based milks (almond, soy, oat)</p></li>
                    <li><p data-text-key="nutrition-leafy-greens">Include leafy greens and nuts for additional nutrients</p></li>
                    <li><p data-text-key="nutrition-processed-products">Some dairy-free products can be highly processed</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'high-protein') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="high-protein-diet-title">High-Protein Diet</h1>
                <p data-text-key="high-protein-diet-description"><i>Protein-rich meal plans for muscle growth and recovery.</i></p>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-overview">Overview</h2>
                <ul>
                    <li><p data-text-key="nutrition-high-protein-focus">Increases intake of protein-rich foods like lean meats, eggs, legumes, dairy, and plant-based protein sources</p></li>
                    <li><p data-text-key="nutrition-common-strategy">Common in muscle-building and weight-loss strategies</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-benefits">Benefits</h2>
                <ul>
                    <li><p data-text-key="nutrition-support-muscles">Supports muscle growth, repair, and recovery</p></li>
                    <li><p data-text-key="nutrition-promote-satiety">Can help with weight loss by promoting satiety</p></li>
                    <li><p data-text-key="nutrition-preserve-lean-mass">Preserves lean muscle mass during weight loss</p></li>
                    <li><p data-text-key="nutrition-improve-metabolic-rate">May improve metabolic rate and support healthy blood sugar levels</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-key-considerations">Key Considerations</h2>
                <ul>
                    <li><p data-text-key="nutrition-high-protein-risk">Too much protein, especially from animal sources, can stress the kidneys over time</p></li>
                    <li><p data-text-key="nutrition-balance-macros">A balance of carbs and fats is still necessary for optimal energy levels</p></li>
                    <li><p data-text-key="nutrition-variety-protein-sources">Consider both animal and plant-based protein sources for variety</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'supplements-understanding') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="supplements-understanding-title">Understanding Supplements</h1>
                <p data-text-key="supplements-understanding-description"><i>Learn about different types of supplements and their benefits for your fitness journey.</i></p>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-overview">Overview</h2>
                <ul>
                    <li><p data-text-key="nutrition-fill-gaps">Supplements can be useful in filling nutritional gaps, supporting health goals, and enhancing performance</p></li>
                    <li><p data-text-key="nutrition-not-replacement">They should never replace a well-rounded, nutrient-dense diet</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-what-are-supplements">What Are Supplements?</h2>
                <ul>
                    <li><p data-text-key="nutrition-supplement-definition">Supplements include vitamins, minerals, herbs, amino acids, and other substances taken to supplement your diet</p></li>
                    <li><p data-text-key="nutrition-supplement-forms">They come in various forms: pills, powders, liquids, and bars</p></li>
                    <li><p data-text-key="nutrition-supplement-purpose">The purpose is to help ensure adequate essential nutrients when diet may not provide sufficient quantities</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-types-of-supplements">Types of Supplements</h2>
                <ul>
                    <li><p data-text-key="nutrition-vitamins-minerals"><b>Vitamins and Minerals:</b> Essential nutrients like vitamin D, calcium, magnesium, iron, and B vitamins that support various bodily functions</p></li>
                    <li><p data-text-key="nutrition-protein-supplements"><b>Protein Supplements:</b> Whey, casein, or plant-based proteins for muscle growth, recovery, and weight management</p></li>
                    <li><p data-text-key="nutrition-omega3-fatty-acids"><b>Omega-3 Fatty Acids:</b> Fish oil or algae-based supplements for inflammation reduction, heart health, and brain function</p></li>
                    <li><p data-text-key="nutrition-creatine"><b>Creatine:</b> Popular for increasing muscle strength and power, helps replenish ATP during high-intensity activities</p></li>
                    <li><p data-text-key="nutrition-pre-workout-supplements"><b>Pre-Workout Supplements:</b> Mix of caffeine, beta-alanine, and nitric oxide boosters for energy, focus, and endurance</p></li>
                    <li><p data-text-key="nutrition-probiotics"><b>Probiotics:</b> Beneficial bacteria supporting gut health and immune function</p></li>
                    <li><p data-text-key="nutrition-multivitamins"><b>Multivitamins:</b> Broad-spectrum supplements containing various vitamins and minerals to cover common nutritional gaps</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-benefits-of-supplements">Benefits of Supplements</h2>
                <ul>
                    <li><p data-text-key="nutrition-correcting-deficiencies"><b>Correcting Nutrient Deficiencies:</b> Help prevent deficiencies in vitamins or minerals lacking in diet</p></li>
                    <li><p data-text-key="nutrition-improving-performance"><b>Improving Performance:</b> Enhance strength, endurance, and muscle recovery</p></li>
                    <li><p data-text-key="nutrition-supporting-health-conditions"><b>Supporting Health Conditions:</b> Help manage conditions like osteoporosis, joint health, and heart disease</p></li>
                    <li><p data-text-key="nutrition-supplement-convenience"><b>Convenience:</b> Provide an easy way to increase nutrient intake, especially for busy individuals or those with dietary restrictions</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-common-uses">Common Uses</h2>
                <ul>
                    <li><p data-text-key="nutrition-vitamins-bone-health"><b>Vitamins and Minerals:</b> Support bone health, improve energy levels, address deficiencies</p></li>
                    <li><p data-text-key="nutrition-protein-post-workout"><b>Protein:</b> Post-workout recovery, muscle building, managing hunger</p></li>
                    <li><p data-text-key="nutrition-omega3-heart-health"><b>Omega-3s:</b> Heart health, reducing inflammation, cognitive function</p></li>
                    <li><p data-text-key="nutrition-creatine-muscle-growth"><b>Creatine:</b> Strength, power, and muscle growth</p></li>
                    <li><p data-text-key="nutrition-pre-workout-energy"><b>Pre-Workout:</b> Boost energy and performance during intense exercise</p></li>
                    <li><p data-text-key="nutrition-probiotics-digestive-health"><b>Probiotics:</b> Digestive health, gut balance, immunity</p></li>
                    <li><p data-text-key="nutrition-multivitamins-general-health"><b>Multivitamins:</b> General health maintenance, filling dietary gaps</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'supplements-safety') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="supplements-safety-title">Supplement Safety</h1>
                <p data-text-key="supplements-safety-description"><i>Guidelines for effective use, potential risks, and safety considerations.</i></p>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-when-to-take-supplements">When to Take Supplements</h2>
                <ul>
                    <li><p data-text-key="nutrition-consistency-is-key">Consistency is Key: Most supplements need to be taken consistently over time for maximum benefit</p></li>
                    <li><p data-text-key="nutrition-timing-matters">Timing Matters:</p></li>
                    <ul>
                        <li><p data-text-key="nutrition-protein-timing"><b>Protein:</b> Ideally taken post-workout to support muscle recovery</p></li>
                        <li><p data-text-key="nutrition-creatine-timing"><b>Creatine:</b> Can be taken any time of day, but post-workout is commonly recommended</p></li>
                        <li><p data-text-key="nutrition-multivitamin-timing"><b>Multivitamins:</b> Typically taken with meals to aid absorption</p></li>
                        <li><p data-text-key="nutrition-probiotic-timing"><b>Probiotics:</b> Often best taken on an empty stomach for optimal gut absorption</p></li>
                    </ul>
                    <li><p data-text-key="nutrition-stacking-supplements">Stacking Supplements: Some supplements work well together (e.g., vitamin D with calcium), but consult a healthcare provider before combining</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-how-to-choose-supplements">How to Choose Supplements</h2>
                <ul>
                    <li><p data-text-key="nutrition-assess-needs"><b>Assess Your Needs:</b> Identify what your body truly needs; consider getting blood work done to determine deficiencies</p></li>
                    <li><p data-text-key="nutrition-quality-over-quantity"><b>Quality Over Quantity:</b> Choose reputable brands with third-party testing for purity and potency</p></li>
                    <li><p data-text-key="nutrition-natural-vs-synthetic"><b>Natural vs. Synthetic:</b> When possible, opt for whole-food-based supplements or those from natural sources</p></li>
                    <li><p data-text-key="nutrition-consult-professional"><b>Consult a Professional:</b> Speak with a healthcare provider before starting new supplements, especially with health conditions or medications</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-potential-risks">Potential Risks and Side Effects</h2>
                <ul>
                    <li><p data-text-key="nutrition-toxicity"><b>Toxicity:</b> Excessive amounts of fat-soluble vitamins (A, D, E, K) can lead to toxicity</p></li>
                    <li><p data-text-key="nutrition-medication-interactions"><b>Interactions with Medications:</b> Some supplements can interact with medications like blood thinners</p></li>
                    <li><p data-text-key="nutrition-gi-issues"><b>Gastrointestinal Issues:</b> Possible digestive discomfort, bloating, or diarrhea with certain supplements</p></li>
                    <li><p data-text-key="nutrition-over-reliance"><b>Over-Reliance:</b> Supplements should complement, not replace, a balanced diet</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-safety-guidelines">Safety Guidelines</h2>
                <ul>
                    <li><p data-text-key="nutrition-follow-dosages">Follow recommended dosages carefully</p></li>
                    <li><p data-text-key="nutrition-store-properly">Store supplements according to package instructions</p></li>
                    <li><p data-text-key="nutrition-check-expiration">Check expiration dates regularly</p></li>
                    <li><p data-text-key="nutrition-monitor-reactions">Monitor for any adverse reactions</p></li>
                    <li><p data-text-key="nutrition-keep-out-of-reach">Keep supplements out of reach of children</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'supplements-shop') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="supplements-shop-title">Shop Supplements</h1>
                <p data-text-key="supplements-shop-description"><i>Browse and purchase high-quality, verified supplements.</i></p>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-coming-soon">Coming Soon!</h2>
                <ul>
                    <li><p data-text-key="nutrition-shop-development">Our supplement shop is currently under development</p></li>
                    <li><p data-text-key="nutrition-quality-selection">We're carefully selecting high-quality, verified supplements from trusted manufacturers</p></li>
                    <li><p data-text-key="nutrition-stay-tuned">Stay tuned for a curated collection of supplements to support your fitness journey</p></li>
                </ul>
            </div>
    
            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-what-to-expect">What to Expect</h2>
                <ul>
                    <li><p data-text-key="nutrition-third-party-tested">Third-party tested supplements</p></li>
                    <li><p data-text-key="nutrition-competitive-pricing">Competitive pricing</p></li>
                    <li><p data-text-key="nutrition-detailed-product-info">Detailed product information and usage guidelines</p></li>
                    <li><p data-text-key="nutrition-expert-recommendations">Expert recommendations based on your goals</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'breakfast-recipes') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="breakfast-recipes-title">Healthy Breakfast Recipes</h1>
                <p data-text-key="breakfast-recipes-description"><i>Nutritious breakfast recipes tailored to different health and fitness goals.</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-weight-loss-breakfast">Weight Loss Breakfast</h2>
                <h3 data-text-key="nutrition-avocado-egg-wrap">Avocado & Egg Breakfast Wrap</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-wrap-tortilla">1 whole-grain tortilla</p></li>
                            <li><p data-text-key="nutrition-wrap-avocado">½ avocado (mashed)</p></li>
                            <li><p data-text-key="nutrition-wrap-egg">1 boiled or poached egg</p></li>
                            <li><p data-text-key="nutrition-wrap-spinach">Handful of spinach leaves</p></li>
                            <li><p data-text-key="nutrition-wrap-salsa">1 tablespoon salsa (optional)</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-wrap-step1">Spread the mashed avocado on the tortilla</p></li>
                            <li><p data-text-key="nutrition-wrap-step2">Layer with spinach, egg, and salsa</p></li>
                            <li><p data-text-key="nutrition-wrap-step3">Roll the tortilla tightly and enjoy!</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-wrap-why"><b>Why it works:</b> High in fiber and healthy fats, this breakfast keeps you full for longer</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-muscle-building-breakfast">Muscle Building Breakfast</h2>
                <h3 data-text-key="nutrition-protein-oatmeal">Protein-Packed Oatmeal</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-oatmeal-oats">½ cup rolled oats</p></li>
                            <li><p data-text-key="nutrition-oatmeal-protein">1 scoop whey protein powder (vanilla or chocolate)</p></li>
                            <li><p data-text-key="nutrition-oatmeal-milk">1 cup almond milk</p></li>
                            <li><p data-text-key="nutrition-oatmeal-pb">1 tablespoon peanut butter</p></li>
                            <li><p data-text-key="nutrition-oatmeal-banana">½ banana (sliced)</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-oatmeal-step1">Cook oats with almond milk as per package instructions</p></li>
                            <li><p data-text-key="nutrition-oatmeal-step2">Once cooked, stir in protein powder and peanut butter</p></li>
                            <li><p data-text-key="nutrition-oatmeal-step3">Top with banana slices and enjoy!</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-oatmeal-why"><b>Why it works:</b> Combines protein, carbs, and healthy fats to fuel muscle growth</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-energy-boost-breakfast">Energy Boost Breakfast</h2>
                <h3 data-text-key="nutrition-berry-smoothie">Berry Chia Smoothie</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-smoothie-berries">1 cup mixed berries (frozen or fresh)</p></li>
                            <li><p data-text-key="nutrition-smoothie-yogurt">1 cup unsweetened Greek yogurt</p></li>
                            <li><p data-text-key="nutrition-smoothie-chia">1 tablespoon chia seeds</p></li>
                            <li><p data-text-key="nutrition-smoothie-milk">½ cup almond milk</p></li>
                            <li><p data-text-key="nutrition-smoothie-honey">1 teaspoon honey (optional)</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-smoothie-step1">Blend all ingredients until smooth</p></li>
                            <li><p data-text-key="nutrition-smoothie-step2">Serve immediately for a refreshing, energy-packed breakfast</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-smoothie-why"><b>Why it works:</b> Berries provide antioxidants, while chia seeds and yogurt offer sustained energy</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-balanced-breakfast">Balanced General Health Breakfast</h2>
                <h3 data-text-key="nutrition-veggie-scramble">Veggie Scramble with Toast</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-scramble-eggs">2 large eggs (or 1 egg + 2 egg whites)</p></li>
                            <li><p data-text-key="nutrition-scramble-veggies">½ cup diced vegetables (e.g., spinach, tomatoes, bell peppers)</p></li>
                            <li><p data-text-key="nutrition-scramble-bread">1 slice whole-grain bread</p></li>
                            <li><p data-text-key="nutrition-scramble-oil">1 teaspoon olive oil</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-scramble-step1">Heat olive oil in a pan and sauté vegetables until soft</p></li>
                            <li><p data-text-key="nutrition-scramble-step2">Add eggs and scramble together</p></li>
                            <li><p data-text-key="nutrition-scramble-step3">Serve with a slice of toasted whole-grain bread</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-scramble-why"><b>Why it works:</b> Packed with protein, fiber, and nutrients for overall health</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'lunch-recipes') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="lunch-recipes-title">Healthy Lunch Recipes</h1>
                <p data-text-key="lunch-recipes-description"><i>Nutritious lunch recipes tailored to different health and fitness goals.</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-weight-loss-lunch">Weight Loss Lunch</h2>
                <h3 data-text-key="nutrition-quinoa-bowl">Quinoa Salad Bowl</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-quinoa-bowl-quinoa">1 cup cooked quinoa</p></li>
                            <li><p data-text-key="nutrition-quinoa-bowl-chickpeas">½ cup chickpeas (cooked or canned)</p></li>
                            <li><p data-text-key="nutrition-quinoa-bowl-greens">1 cup mixed greens (spinach, kale, arugula)</p></li>
                            <li><p data-text-key="nutrition-quinoa-bowl-cucumber">½ cucumber (sliced)</p></li>
                            <li><p data-text-key="nutrition-quinoa-bowl-avocado">¼ avocado (diced)</p></li>
                            <li><p data-text-key="nutrition-quinoa-bowl-oil">1 tablespoon olive oil</p></li>
                            <li><p data-text-key="nutrition-quinoa-bowl-lemon">Juice of ½ lemon</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-quinoa-bowl-step1">Combine quinoa, chickpeas, greens, cucumber, and avocado in a bowl</p></li>
                            <li><p data-text-key="nutrition-quinoa-bowl-step2">Drizzle olive oil and lemon juice, toss gently, and serve</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-quinoa-bowl-why"><b>Why it works:</b> High in fiber and plant-based protein, low in calories</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-muscle-building-lunch">Muscle Building Lunch</h2>
                <h3 data-text-key="nutrition-chicken-sweet-potato">Grilled Chicken & Sweet Potato Meal Prep</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-chicken-prep-chicken">1 grilled chicken breast</p></li>
                            <li><p data-text-key="nutrition-chicken-prep-potato">1 medium sweet potato (baked or roasted)</p></li>
                            <li><p data-text-key="nutrition-chicken-prep-broccoli">1 cup steamed broccoli</p></li>
                            <li><p data-text-key="nutrition-chicken-prep-tahini">1 tablespoon tahini or hummus (optional)</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-chicken-prep-step1">Bake or grill the chicken until fully cooked</p></li>
                            <li><p data-text-key="nutrition-chicken-prep-step2">Serve with roasted sweet potato and steamed broccoli</p></li>
                            <li><p data-text-key="nutrition-chicken-prep-step3">Add tahini or hummus for a flavourful protein boost</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-chicken-prep-why"><b>Why it works:</b> Combines lean protein, complex carbs, and nutrient-dense veggies</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-energy-boost-lunch">Energy Boost Lunch</h2>
                <h3 data-text-key="nutrition-mediterranean-wrap">Mediterranean Wrap</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-med-wrap-tortilla">1 whole-grain wrap</p></li>
                            <li><p data-text-key="nutrition-med-wrap-hummus">2 tablespoons hummus</p></li>
                            <li><p data-text-key="nutrition-med-wrap-veggies">½ cup grilled vegetables (zucchini, peppers, onions)</p></li>
                            <li><p data-text-key="nutrition-med-wrap-feta">¼ cup crumbled feta cheese</p></li>
                            <li><p data-text-key="nutrition-med-wrap-arugula">Handful of arugula</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-med-wrap-step1">Spread hummus on the wrap</p></li>
                            <li><p data-text-key="nutrition-med-wrap-step2">Add grilled veggies, feta, and arugula</p></li>
                            <li><p data-text-key="nutrition-med-wrap-step3">Roll tightly and enjoy</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-med-wrap-why"><b>Why it works:</b> Rich in slow-digesting carbs and healthy fats for sustained energy</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-balanced-lunch">Balanced General Health Lunch</h2>
                <h3 data-text-key="nutrition-turkey-sandwich">Turkey & Avocado Sandwich</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-sandwich-bread">2 slices whole-grain bread</p></li>
                            <li><p data-text-key="nutrition-sandwich-turkey">3-4 slices lean turkey breast</p></li>
                            <li><p data-text-key="nutrition-sandwich-avocado">¼ avocado (mashed or sliced)</p></li>
                            <li><p data-text-key="nutrition-sandwich-tomato">1 slice tomato</p></li>
                            <li><p data-text-key="nutrition-sandwich-greens">Handful of mixed greens</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-sandwich-step1">Assemble the sandwich with turkey, avocado, tomato, and greens</p></li>
                            <li><p data-text-key="nutrition-sandwich-step2">Slice in half and enjoy</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-sandwich-why"><b>Why it works:</b> Balanced macronutrients for sustained energy and overall health</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-vegan-lunch">Vegan Lunch Option</h2>
                <h3 data-text-key="nutrition-lentil-stir-fry">Lentil & Vegetable Stir-Fry</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-stir-fry-lentils">1 cup cooked lentils</p></li>
                            <li><p data-text-key="nutrition-stir-fry-veggies">1 cup mixed vegetables (e.g., bell peppers, broccoli, carrots)</p></li>
                            <li><p data-text-key="nutrition-stir-fry-oil">1 tablespoon olive oil</p></li>
                            <li><p data-text-key="nutrition-stir-fry-soy">1 teaspoon soy sauce or tamari</p></li>
                            <li><p data-text-key="nutrition-stir-fry-ginger">1 teaspoon ginger (grated)</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-stir-fry-vegan-step1">Heat olive oil in a pan and sauté vegetables until tender</p></li>
                            <li><p data-text-key="nutrition-stir-fry-vegan-step2">Add cooked lentils, soy sauce, and ginger. Stir for 2-3 minutes</p></li>
                            <li><p data-text-key="nutrition-stir-fry-vegan-step3">Serve warm as a standalone dish or with brown rice</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-stir-fry-vegan-why"><b>Why it works:</b> High in plant protein, fiber, and essential vitamins</p></li>
                </ul>
            </div>
        `;
    } else if (topicId === 'dinner-recipes') {
        learningContent.innerHTML = `
            <div class="nutrition-detail-header">
                <h1 data-text-key="dinner-recipes-title">Healthy Dinner Recipes</h1>
                <p data-text-key="dinner-recipes-description"><i>Nutritious dinner recipes tailored to different health and fitness goals.</i></p>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-weight-loss-dinner">Weight Loss Dinner</h2>
                <h3 data-text-key="nutrition-lemon-chicken">Grilled Lemon Herb Chicken with Steamed Veggies</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-chicken-breast">1 chicken breast (boneless, skinless)</p></li>
                            <li><p data-text-key="nutrition-lemon-juice">Juice of 1 lemon</p></li>
                            <li><p data-text-key="nutrition-olive-oil-1tsp">1 teaspoon olive oil</p></li>
                            <li><p data-text-key="nutrition-oregano">½ teaspoon dried oregano</p></li>
                            <li><p data-text-key="nutrition-steamed-veggies">1 cup steamed broccoli and carrots</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-chicken-step1">Marinate chicken in lemon juice, olive oil, and oregano for 15 minutes</p></li>
                            <li><p data-text-key="nutrition-chicken-step2">Grill the chicken until fully cooked</p></li>
                            <li><p data-text-key="nutrition-chicken-step3">Serve with steamed broccoli and carrots</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-chicken-why"><b>Why it works:</b> Low in calories and high in protein, with fiber-rich veggies to promote satiety</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-muscle-building-dinner">Muscle Building Dinner</h2>
                <h3 data-text-key="nutrition-beef-quinoa">Beef & Quinoa Stir-Fry</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-beef">200g lean ground beef</p></li>
                            <li><p data-text-key="nutrition-quinoa">1 cup cooked quinoa</p></li>
                            <li><p data-text-key="nutrition-mixed-veggies">1 cup mixed vegetables (e.g., bell peppers, zucchini, onions)</p></li>
                            <li><p data-text-key="nutrition-soy-sauce">1 tablespoon soy sauce</p></li>
                            <li><p data-text-key="nutrition-sesame-oil">1 teaspoon sesame oil</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-beef-step1">Cook ground beef in a skillet until browned</p></li>
                            <li><p data-text-key="nutrition-beef-step2">Add vegetables and stir-fry until tender</p></li>
                            <li><p data-text-key="nutrition-beef-step3">Mix in cooked quinoa, soy sauce, and sesame oil. Serve hot</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-beef-why"><b>Why it works:</b> High in protein and complex carbs for muscle repair and growth</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-energy-boost-dinner">Energy Boost Dinner</h2>
                <h3 data-text-key="nutrition-baked-salmon">Baked Salmon with Sweet Potato and Asparagus</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-salmon">1 salmon fillet</p></li>
                            <li><p data-text-key="nutrition-sweet-potato">1 medium sweet potato (sliced)</p></li>
                            <li><p data-text-key="nutrition-asparagus">1 cup asparagus spears</p></li>
                            <li><p data-text-key="nutrition-olive-oil-1tsp">1 teaspoon olive oil</p></li>
                            <li><p data-text-key="nutrition-garlic-powder">1 teaspoon garlic powder</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-salmon-step1">Preheat the oven to 200°C (400°F)</p></li>
                            <li><p data-text-key="nutrition-salmon-step2">Place salmon, sweet potato slices, and asparagus on a baking sheet</p></li>
                            <li><p data-text-key="nutrition-salmon-step3">Drizzle with olive oil, sprinkle garlic powder, and bake for 20-25 minutes</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-salmon-why"><b>Why it works:</b> Combines healthy fats, protein, and slow-digesting carbs for lasting energy</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-balanced-dinner">Balanced General Health Dinner</h2>
                <h3 data-text-key="nutrition-chicken-stir-fry">Chicken & Vegetable Stir-Fry with Brown Rice</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-chicken-sliced">1 chicken breast (sliced)</p></li>
                            <li><p data-text-key="nutrition-brown-rice">1 cup cooked brown rice</p></li>
                            <li><p data-text-key="nutrition-mixed-veggies-general">1 cup mixed vegetables (e.g., broccoli, snap peas, carrots)</p></li>
                            <li><p data-text-key="nutrition-soy-sauce">1 tablespoon soy sauce</p></li>
                            <li><p data-text-key="nutrition-olive-oil-1tsp">1 teaspoon olive oil</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-stir-fry-step1">Heat olive oil in a pan and cook chicken slices until browned</p></li>
                            <li><p data-text-key="nutrition-stir-fry-step2">Add vegetables and stir-fry until tender</p></li>
                            <li><p data-text-key="nutrition-stir-fry-step3">Mix in cooked brown rice and soy sauce. Serve warm</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-stir-fry-why"><b>Why it works:</b> A balanced mix of lean protein, fiber, and healthy carbs</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-vegan-dinner">Vegan Dinner Option</h2>
                <h3 data-text-key="nutrition-stuffed-peppers">Stuffed Bell Peppers</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-bell-peppers">2 large bell peppers (halved and deseeded)</p></li>
                            <li><p data-text-key="nutrition-quinoa-rice">1 cup cooked quinoa or brown rice</p></li>
                            <li><p data-text-key="nutrition-black-beans">½ cup black beans (cooked or canned)</p></li>
                            <li><p data-text-key="nutrition-tomatoes">½ cup diced tomatoes</p></li>
                            <li><p data-text-key="nutrition-cumin">1 teaspoon cumin</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-peppers-step1">Preheat the oven to 180°C (350°F)</p></li>
                            <li><p data-text-key="nutrition-peppers-step2">Mix quinoa, black beans, tomatoes, and cumin</p></li>
                            <li><p data-text-key="nutrition-peppers-step3">Stuff the bell peppers with the mixture and bake for 25 minutes</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-peppers-why"><b>Why it works:</b> Packed with plant-based protein and fiber for a satisfying vegan dinner</p></li>
                </ul>
            </div>

            <div class="nutrition-detail-section">
                <h2 data-text-key="nutrition-low-carb-dinner">Low-Carb/Keto Dinner</h2>
                <h3 data-text-key="nutrition-zoodles">Zucchini Noodles with Pesto & Grilled Shrimp</h3>
                <ul>
                    <li><p data-text-key="nutrition-ingredients"><b>Ingredients:</b></p>
                        <ul>
                            <li><p data-text-key="nutrition-zucchini">1 zucchini (spiralized into noodles)</p></li>
                            <li><p data-text-key="nutrition-shrimp">100g grilled shrimp</p></li>
                            <li><p data-text-key="nutrition-pesto">2 tablespoons pesto (low-carb)</p></li>
                            <li><p data-text-key="nutrition-olive-oil-1tsp">1 teaspoon olive oil</p></li>
                        </ul>
                    </li>
                    <li><p data-text-key="nutrition-instructions"><b>Instructions:</b></p>
                        <ol>
                            <li><p data-text-key="nutrition-zoodles-step1">Heat olive oil in a pan and sauté zucchini noodles for 2-3 minutes</p></li>
                            <li><p data-text-key="nutrition-zoodles-step2">Toss noodles with pesto and grilled shrimp. Serve warm</p></li>
                        </ol>
                    </li>
                    <li><p data-text-key="nutrition-zoodles-why"><b>Why it works:</b> Low in carbs, high in protein and healthy fats, perfect for keto</p></li>
                </ul>
            </div>
        `;
    } else {
        showError();
    }
} 