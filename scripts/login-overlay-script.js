document.addEventListener('DOMContentLoaded', async function() {
    if (window.authState) {
        await window.authState.init();
    }

    if (window.authState && window.authState.isTokenPresent) {
        return;
    }

    const avatar = document.querySelector('.avatar');
    const loginButton = document.querySelector('.intro-login-button');
    const registerButton = document.querySelector('.intro-register-button');
    const loginOverlay = document.getElementById('loginOverlay');
    const loginContainer = loginOverlay.querySelector('.login-container');
    const registerOverlay = document.getElementById('registerOverlay');
    const registerToastNotification = registerOverlay.querySelector('.register-toast-notification');

    // Get form elements
    const closeButton = document.getElementById('closeLogin');
    const pinInput = document.getElementById('pin');
    const phoneInput = document.getElementById('number');
    const registerLoginButton = loginOverlay.querySelector('.login-register');
    const loginForm = loginOverlay.querySelector('.login-form');
    const loginSubmitButton = loginForm.querySelector('.login-submit');
    const tandcCheckbox = loginForm.querySelector('.tandc-option input[type="checkbox"]');
    const rememberMeCheckbox = loginForm.querySelector('.remember-me input[type="checkbox"]');

    // Initially disable login button
    loginSubmitButton.disabled = true;
    loginSubmitButton.style.opacity = '0.5';
    loginSubmitButton.style.cursor = 'not-allowed';

    function hideLoginOverlay() {
        loginOverlay.classList.remove('show');
        loginContainer.classList.remove('show');
        setTimeout(() => {
            loginOverlay.style.display = 'none';
        }, 300);
    }

    function showLoginOverlay() {
        // Get current language and check appropriate strings
        const currentLang = document.querySelector('.language-selector p').textContent.toLowerCase();
        const stringsToCheck = currentLang === 'en' ? window.englishStrings : window.amharicStrings;
        
        if (Object.keys(stringsToCheck).length === 0) {
            setTimeout(showLoginOverlay, 10);
            return;
        }

        loginOverlay.style.display = 'flex';
        loginOverlay.offsetHeight; // Trigger reflow
        loginOverlay.classList.add('show');
        loginContainer.classList.add('show');
    }

    function showRegisterOverlay() {
        if (Object.keys(window.englishStrings).length === 0) {
            setTimeout(showRegisterOverlay, 100);
            return;
        }

        registerOverlay.style.display = 'flex';
        requestAnimationFrame(() => {
            registerOverlay.classList.add('show');
            registerToastNotification.classList.add('show');
        });

        setTimeout(hideRegisterOverlay, 5000);
    }

    function hideRegisterOverlay() {
        registerToastNotification.classList.remove('show');
        registerOverlay.classList.remove('show');
        setTimeout(() => {
            registerOverlay.style.display = 'none';
        }, 300);
    }

    // Form validation
    function validateForm() {
        const isPhoneValid = phoneInput.value.length === 9;
        const isPinValid = pinInput.value.length === 6;
        const isTandCAccepted = tandcCheckbox.checked;

        loginSubmitButton.disabled = !(isPhoneValid && isPinValid && isTandCAccepted);
        loginSubmitButton.style.opacity = loginSubmitButton.disabled ? '0.5' : '1';
        loginSubmitButton.style.cursor = loginSubmitButton.disabled ? 'not-allowed' : 'pointer';
    }

    // Event Listeners
    avatar.addEventListener('click', function(e) {
        e.stopPropagation();
        showLoginOverlay();
    });

    loginButton.addEventListener('click', showLoginOverlay);
    registerButton.addEventListener('click', showRegisterOverlay);
    registerLoginButton.addEventListener('click', showRegisterOverlay);
    closeButton.addEventListener('click', hideLoginOverlay);

    // Handle click outside overlays
    loginOverlay.addEventListener('click', function(e) {
        if (e.target === loginOverlay) {
            hideLoginOverlay();
        }
    });

    registerOverlay.addEventListener('click', function(e) {
        if (e.target === registerOverlay) {
            hideRegisterOverlay();
        }
    });

    // Form validation listeners
    phoneInput.addEventListener('input', validateForm);
    pinInput.addEventListener('input', validateForm);
    tandcCheckbox.addEventListener('change', validateForm);

    // Input length restrictions
    pinInput.addEventListener('input', function(e) {
        if (this.value.length > 6) {
            this.value = this.value.slice(0, 6);
        }
    });

    phoneInput.addEventListener('input', function(e) {
        if (this.value.length > 9) {
            this.value = this.value.slice(0, 9);
        }
    });

    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!loginSubmitButton.disabled) {
            // Add loading state and disable button
            loginSubmitButton.classList.add('loading');
            loginSubmitButton.disabled = true;
            loginSubmitButton.style.opacity = '0.5';
            loginSubmitButton.style.cursor = 'not-allowed';

            const credentials = {
                phone: phoneInput.value,
                pin: pinInput.value,
                remember: rememberMeCheckbox.checked
            };
            
            try {
                await loginUser(credentials);
                hideLoginOverlay(); // Hide the login overlay after successful login
            } catch (error) {
                console.error("Login failed");
                showLoginError()
                // Re-enable the button and restore its state only on error
                loginSubmitButton.classList.remove('loading');
                validateForm(); // This will properly set the button state based on form validity
            }
        }
    });

    // Add the loginUser function
    async function loginUser(credentials) {
        try {
            const response = await fetch(`${window.CONFIG.API_URL}/subscriber/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            
            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            localStorage.setItem("login-token", data.token);
            
            window.location.href = '/dashboard';

        } catch (error) {
            throw error; // Re-throw to handle in the submit handler
        }
    }

    function showLoginError() {
        const errorToast = document.getElementById('errorToastOverlay');
        const errorToastNotification = errorToast.querySelector('.error-toast-notification');
        const textElement = errorToast.querySelector('[data-text-key]');
        const currentLang = document.querySelector('.language-selector p').textContent.toLowerCase();
        const key = textElement.dataset.textKey;
        textElement.textContent = currentLang === 'en' ? window.englishStrings[key] : window.amharicStrings[key];
        
        // Show toast with animation
        errorToast.style.display = 'flex';
        requestAnimationFrame(() => {
            errorToast.classList.add('show');
            errorToastNotification.classList.add('show');
        });
        
        // Hide and remove toast after 5 seconds
        setTimeout(() => {
            errorToastNotification.classList.remove('show');
            errorToast.classList.remove('show');
            setTimeout(() => {
                errorToast.style.display = 'none';
            }, 300);
        }, 5000);
        
        // Add click event listener to close toast on click
        errorToast.addEventListener('click', function(e) {
            if (e.target === errorToast) {
                errorToastNotification.classList.remove('show');
                errorToast.classList.remove('show');
                setTimeout(() => {
                    errorToast.style.display = 'none';
                }, 300);
            }
        });
    }
});
