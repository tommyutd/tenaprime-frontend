document.addEventListener('DOMContentLoaded', async function() {
    // Wait for auth state to be initialized
    if (window.authState) {
        await window.authState.init();
    }
    initializeUserStats();
});

function initializeUserStats() {
    // If user is not logged in, don't create stats popup functionality
    if (!window.authState || !window.authState.isTokenPresent) {
        return;
    }

    const avatar = document.querySelector('.avatar');
    if (!avatar) {
        console.error('Avatar element not found');
        return;
    }

    // Create new click handler
    const clickHandler = async function(e) {
        e.stopPropagation();
        // Check auth state on every click
        if (window.authState) {
            await window.authState.init();
        }

        if (window.authState && window.authState.isTokenPresent) {
            createStatsPopup();
        }
    };

    // Store the listener reference
    avatar._clickHandler = clickHandler;

    // Add new click event listener to avatar
    avatar.addEventListener('click', clickHandler);

    // Add this after the avatar declaration (line 7)
    avatar.style.position = 'relative';

    // Create stats popup HTML
    const statsPopupHTML = `
        <div class="stats-popup aleo-text" id="statsPopup">
            <div class="stats-container">
                <div class="stats-header">
                    <h2 data-text-key="stats-title">Your Stats</h2>
                    <button class="close-button" id="closeStats">&times;</button>
                </div>
                <div class="stats-content">
                    <div class="stats-item">
                        <span class="stats-label" data-text-key="workout-streak">Workout Streak</span>
                        <span class="stats-value">5 <span data-text-key="days">days</span></span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-label" data-text-key="points-earned">Points Earned</span>
                        <span class="stats-value">250 <span data-text-key="points">points</span></span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-label" data-text-key="completed-workouts">Completed Workouts</span>
                        <span class="stats-value">12</span>
                    </div>
                </div>
                <div class="stats-footer">
                    <button class="logout-button" data-text-key="logout">Logout</button>
                </div>
            </div>
        </div>
    `;

    // Function to create and append stats popup
    function createStatsPopup() {
        if (!document.getElementById('statsPopup')) {
            document.body.insertAdjacentHTML('beforeend', statsPopupHTML);
            
            const statsPopup = document.getElementById('statsPopup');
            const closeButton = document.getElementById('closeStats');
            const statsContainer = statsPopup.querySelector('.stats-container');
            const logoutButton = statsPopup.querySelector('.logout-button');

            // Position the popup relative to the avatar
            const avatarRect = avatar.getBoundingClientRect();
            statsPopup.style.position = 'fixed';
            statsPopup.style.top = `${avatarRect.bottom + window.scrollY}px`;
            statsPopup.style.left = `${avatarRect.left + (avatarRect.width / 2)}px`;

            // Update text based on current language
            const currentLang = document.querySelector('.language-selector p').textContent.toLowerCase();
            const textElements = statsPopup.querySelectorAll('[data-text-key]');
            textElements.forEach(element => {
                const key = element.dataset.textKey;
                element.innerHTML = currentLang === 'en' ? window.englishStrings[key] : window.amharicStrings[key];
            });

            // Add event listeners
            closeButton.addEventListener('click', function() {
                statsPopup.classList.remove('show');
                statsContainer.classList.remove('show');
                setTimeout(() => {
                    statsPopup.style.display = 'none';
                }, 300);
            });

            logoutButton.addEventListener('click', async function() {
                localStorage.removeItem('login-token');
                window.location.href = 'index.html';
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
        }

        // Show the popup with animation
        const statsPopup = document.getElementById('statsPopup');
        const statsContainer = statsPopup.querySelector('.stats-container');
        
        statsPopup.style.display = 'block';
        statsPopup.offsetHeight; // Trigger reflow
        
        statsPopup.classList.add('show');
        statsContainer.classList.add('show');
    }
} 