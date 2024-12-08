// Global states
window.userData = {
    user: null,
    isTokenValid: false
};

// Auth state management
window.authState = {
    isInitialized: false,
    isLoggedIn: false,
    checkLoginStatus: async function() {
        const token = localStorage.getItem('login-token');
        this.isTokenPresent = !!token;
        this.isLoggedIn = await this.validateTokenAndGetUserData();
        return {
            isLoggedIn: this.isLoggedIn,
            isTokenPresent: this.isTokenPresent
        };
    },
    validateTokenAndGetUserData: async function () {
        if (this.validationPromise) {
            return this.validationPromise;
        }

        this.validationPromise = (async () => {
            try {
                const token = localStorage.getItem('login-token');
                
                if (!token) {
                    window.userData.isTokenValid = false;
                    window.userData.user = null;
                    if (window.location.pathname.includes('/dashboard')) {
                        window.location.href = '/';
                    }
                    return false;
                }
        
                const response = await fetch(`${window.CONFIG.API_URL}/subscriber/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
        
                if (!response.ok) {
                    throw new Error('Token validation failed');
                }
        
                const userData = await response.json();
                window.userData.isTokenValid = true;
                window.userData.user = userData;
                

                //if (!window.location.pathname.includes('/dashboard')) {
                //    window.location.href = '/dashboard';
                //}

                updateLanguage(window.userData.user.user.lang);
        
                return true;
            } catch (error) {
                localStorage.removeItem('login-token');
                window.userData.isTokenValid = false;
                window.userData.user = null;
                
                if (window.location.pathname.includes('/dashboard')) {
                    window.location.href = '/';
                }
                return false;
            } finally {
                this.validationPromise = null;
            }
        })();

        return this.validationPromise;
    },
    init: async function() {
        if (this.isInitialized) return;
        await this.checkLoginStatus();
        this.isInitialized = true;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    await window.authState.init();
});