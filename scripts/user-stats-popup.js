document.addEventListener('DOMContentLoaded', async function() {
    if (window.authState) {
        await window.authState.init();
    }

    if (!window.authState || !window.authState.isTokenPresent) {
        return;
    }

    const avatar = document.querySelector('.avatar');
    const statsPopup = document.getElementById('statsPopup');
    const statsContainer = statsPopup.querySelector('.stats-container');
    const closeButton = document.getElementById('closeStats');
    const logoutButton = document.querySelector('.logout-button');

    if (!avatar || !statsPopup || !statsContainer || !closeButton || !logoutButton) {
        console.error('Required elements not found');
        return;
    }

    // Show popup when clicking avatar
    avatar.addEventListener('click', async function(e) {
        e.stopPropagation();
        
        // Check if user is authenticated
        statsPopup.style.display = 'block';
        statsPopup.offsetHeight;
        statsPopup.classList.add('show');
        statsContainer.classList.add('show');
    });

    // Close popup when clicking close button
    closeButton.addEventListener('click', function() {
        statsPopup.classList.remove('show');
        statsContainer.classList.remove('show');
        setTimeout(() => {
            statsPopup.style.display = 'none';
        }, 300);
    });

    // Handle logout
    logoutButton.addEventListener('click', function() {
        // Clear the login token
        localStorage.removeItem('login-token');
        
        // Redirect to index page
        window.location.href = '/';
    });

    // Close popup when clicking outside
    document.addEventListener('click', function(e) {
        if (!statsPopup.contains(e.target) && e.target !== avatar) {
            statsPopup.classList.remove('show');
            statsContainer.classList.remove('show');
            setTimeout(() => {
                statsPopup.style.display = 'none';
            }, 300);
        }
    });
}); 