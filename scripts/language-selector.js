document.addEventListener('DOMContentLoaded', function() {
    try {

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
        
        if (languageSelector && languageDropdown) {
            languageSelector.addEventListener('click', function(e) {
                e.stopPropagation();
                languageDropdown.classList.toggle('show');
            });

            document.addEventListener('click', function(e) {
                if (!languageSelector.contains(e.target)) {
                    languageDropdown.classList.remove('show');
                }
            });
        }
    } catch (error) {
        console.error('Error initializing language selector:', error);
    }
});

async function updateLanguage(lang) {
    const normalizedLang = lang === 'en' || lang === 'EN' ? 'en' : 'am';
    const storedLang = localStorage.getItem('app-language');
    if (storedLang !== normalizedLang) {
        localStorage.setItem('app-language', normalizedLang);
        try {
            await updateUserLanguagePreference(normalizedLang);
            window.location.reload();
        } catch (error) {
            console.error('Failed to update language preference:', error);
            window.location.reload();
        }
    }
}

async function updateUserLanguagePreference(lang) {
    try {
        const token = localStorage.getItem('login-token');
        if (!token) return;

        const response = await fetch(`${window.CONFIG.API_URL}/subscriber/update-lang`, {
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

        if (window.userData && window.userData.user) {
            window.userData.user.lang = lang;
        }
    } catch (error) {
        console.error('Error updating language preference:', error);
    }
}