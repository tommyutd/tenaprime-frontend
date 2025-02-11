// At the top of strings-loader.js
window.currentLang = 'en';  // default value

// Create a promise that resolves when strings are loaded
window.stringsLoaded = new Promise((resolve) => {
    window.resolveStrings = resolve;
});

const storedLang = localStorage.getItem('app-language');
if (storedLang) {
    window.currentLang = storedLang;
}
else {
    if (window.userData && window.userData.user && window.userData.user.user.lang) {
        const userLang = window.userData.user.user.lang;
        window.currentLang = userLang;
    }
    else {
        window.currentLang = 'en';
    }
}

// Initialize strings object
window.englishStrings = {};    
window.amharicStrings = {};

// Get current page tags
const currentPath = window.location.pathname;
const pageTags = getPageTags(currentPath);

// Helper function to determine which tags correspond to which pages
function getPageTags(path) {
    // Get base path tags
    const basePageTagMap = {
        '/': ['index', 'guest'],
        '/dashboard': ['dashboard', 'user'],
        '/exercises': ['exercises-index', 'guest'],
        '/exercises/dashboard': ['exercises-dashboard', 'user'],
        '/exercises/workout': ['workout', 'body', 'exercise', 'user'],
        '/exercises/strength': ['strength', 'exercise', 'user'],
        '/exercises/fitness': ['fitness', 'exercise', 'user'],
        '/exercises/cardio': ['cardio', 'exercise', 'user'],
        '/exercises/aerobics': ['aerobics', 'exercise', 'user'],
        '/exercises/hiit': ['hiit', 'exercise', 'user'],
        '/exercises/yoga': ['yoga', 'exercise', 'user'],
        '/exercises/healthy-sleeping': ['sleep', 'exercise', 'user'],
        '/exercises/stress-regulation': ['stress', 'exercise', 'user'],
        '/exercises/my-workout': ['my-workout', 'body', 'exercise', 'user'],
        '/nutrition': ['nutrition-index', 'guest'],
        '/nutrition/dashboard': ['nutrition-dashboard', 'user'],
        '/nutrition/learn': ['nutrition-dashboard', 'nutrition-learn', 'user'],
        '/nutrition/my-nutrition': ['my-nutrition', 'food', 'user'],
        '/prizes': ['prizes-index', 'guest'],
        '/prizes/dashboard': ['prizes-dashboard', 'user'],
        '/prizes/quiz': ['prizes-quiz', 'user'],
        '/prizes/rules': ['prizes-rules', 'user'],
        '/about': ['about', 'guest', 'user'],
        '/profile': ['profile', 'setup', 'user', 'food'],
        '/setup': ['profile', 'setup', 'user', 'food']
    };
    

    // Get URL parameters
    const url = new URL(window.location.href);
    const params = url.searchParams;
    
    // Start with base tags
    const tags = basePageTagMap[path] || [];
    
    // Add parameter-specific tags
    if (path === '/exercises/workout' && params.has('plan')) {
        const plan = params.get('plan');
        const matches = plan.match(/(three-day|four-day|five-day|at-home|cardio|aerobics)/);
        if (matches) {
            tags.push(`${matches[1]}`);
        }
    }
    if (path === '/exercises/strength' && params.has('group')) {
        const group = params.get('group');
        const matches = group.match(/(chest|arms|shoulders|back|core|lower-body|fitness)/);
        if (matches) {
            tags.push(`${matches[1]}`);
        }
    }

    if (path === '/nutrition/learn' && params.has('topic')) {
        const topic = params.get('topic');
        const matches = topic.match(/(basics|macros|meal-prep|carbs|protein|fats|vitamins|minerals|hydration|weight-loss|muscle-gain|maintenance|endurance|recomp|plant-based|low-carb|mediterranean|gluten-free|intermittent-fasting|dairy-free|high-protein|supplements-understanding|supplements-safety|supplements-shop|breakfast-recipes|lunch-recipes|dinner-recipes)/);
        if (matches) {
            tags.push(`${matches[1]}`);
        }
    }
    
    // Always include common tags
    tags.push('all');
    return tags;
}

// Function to fetch and merge string files based on tags
async function loadStringFiles() {
    try {       
        // Clear existing strings
        window.englishStrings = {};
        window.amharicStrings = {};
        
        // Create an array of fetch promises for each tag
        const fetchPromises = pageTags.map(tag => 
            fetch(`/strings/${window.currentLang}/${tag}.json`)
                .then(response => {
                    if (!response.ok) {
                        return [];
                    }
                    return response.json();
                })
                .catch(() => [])
        );

        // Wait for all fetches to complete
        const results = await Promise.all(fetchPromises);
        
        // Merge all string arrays
        results.forEach(stringArray => {
            stringArray.forEach(item => {
                if (window.currentLang === 'en') {
                    window.englishStrings[item.id] = item.en;
                } else {
                    window.amharicStrings[item.id] = item.am;
                }
            });
        });
        
        // Resolve the promise when strings are loaded
        window.resolveStrings();
    } catch (error) {
        console.error('Error loading string files:', error);
        window.resolveStrings();
    }
}

async function updatePageStrings() {
    const strings = window.currentLang === 'en' ? window.englishStrings : window.amharicStrings;
    const languageText = document.querySelector('.language-selector p');
    const unnormalizedLang = window.currentLang === 'en' ? 'EN' : 'አማ';
    languageText.textContent = unnormalizedLang.toUpperCase();

    const fontElements = document.querySelectorAll('.aleo-text, .ethiopic-text');
    
    fontElements.forEach(element => {
        if (window.currentLang === 'en') {
            element.classList.remove('ethiopic-text');
            element.classList.add('aleo-text');
        } else {
            element.classList.remove('aleo-text');
            element.classList.add('ethiopic-text');
        }
    });
    
    // Find all elements with data-text-key attribute
    const elements = document.querySelectorAll('[data-text-key]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-text-key');
        if (strings[key]) {
            // Get placeholder data from data attributes
            const placeholders = {};
            for (const attr of element.attributes) {
                if (attr.name.startsWith('data-placeholder-')) {
                    const placeholderKey = attr.name.replace('data-placeholder-', '');
                    placeholders[placeholderKey] = attr.value;
                }
            }

            // Replace placeholders in the string
            let finalString = strings[key];
            Object.entries(placeholders).forEach(([key, value]) => {
                const placeholder = `{{${key}}}`;
                finalString = finalString.replace(placeholder, value);
            });
            
            element.innerHTML = finalString;
            if (element.placeholder) {
                element.placeholder = finalString;
            }
        } else {
            element.innerHTML = key;
            console.warn(`Missing string for key: ${key}`);
        }

    });
}

loadStringFiles();

// Wait for strings to load before updating page
window.stringsLoaded.then(() => {
    updatePageStrings();
}).catch(error => {
    console.error('Error updating strings:', error);
});

window.updatePageStrings = updatePageStrings;