// Global states
window.userData = {
    user: null,
    isTokenValid: false
};

// Auth state management
window.authState = {
    isLoggedIn: false,
    checkLoginStatus: async function() {
        const isPresent = performInitialAuthCheck();
        const isValid = await validateTokenAndGetUserData();
        this.isTokenPresent = isPresent;
        this.isLoggedIn = isValid;
        return {
            isLoggedIn: this.isLoggedIn,
            isTokenPresent: this.isTokenPresent
        };
    },
    updateUI: function() {
        const guestContent = document.querySelector('.guest-content');
        const userContent = document.querySelector('.user-content');
        
        if (this.isLoggedIn) {
            if (guestContent) guestContent.style.display = 'none';
            if (userContent) userContent.style.display = 'block';
            const loginButtons = document.querySelectorAll('.intro-login-button, .intro-register-button');
            loginButtons.forEach(button => button.style.display = 'none');
        } else {
            if (guestContent) guestContent.style.display = 'block';
            if (userContent) userContent.style.display = 'none';
        }
    },
    init: async function() {
        await this.checkLoginStatus();
        this.updateUI();
    }
};

// Initial quick check
function performInitialAuthCheck() {
    const token = localStorage.getItem('login-token');
    const hasToken = !!token;
    
    const guestContent = document.querySelector('.guest-content');
    const userContent = document.querySelector('.user-content');
    
    if (hasToken) {
        if (guestContent) guestContent.style.display = 'none';
        if (userContent) userContent.style.display = 'block';
    } else {
        if (guestContent) guestContent.style.display = 'block';
        if (userContent) userContent.style.display = 'none';
    }

    return hasToken;
}

// Token validation and user data fetch
async function validateTokenAndGetUserData() {
    try {
        const token = localStorage.getItem('login-token');
        
        if (!token) {
            window.userData.isTokenValid = false;
            window.userData.user = null;
            if (window.location.pathname.includes('dashboard.html')) {
                window.location.href = 'index.html';
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

        if (!window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'dashboard.html';
        }

        return true;
    } catch (error) {
        localStorage.removeItem('login-token');
        window.userData.isTokenValid = false;
        window.userData.user = null;
        
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'index.html';
        }
        return false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    performInitialAuthCheck();
    await window.authState.init();
});

// Export function for reuse
window.validateTokenAndGetUserData = validateTokenAndGetUserData;