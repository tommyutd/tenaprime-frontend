// Global state for user data
window.userData = {
    user: null,
    isTokenValid: false
};

async function validateTokenAndGetUserData() {
    const token = localStorage.getItem('login-token');
    
    if (!token) {
        window.userData.isTokenValid = false;
        window.userData.user = null;
        return false;
    }

    try {
        // Verify token and get user data
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
        
        // Update global state
        window.userData.isTokenValid = true;
        window.userData.user = userData;
        
        // Update existing auth state
        if (window.authState) {
            window.authState.isLoggedIn = true;
            window.authState.updateUI();
        }

        return true;
    } catch (error) {
        console.error('Token validation error:', error);
        
        // Clear invalid token
        localStorage.removeItem('login-token');
        
        // Update states
        window.userData.isTokenValid = false;
        window.userData.user = null;
        
        if (window.authState) {
            window.authState.isLoggedIn = false;
            window.authState.updateUI();
        }

        return false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    await validateTokenAndGetUserData();
});

// Export function for reuse
window.validateTokenAndGetUserData = validateTokenAndGetUserData; 