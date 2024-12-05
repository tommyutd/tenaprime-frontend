document.addEventListener('DOMContentLoaded', async function() {
    // Wait for auth state to be initialized
    if (window.authState) {
        await window.authState.init();
    }

    if (window.authState && window.authState.isTokenPresent) {
        return;
    }

    const avatar = document.querySelector('.avatar');
    const loginButton = document.querySelector('.intro-login-button');
    const registerButton = document.querySelector('.intro-register-button');
    
    // Create login overlay HTML
    const loginOverlayHTML = `
        <div class="login-overlay aleo-text" id="loginOverlay">
            <div class="login-container">
                <div class="login-header">
                    <h2 data-text-key="login-title">Login to TenaPrime</h2>
                    <button class="close-button" id="closeLogin">&times;</button>
                </div>
                <form class="login-form">
                    <div class="form-group">
                        <label for="number" class="form-label" data-text-key="phone-number-label">Phone Number</label>
                        <div class="phone-input-container">
                            <span class="country-code">+251</span>
                            <input type="number" id="number" required maxlength="6">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="pin" class="form-label" data-text-key="pin-label">PIN</label>
                        <div class="pin-input-container">
                            <input type="number" id="pin" required maxlength="6">
                        </div>
                    </div>
                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox">
                            <span data-text-key="remember-me">Remember me</span>
                        </label>
                        <a href="#" class="forgot-password" data-text-key="forgot-password">Forgot Password?</a>
                    </div>
                    <div class="tandc-options">
                        <label class="tandc-option">
                            <input type="checkbox">
                            <a href="#" class="tandc-link" data-text-key="tandc-agree">Agree to Terms and Conditions</a>
                        </label>
                    </div>
                    <div class="login-buttons">
                        <button type="submit" class="login-submit" data-text-key="login">Login</button>
                    </div>
                </form>
                <p class="login-footer" data-text-key="no-account">Don't have an account?</p>
                <div class="login-buttons">
                    <button class="login-register" data-text-key="register">Register</button>
                </div>
            </div>
        </div>
    `;

    const registerOverlayHTML = `
        <div class="register-overlay aleo-text" id="registerOverlay">
            <div class="toast-notification">
                <span data-text-key="register-toast">If you don't have an account, you can register by sending OK to 8362.</span>
            </div>
        </div>
    `;

    // Function to create and append login overlay
    function createLoginOverlay() {
        if (!document.getElementById('loginOverlay')) {
            if (Object.keys(window.englishStrings).length === 0) {
                setTimeout(createLoginOverlay, 100);
                return;
            }

            document.body.insertAdjacentHTML('beforeend', loginOverlayHTML);
            
            // Get the newly created elements
            const loginOverlay = document.getElementById('loginOverlay');
            const closeButton = document.getElementById('closeLogin');
            const loginContainer = loginOverlay.querySelector('.login-container');
            const pinInput = document.getElementById('pin');
            const phoneInput = document.getElementById('number');
            const registerLoginButton = loginOverlay.querySelector('.login-register');
            const loginForm = loginOverlay.querySelector('.login-form');
            const loginButton = loginForm.querySelector('.login-submit');
            const tandcCheckbox = loginForm.querySelector('.tandc-option input[type="checkbox"]');
            const rememberMeCheckbox = loginForm.querySelector('.remember-me input[type="checkbox"]');

            // Initially disable login button
            loginButton.disabled = true;
            loginButton.style.opacity = '0.5';
            loginButton.style.cursor = 'not-allowed';

            // Add event listener to checkbox
            tandcCheckbox.addEventListener('change', function() {
                loginButton.disabled = !this.checked;
                loginButton.style.opacity = this.checked ? '1' : '0.5';
                loginButton.style.cursor = this.checked ? 'pointer' : 'not-allowed';
            });

            // Update text based on current language
            const currentLang = document.querySelector('.language-selector p').textContent.toLowerCase();
            const textElements = loginOverlay.querySelectorAll('[data-text-key]');
            textElements.forEach(element => {
                const key = element.dataset.textKey;
                element.innerHTML = currentLang === 'en' ? window.englishStrings[key] : window.amharicStrings[key];
            });

            // Add event listeners
            closeButton.addEventListener('click', function() {
                loginOverlay.classList.remove('show');
                loginContainer.classList.remove('show');
                setTimeout(() => {
                    loginOverlay.style.display = 'none';
                }, 300);
            });

            registerLoginButton.addEventListener('click', function() {
                // Just show the register overlay without closing login overlay
                createRegisterOverlay();
            });

            loginContainer.addEventListener('click', function(e) {
                e.stopPropagation();
            });

            loginOverlay.addEventListener('click', function(e) {
                if (e.target === loginOverlay) {
                    loginOverlay.classList.remove('show');
                    loginContainer.classList.remove('show');
                    setTimeout(() => {
                        loginOverlay.style.display = 'none';
                    }, 300);
                }
            });

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

            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const phoneNumber = phoneInput.value;
                const pin = pinInput.value;
                const rememberMe = rememberMeCheckbox.checked;
                
                // Create credentials object with remember_me flag
                const credentials = {
                    phone: phoneNumber,
                    pin: pin,
                    remember: rememberMe
                };
                
                // Call loginUser function
                await loginUser(credentials);
                
                // If successful (token stored), close the overlay
                if (localStorage.getItem("login-token")) {
                    loginOverlay.classList.remove('show');
                    loginContainer.classList.remove('show');
                    setTimeout(() => {
                        loginOverlay.style.display = 'none';
                    }, 300);
                }
            });
        }
        
        // Show the overlay with animation
        const loginOverlay = document.getElementById('loginOverlay');
        const loginContainer = loginOverlay.querySelector('.login-container');
        
        loginOverlay.style.display = 'flex';
        // Trigger reflow
        loginOverlay.offsetHeight;
        
        // Add show classes to trigger animations
        loginOverlay.classList.add('show');
        loginContainer.classList.add('show');
    }

    function createRegisterOverlay() {
        if (!document.getElementById('registerOverlay')) {
            if (Object.keys(window.englishStrings).length === 0) {
                setTimeout(createRegisterOverlay, 100);
                return;
            }

            document.body.insertAdjacentHTML('beforeend', registerOverlayHTML);
            
            const registerOverlay = document.getElementById('registerOverlay');
            const toastNotification = registerOverlay.querySelector('.toast-notification');

            // Update text based on current language
            const currentLang = document.querySelector('.language-selector p').textContent.toLowerCase();
            const textElements = registerOverlay.querySelectorAll('[data-text-key]');
            textElements.forEach(element => {
                const key = element.dataset.textKey;
                element.textContent = currentLang === 'en' ? window.englishStrings[key] : window.amharicStrings[key];
            });
            
            // Initially set overlay to flex
            registerOverlay.style.display = 'flex';
            
            // Trigger animations
            requestAnimationFrame(() => {
                registerOverlay.classList.add('show');
                toastNotification.classList.add('show');
            });
            
            // Hide toast and overlay after 5 seconds
            setTimeout(() => {
                toastNotification.classList.remove('show');
                registerOverlay.classList.remove('show');
                
                // Remove overlay after animations complete
                setTimeout(() => {
                    if (registerOverlay && registerOverlay.parentNode) {
                        registerOverlay.parentNode.removeChild(registerOverlay);
                    }
                }, 300);
            }, 5000);

            // Handle click outside
            registerOverlay.addEventListener('click', function(e) {
                if (e.target === registerOverlay) {
                    toastNotification.classList.remove('show');
                    registerOverlay.classList.remove('show');
                    setTimeout(() => {
                        if (registerOverlay && registerOverlay.parentNode) {
                            registerOverlay.parentNode.removeChild(registerOverlay);
                        }
                    }, 300);
                }
            });
        }
    }

    async function loginUser(credentials) {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/v1/subscriber/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            
            if (!response.ok) {
                // Handle the error without logging to console
                // Create and show error toast
                const errorToastHTML = `
                    <div class="error-toast-overlay aleo-text" id="errorToastOverlay">
                        <div class="toast-notification error">
                            <span data-text-key="login-failed"></span>
                        </div>
                    </div>
                `;
                
                document.body.insertAdjacentHTML('beforeend', errorToastHTML);
                const errorToast = document.getElementById('errorToastOverlay');
                const errorToastNotification = errorToast.querySelector('.toast-notification');
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
                        if (errorToast && errorToast.parentNode) {
                            errorToast.parentNode.removeChild(errorToast);
                        }
                    }, 300);
                }, 5000);
                
                // Add click event listener to close toast on click
                errorToast.addEventListener('click', function(e) {
                    if (e.target === errorToast) {
                        errorToastNotification.classList.remove('show');
                        errorToast.classList.remove('show');
                        setTimeout(() => {
                            if (errorToast && errorToast.parentNode) {
                                errorToast.parentNode.removeChild(errorToast);
                            }
                        }, 300);
                    }
                });
                
                return;
            }

            const data = await response.json();
            localStorage.setItem("login-token", data.token);
            
            // Update auth state and get user data
            if (window.authState) {
                await window.authState.init();
                
                // Check if user data contains language preference
                if (window.userData && window.userData.user && window.userData.user.user.lang) {
                    // Update UI with user's preferred language
                    updateLanguage(window.userData.user.user.lang);
                }
                
                if (typeof initializeUserStats === 'function') {
                    initializeUserStats();
                }
            }
        } catch (error) {
            console.error("An error occurred during login, but it has been handled.");
        }
    }

    // Add click event listener to avatar
    avatar.addEventListener('click', async function(e) {
        e.stopPropagation();
        if (window.authState) {
            await window.authState.init();
        }

        if (!window.authState || !window.authState.isTokenPresent) {
            createLoginOverlay();
        }
    });
    loginButton.addEventListener('click', createLoginOverlay);
    registerButton.addEventListener('click', createRegisterOverlay);
});
