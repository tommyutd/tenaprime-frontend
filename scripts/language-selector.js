document.addEventListener('DOMContentLoaded', async function() {
    // Wait for strings to be loaded
    if (Object.keys(window.englishStrings).length === 0) {
        setTimeout(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }, 100);
        return;
    }

    // First check localStorage for language preference
    const storedLang = localStorage.getItem('app-language');
    if (storedLang) {
        updateLanguage(storedLang);
    }
    // Then check user data if available
    else {
        if (window.authState) {
            await window.authState.init();
        }

        if (window.userData && window.userData.user && window.userData.user.user.lang) {
            const userLang = window.userData.user.user.lang;
            updateLanguage(userLang);
        }
        else {
            updateLanguage('en');
        }
    }

    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const lang = this.dataset.lang;
            updateLanguage(lang);
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

function updateLanguage(lang) {
    const languageText = document.querySelector('.language-selector p');
    const unnormalizedLang = lang === 'en' || lang === 'EN' ? 'EN' : 'አማ';
    languageText.textContent = unnormalizedLang.toUpperCase();
    
    const fontElements = document.querySelectorAll('.aleo-text, .ethiopic-text');
    
    // Normalize language code for backend and storage
    const normalizedLang = lang === 'en' || lang === 'EN' ? 'en' : 'am';
    
    // Store normalized language in localStorage
    localStorage.setItem('app-language', normalizedLang);
    
    fontElements.forEach(element => {
        if (normalizedLang === 'en') {
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
        element.innerHTML = normalizedLang === 'en' ? window.englishStrings[key] : window.amharicStrings[key];
    });
    
    // If user is logged in, update their language preference with normalized value
    if (window.userData && window.userData.isTokenValid) {
        updateUserLanguagePreference(normalizedLang);
    }
    
    document.querySelector('.language-dropdown').classList.remove('show');
}

async function updateUserLanguagePreference(lang) {
    try {
        const token = localStorage.getItem('login-token');
        if (!token) return;

        const response = await fetch('http://127.0.0.1:5000/api/v1/subscriber/update-lang', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lang })
        });

        if (!response.ok) {
            throw new Error('Failed to update language preference');
        }

        // Update local user data
        if (window.userData && window.userData.user) {
            window.userData.user.lang = lang;
        }
    } catch (error) {
        console.error('Error updating language preference:', error);
    }
}