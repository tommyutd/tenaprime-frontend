let englishStrings = {};    
let amharicStrings = {};

fetch('/strings.json')
.then(response => response.json())
.then(data => {
    Object.keys(data).forEach(key => {
        englishStrings[key] = data[key].en;
        amharicStrings[key] = data[key].am;
    });
});

// Make strings available globally
window.englishStrings = englishStrings;
window.amharicStrings = amharicStrings; 