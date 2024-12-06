document.addEventListener('DOMContentLoaded', function() {
    const avatar = document.querySelector('.avatar');
    const statsPopup = document.getElementById('statsPopup');
    const statsContainer = statsPopup.querySelector('.stats-container');
    const closeButton = document.getElementById('closeStats');

    if (!avatar || !statsPopup || !statsContainer || !closeButton) {
        console.error('Required elements not found');
        return;
    }

    // Show popup when clicking avatar
    avatar.addEventListener('click', async function(e) {
        e.stopPropagation();
        
        // Check if user is authenticated
        if (window.authState && window.authState.isTokenPresent) {
            statsPopup.style.display = 'block';
            statsPopup.offsetHeight;
            statsPopup.classList.add('show');
            statsContainer.classList.add('show');
        }
    });

    // Close popup when clicking close button
    closeButton.addEventListener('click', function() {
        statsPopup.classList.remove('show');
        statsContainer.classList.remove('show');
        setTimeout(() => {
            statsPopup.style.display = 'none';
        }, 300);
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