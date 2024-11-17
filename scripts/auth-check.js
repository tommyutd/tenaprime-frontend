window.authState = {
    isLoggedIn: false,
    checkLoginStatus: async function() {
        const isValid = await window.validateTokenAndGetUserData();
        this.isLoggedIn = isValid;
        return this.isLoggedIn;
    },
    updateUI: function() {
        const guestContent = document.querySelector('.guest-content');
        const userContent = document.querySelector('.user-content');
        
        if (this.isLoggedIn) {
            if (guestContent) guestContent.style.display = 'none';
            if (userContent) userContent.style.display = 'block';
            
            // Update navigation items if needed
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

document.addEventListener('DOMContentLoaded', function() {
    window.authState.init();
});
