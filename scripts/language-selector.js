document.addEventListener('DOMContentLoaded', function() {
    // Wait for strings to be loaded
    if (Object.keys(window.englishStrings).length === 0) {
        setTimeout(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }, 100);
        return;
    }

    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const lang = this.dataset.lang;
            const languageText = document.querySelector('.language-selector p');
            languageText.textContent = lang.toUpperCase();
            
            const fontElements = document.querySelectorAll('.aleo-text, .ethiopic-text');
            
            fontElements.forEach(element => {
                if (lang === 'en') {
                    element.classList.remove('ethiopic-text');
                    element.classList.add('aleo-text');
                } else {
                    element.classList.remove('aleo-text');
                    element.classList.add('ethiopic-text');
                }
            });
            
            const textElements = document.querySelectorAll('[data-text-key]');
            textElements.forEach(element => {
                const key = element.dataset.textKey;
                element.innerHTML = lang === 'en' ? window.englishStrings[key] : window.amharicStrings[key];
            });
            
            document.querySelector('.language-dropdown').classList.remove('show');
        });
    });

    const languageSelector = document.querySelector('.language-selector');
    const languageDropdown = document.querySelector('.language-dropdown');
    
    languageSelector.addEventListener('click', function(e) {
        e.stopPropagation();
        languageDropdown.classList.toggle('show');
    });

    document.addEventListener('click', function(e) {
        if (!languageSelector.contains(e.target)) {
            languageDropdown.classList.remove('show');
        }
    });
});