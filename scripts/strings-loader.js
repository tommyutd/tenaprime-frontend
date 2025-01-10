// Create a promise that resolves when strings are loaded
window.stringsLoaded = new Promise((resolve) => {
    window.resolveStrings = resolve;
});

const storedLang = localStorage.getItem('app-language');
if (storedLang) {
    currentLang = storedLang;
}
else {
    if (window.userData && window.userData.user && window.userData.user.user.lang) {
        const userLang = window.userData.user.user.lang;
        currentLang = userLang;
    }
    else {
        currentLang = 'en';
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
        '/exercises/strength': ['strength', 'body', 'exercise', 'user'],
        '/nutrition': ['nutrition-index', 'guest'],
        '/nutrition/dashboard': ['nutrition-dashboard', 'user'],
        '/prizes': ['prizes-index', 'guest'],
        '/prizes/dashboard': ['prizes-dashboard', 'user'],
        '/about': ['about', 'guest', 'user']
    };
    
    // Get URL parameters
    const url = new URL(window.location.href);
    const params = url.searchParams;
    
    // Start with base tags
    const tags = basePageTagMap[path] || [];
    
    // Add parameter-specific tags
    if (path === '/exercises/workout' && params.has('plan')) {
        const plan = params.get('plan');
        const matches = plan.match(/(three-day|four-day|five-day|at-home)/);
        if (matches) {
            tags.push(`${matches[1]}`);
        }
    }
    if (path === '/exercises/strength' && params.has('group')) {
        const group = params.get('group');
        const matches = group.match(/(upper|lower|full)/);
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
            fetch(`/strings/${currentLang}/${tag}.json`)
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
                if (currentLang === 'en') {
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
    const strings = currentLang === 'en' ? window.englishStrings : window.amharicStrings;

    const fontElements = document.querySelectorAll('.aleo-text, .ethiopic-text');
    
    fontElements.forEach(element => {
        if (currentLang === 'en') {
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
            element.innerHTML = strings[key];
        } else {
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