async function loadStrengthContent() {
    // Get the muscle group from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const muscleGroup = urlParams.get('group');

    try {
        // Fetch the appropriate JSON file
        const response = await fetch(`/exercises/data/strength/${muscleGroup}.json`);
        const data = await response.json();

        // Create the main container
        const strengthContainer = document.querySelector('.strength-training');
        strengthContainer.innerHTML = `
            <div class="strength-training-header">
                <h1>${data.header.title}</h1>
                <p>${data.header.description}</p>
            </div>
            <div class="strength-training-content">
                <div id="strength-training-content-introduction">
                    <div class="strength-section">
                        <h2>${data.introduction.title}</h2>
                        <p>${data.introduction.content}</p>
                    </div>
                </div>
                
                <div id="strength-training-content-anatomy">
                    <div class="strength-section">
                        <h2>${data.anatomy.title}</h2>
                        <p>${data.anatomy.overview}</p>
                        
                        <div class="strength-training-content-muscles">
                            <h3>Primary Muscles:</h3>
                            ${data.anatomy.primaryMuscles.map(muscle => `
                                <div class="muscle-group">
                                    <h4>${muscle.name}</h4>
                                    <p>${muscle.description}</p>
                                    <p>Functions:</p>
                                    <ul>
                                        ${muscle.functions.map(func => `<li><p>${func}</p></li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                            
                            <h3>Supporting Muscles:</h3>
                            <ul>
                                ${data.anatomy.supportingMuscles.map(muscle => `<li><p>${muscle}</p></li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="strength-training-content-anatomy-image">
                            <img src="${data.anatomy.image.url}" alt="${data.anatomy.image.caption}">
                            <p>${data.anatomy.image.caption}</p>
                        </div>
                    </div>
                </div>
                
                <div id="strength-training-content-safety">
                    <div class="strength-section">
                        <h2>${data.safety.title}</h2>
                        <ul>
                            ${data.safety.precautions.map(precaution => `<li><p>${precaution}</p></li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div id="strength-training-content-exercises">
                  <div class="strength-section">
                    <h2>Exercise List</h2>
                    <div class="strength-exercise-categories">
                        ${data.exercises.map(category => `
                            <div class="strength-exercise-category">
                                ${category.title ? `<h3>${category.title}</h3>` : ''}
                                <div class="strength-exercise-buttons">
                                    ${category.exercises.map(exercise => `
                                        <button class="strength-exercise-button aleo-text">
                                            <p>${exercise}</p>
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                  </div>
                </div>
                
                <div id="strength-training-content-workout">
                    <div class="strength-section">
                      <h2>${data.sampleWorkout.title}</h2>
                        <h3>Warm-up</h3>
                        <ul>
                            ${data.sampleWorkout.warmup.map(item => `<li><p>${item}</p></li>`).join('')}
                        </ul>
                        
                        <h3>Workout</h3>
                        <ol>
                            ${data.sampleWorkout.workout.map(item => `<li><p>${item}</p></li>`).join('')}
                        </ol>
                        
                        <h3>Cool-down</h3>
                        <ul>
                            ${data.sampleWorkout.cooldown.map(item => `<li><p>${item}</p></li>`).join('')}
                        </ul>
                        
                        <h3>Notes</h3>
                        <ul>
                            ${data.sampleWorkout.notes.map(note => `<li><p>${note}</p></li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div id="strength-training-content-conclusion">
                    <div class="strength-section">
                        <h2>Conclusion</h2>
                        <p>${data.conclusion}</p>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', loadStrengthContent);
