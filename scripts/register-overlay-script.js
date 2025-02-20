document.addEventListener('DOMContentLoaded', function() {
    const registerOverlay = document.getElementById('registerOverlay');
    const registerContainer = registerOverlay.querySelector('.register-container');
    const closeButton = document.getElementById('closeRegister');
    const registerForm = registerOverlay.querySelector('.register-form');
    const registerButton = document.querySelectorAll('.intro-register-button, .login-register');
    const phoneInput = document.getElementById('registerNumber');

    function showRegisterOverlay() {
        registerOverlay.style.display = 'flex';
        registerOverlay.offsetHeight; // Trigger reflow
        registerOverlay.classList.add('show');
        registerContainer.classList.add('show');
    }

    function hideRegisterOverlay() {
        registerOverlay.classList.remove('show');
        registerContainer.classList.remove('show');
        setTimeout(() => {
            registerOverlay.style.display = 'none';
            registerForm.reset();
        }, 300);
    }

    async function handleRegistration(e) {
        e.preventDefault();
        const submitButton = registerForm.querySelector('.register-submit');
        submitButton.disabled = true;
        submitButton.classList.add('loading');

        try {
            const response = await fetch(`${window.CONFIG.API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: phoneInput.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            // After successful registration, attempt to login
            const loginResponse = await fetch(`${window.CONFIG.API_URL}/subscriber/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: phoneInput.value,
                    pin: data.pin,
                    remember: true
                })
            });

            if (!loginResponse.ok) {
                throw new Error('Auto-login failed');
            }

            const loginData = await loginResponse.json();
            localStorage.setItem('login-token', loginData.token);

            hideRegisterOverlay();
            // Show success message with PIN
            const confirmed = await window.showPrompt('register-success', 'register-success-message', 'register-pin', data.pin, true, false);

            if (confirmed) {
                window.location.href = '/dashboard';
            }

        } catch (error) {
            console.error('Registration error:', error);
            if (error.message === 'Phone number already registered') {
                window.showToast('register-failed-number-registered', true);
            } else {
                window.showToast('register-failed', true);
            }
        } finally {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
    }

    // Event Listeners
    registerButton.forEach(button => {
        button.addEventListener('click', showRegisterOverlay);
    });

    closeButton.addEventListener('click', hideRegisterOverlay);

    registerOverlay.addEventListener('click', function(e) {
        if (e.target === registerOverlay) {
            hideRegisterOverlay();
        }
    });

    registerForm.addEventListener('submit', handleRegistration);
}); 