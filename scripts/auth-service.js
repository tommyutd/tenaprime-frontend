// Global states
window.userData = {
    user: null,
    isTokenValid: false
};

// Auth state management
window.authState = {
    isLoggedIn: false,
    checkLoginStatus: async function() {
        const isValid = await validateTokenAndGetUserData();
        this.isLoggedIn = isValid;
        return this.isLoggedIn;
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
}

// Token validation and user data fetch
async function validateTokenAndGetUserData() {
    try {
        const token = localStorage.getItem('login-token');
        
        if (!token) {
            window.userData.isTokenValid = false;
            window.userData.user = null;
            return false;
        }

        const response = await fetch('http://127.0.0.1:5000/api/v1/subscriber/me', {
            method: 'GET',
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

        return true;
    } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('login-token');
        window.userData.isTokenValid = false;
        window.userData.user = null;

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