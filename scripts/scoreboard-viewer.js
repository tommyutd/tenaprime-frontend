const token = localStorage.getItem('login-token');
const scoreboardBody = document.querySelector('.scoreboard-table-body');
const weekSelector = document.getElementById('weekSelector');

function getWeekSpan(weeksAgo) {
    // Create a fixed reference point at UTC midnight
    const now = new Date();
    const utcMidnight = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
    ));
    
    // Get the day of the week in UTC (0-6, where 0 is Sunday)
    const currentDay = utcMidnight.getUTCDay();
    
    // Calculate days to subtract to get to Monday
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    // Calculate the start of the week (Monday)
    const weekStart = new Date(utcMidnight);
    weekStart.setUTCDate(utcMidnight.getUTCDate() - daysToMonday - (weeksAgo * 7));
    
    // Calculate the end of the week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    
    // Format dates in UTC
    return `${formatDateUTC(weekStart)} - ${formatDateUTC(weekEnd)}`;
}

function formatDateUTC(date) {
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

function populateWeekSelector() {
    weekSelector.innerHTML = '';
    
    // Create options for current week and past 3 weeks
    for (let i = 0; i < 4; i++) {
        const option = document.createElement('option');
        option.value = i;
        
        option.textContent = getWeekSpan(i);
            
        weekSelector.appendChild(option);
    }
}

function formatTime(time) {
    const minutes = time.minutes.toString().padStart(2, '0');
    const seconds = time.seconds.toString().padStart(2, '0');
    const milliseconds = time.milliseconds.toString().padEnd(2, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
}

function displayScoreboard(scoreboardData) {
    scoreboardBody.innerHTML = '';
    
    scoreboardData.forEach((entry, index) => {
        const formattedTime = formatTime(entry.timeTaken);
        const scoreboardEntry = document.createElement('div');
        scoreboardEntry.className = 'scoreboard-entry';
        
        scoreboardEntry.innerHTML = `
            <div class="rank-column">${index + 1}</div>
            <div class="player-column">${entry.phone}</div>
            <div class="score-column">${entry.score}</div>
            <div class="time-column">${formattedTime}</div>
        `;
        
        scoreboardBody.appendChild(scoreboardEntry);
    });
}

function showLoading() {
    scoreboardBody.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner spinner-small"></div>
            <span data-text-key="loading-scoreboard">Loading scoreboard...</span>
        </div>
    `;
}

async function loadScoreboard() {
    try {
        showLoading();
        const weeksAgo = weekSelector.value;
        const response = await fetch(`${window.CONFIG.API_URL}/scoreboard?weeksago=${weeksAgo}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch scoreboard');
        }

        const data = await response.json();
        if (data.success && data.scoreboard) {
            displayScoreboard(data.scoreboard);
        }
    } catch (error) {
        console.error('Error loading scoreboard:', error);
        scoreboardBody.innerHTML = `
            <div class="scoreboard-error">
                Failed to load scoreboard data
            </div>
        `;
    }
}

// Initialize event listeners when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Populate week selector with date spans
    populateWeekSelector();
    
    // Load initial scoreboard
    loadScoreboard();
    
    // Add week selector change listener
    weekSelector?.addEventListener('change', loadScoreboard);
});
