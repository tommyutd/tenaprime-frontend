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

    // Add profile button if profile exists
    if (window.userData && window.userData.profile) {
        const statsFooter = statsPopup.querySelector('.stats-footer');
        const profileButton = document.createElement('button');
        profileButton.className = 'stats-profile-button aleo-text';
        profileButton.setAttribute('data-text-key', 'profile');
        profileButton.textContent = 'Profile';
        
        // Insert profile button before logout button
        statsFooter.insertBefore(profileButton, logoutButton);

        // Add click handler for profile button
        profileButton.addEventListener('click', function() {
            window.location.href = '/exercises/profile';
        });
    }

    // Show popup when clicking avatar
    avatar.addEventListener('click', async function(e) {
        e.stopPropagation();
        
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
        localStorage.removeItem('login-token');
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