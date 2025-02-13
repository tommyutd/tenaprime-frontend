class Quiz {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.timer = null;
        this.questionTime = 10;
        this.timeLeft = this.questionTime;
        this.questions = [];
        this.questionIds = [];
        this.selectedAnswers = [];
        this.token = localStorage.getItem('login-token');
        
        // DOM Elements
        this.quizPage = document.getElementById('quiz-page');
        this.quizContainer = document.getElementById('quiz-container');
        this.welcomeScreen = document.getElementById('quiz-welcome-screen');
        this.quizScreen = document.getElementById('quiz-play-screen');
        this.resultsScreen = document.getElementById('quiz-results-screen');
        this.questionText = document.getElementById('question-text');
        this.optionsContainer = document.querySelector('.options-container');
        this.progressBar = document.querySelector('.progress');
        this.currentQuestionNum = document.getElementById('current-question');
        this.timerText = document.getElementById('timer-text');
        this.timerFill = document.querySelector('.timer-fill');
        this.finalScore = document.getElementById('final-score');
        this.timeDisplay = document.getElementById('time-display');
        this.messageScreen = document.getElementById('quiz-message-screen');
        this.messageTextElement = document.getElementById('quiz-message-text');
        this.messageButton = document.getElementById('quiz-message-button');
        this.messageScreen = document.getElementById('quiz-message-screen');

        // Add new screen references
        this.loadingScreen = document.getElementById('quiz-loading-screen');
        this.loadingText = document.getElementById('quiz-loading');
        this.countdownScreen = document.getElementById('quiz-countdown-screen');
        this.countdownNumber = document.querySelector('.countdown-number');

        document.querySelectorAll('.quiz-rules-btn').forEach(btn => btn.addEventListener('click', () => window.location.href = '/prizes/rules'));
        document.getElementById('quiz-start-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('quiz-retry-btn').addEventListener('click', () => this.resetQuiz());
        document.querySelectorAll('.quiz-scoreboard-btn').forEach(btn => btn.addEventListener('click', () => window.location.href = '/prizes/dashboard#scoreboard'));
    }

    async loadQuestions() {
        let responseMessage = null;
        try {
            const response = await fetch(`${window.CONFIG.API_URL}/play`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const jsonData = await response.json();

            responseMessage = jsonData.message;
    
            if (!response.ok) {
                throw new Error('Failed to load questions!');
            }

            this.questionIds = jsonData.questions.map(item => item._id);

            this.questions = jsonData.questions.map(item => {
                const question = item.question;

                const options = [...item.choices];
                for (let i = options.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [options[i], options[j]] = [options[j], options[i]];
                }
                return { question, options };
            });

            if (responseMessage) {
                return responseMessage;
            }
            else {
                throw new Error('Failed to load questions!');
            }
            
        } catch (error) {
            if (responseMessage) {
                return responseMessage;
            }
            console.error('Error loading questions:', error);
            return error;
        }
    }

    async startQuiz() {
        this.loadingText.setAttribute('data-text-key', 'quiz-loading');
        this.switchScreen('loading');

        try {
            const responseMessage = await this.loadQuestions();
            setTimeout(() => {
                if (!responseMessage || responseMessage !== 'Begin quiz') {
                    this.showMessage(responseMessage);
                    return;
                }
                this.startCountdown();
            }, 1000);
        } catch (error) {
            console.error('Failed to load questions:', error);
            this.switchScreen('welcome');
        }
    }

    startCountdown() {
        let count = 3;
        this.countdownNumber.textContent = count;
        this.switchScreen('countdown');

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.countdownNumber.textContent = count;
            } else {
                clearInterval(countdownInterval);
                this.loadQuestion();
                this.switchScreen('quiz');
            }
        }, 1000);
    }

    async loadQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            const responseMessage = await this.showResults();
            if (responseMessage) {
                this.showMessage(responseMessage);
            }
            return;
        }

        const question = this.questions[this.currentQuestion];
        this.questionText.textContent = question.question;
        this.optionsContainer.innerHTML = '';
        
        question.options.forEach((option) => {
            const button = document.createElement('div');
            button.className = 'option';
            button.textContent = option;
            button.addEventListener('click', () => this.selectAnswer(option));
            this.optionsContainer.appendChild(button);
        });

        this.updateProgress();
        this.startTimer();
        window.stringsLoaded.then(() => {
            updatePageStrings();
        }).catch(error => {
            console.error('Error updating strings:', error);
        });
    }

    selectAnswer(answer) {
        this.selectedAnswers.push({questionId: this.questionIds[this.currentQuestion], answer: answer});
        clearInterval(this.timer);
        this.currentQuestion++;
        this.loadQuestion();
    }

    startTimer() {
        this.timeLeft = 10;
        this.updateTimerDisplay();
        
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.selectAnswer("");
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerText.textContent = this.timeLeft;
        const percentage = (this.timeLeft / 10);
        this.timerFill.style.transform = `scaleY(${percentage})`;
    }

    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        const questionCounter = document.querySelector('.question-counter');
        questionCounter.setAttribute('data-text-key', 'quiz-question-counter');
        questionCounter.setAttribute('data-placeholder-current', (this.currentQuestion + 1).toString());
        questionCounter.setAttribute('data-placeholder-total', this.questions.length.toString());
    }

    async showResults() {
        let responseMessage = null;
        try {
            this.loadingText.setAttribute('data-text-key', 'quiz-loading-result');
            this.switchScreen('loading');

            const response = await fetch(`${window.CONFIG.API_URL}/play/submit`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${this.token}`, "Content-Type": "application/json" },
                body: JSON.stringify(this.selectedAnswers),
            });

            const resultData = await response.json();
            responseMessage = resultData.message;
            if (!response.ok) {
                throw new Error('Failed to submit answers');
            }

            this.score = resultData.score;
            this.timeTaken = resultData.timeTaken;
            this.bestScoreText = resultData.isNewBest ? '<span class="time-text-highlight">This is your new Best Score!</span><br>' : '';

            clearInterval(this.timer);
            this.finalScore.textContent = this.score;
            
            if (this.timeDisplay) {
                this.timeDisplay.setAttribute('data-text-key', 
                    this.timeTaken.minutes > 0 ? 'quiz-time-minutes' : 'quiz-time-seconds'
                );
                
                if (this.timeTaken.minutes > 0) {
                    this.timeDisplay.setAttribute('data-placeholder-minutes', 
                        this.timeTaken.minutes.toString().padStart(2, '0'));
                    this.timeDisplay.setAttribute('data-placeholder-seconds', 
                        this.timeTaken.seconds.toString().padStart(2, '0'));
                    this.timeDisplay.setAttribute('data-placeholder-milliseconds', 
                        this.timeTaken.milliseconds);
                } else {
                    this.timeDisplay.setAttribute('data-placeholder-seconds', 
                        this.timeTaken.seconds.toString().padStart(2, '0'));
                    this.timeDisplay.setAttribute('data-placeholder-milliseconds', 
                        this.timeTaken.milliseconds);
                }
                
                if (this.bestScoreText) {
                    const bestScoreElement = document.createElement('div');
                    bestScoreElement.className = 'best-score-text';
                    bestScoreElement.setAttribute('data-text-key', 'quiz-new-best-score');
                    this.timeDisplay.insertAdjacentElement('beforebegin', bestScoreElement);
                }
            }
            
            try {
                setTimeout(() => {
                    // Add celebration based on score
                    if (this.score === 15) {
                        grandCelebration();
                        const winnerText = document.createElement('div');
                        winnerText.className = 'winner-text';
                        winnerText.setAttribute('data-text-key', 'quiz-perfect-score');
                        this.resultsScreen.querySelector('.results-container').appendChild(winnerText);
                    } else if (this.score >= 12 && this.score < 15) {
                        normalCelebration();
                        const greatJobText = document.createElement('div');
                        greatJobText.className = 'great-job-text';
                        greatJobText.setAttribute('data-text-key', 'quiz-great-job');
                        this.resultsScreen.querySelector('.results-container').appendChild(greatJobText);
                    }
                }, 1000);
            } catch (error) {
                console.error('Error adding celebration:', error);
            }
            setTimeout(() => {
                this.switchScreen('results');
            }, 1000);
        } catch (error) {
            if (responseMessage) {
                return responseMessage;
            }
            console.error('Error loading questions:', error);
            return error;
        }
    }

    resetQuiz() {
        this.switchScreen('welcome');
        window.location.reload();
    }

    showMessage(messageText) {
        let messageKey = null;
        if (messageText === 'Maximum attempts reached') {
            messageKey = 'quiz-max-attempts';
        }
        else if (messageText === 'No questions found') {
            messageKey = 'quiz-no-questions';
        }
        else if (messageText === 'Quiz not found') {
            messageKey = 'quiz-not-found';
        }
        else if (messageText === 'Time limit exceeded') {
            messageKey = 'quiz-time-limit';
        }
        else if (messageText === 'Question not found') {
            messageKey = 'quiz-invalid-response';
        }
        else {
            messageKey = 'quiz-error-generic';
        }

        this.messageTextElement.setAttribute('data-text-key', messageKey);
        this.switchScreen('message');
    }

    switchScreen(screen) {
        this.welcomeScreen.classList.remove('active');
        this.loadingScreen.classList.remove('active');
        this.countdownScreen.classList.remove('active');
        this.quizScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');
        this.messageScreen.classList.remove('active');
        
        this.quizContainer.setAttribute('style', 'height: 0%;');

        setTimeout(() => {
            this.quizContainer.setAttribute('style', 'height: 60%;');
            this.quizPage.setAttribute('style', 'height: 80vh;');
            switch(screen) {
                case 'welcome':
                    this.quizContainer.setAttribute('style', 'justify-content: center;');
                    this.welcomeScreen.classList.add('active')
                    break;
                case 'loading':
                    this.quizContainer.setAttribute('style', 'justify-content: center;');
                    this.loadingScreen.classList.add('active');
                    break;
                case 'countdown':
                    this.quizContainer.setAttribute('style', 'justify-content: center;');
                    this.countdownScreen.classList.add('active');
                    break;
                case 'quiz':
                    this.quizPage.setAttribute('style', 'height: 130vh;');
                    this.quizContainer.setAttribute('style', 'justify-content: flex-start;');
                    this.quizScreen.classList.add('active');
                    break;
                case 'results':
                    this.quizPage.setAttribute('style', 'height: fit-content;');
                    this.quizContainer.setAttribute('style', 'justify-content: center;');
                    this.resultsScreen.classList.add('active');
                    break;
                case 'message':
                    this.quizContainer.setAttribute('style', 'justify-content: center;');
                    this.messageScreen.classList.add('active');
                    break;
            }
        }, 400);
        window.stringsLoaded.then(() => {
            updatePageStrings();
        }).catch(error => {
            console.error('Error updating strings:', error);
        });
    }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Quiz();
});

// Make sure confetti is available globally
window.confetti = confetti;

function normalCelebration() {
    const defaults = {
        spread: 360,
        ticks: 100,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['star'],
        colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8']
    };

    confetti({
        ...defaults,
        particleCount: 50,
        scalar: 1.2,
        shapes: ['star']
    });

    setTimeout(() => {
        confetti({
            ...defaults,
            particleCount: 30,
            scalar: 0.75,
            shapes: ['star']
        });
    }, 150);
}

function grandCelebration() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        shapes: ['star', 'circle']
    };

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8']
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            colors: ['#BA9C62', '#FFD700', '#FFA500', '#FF8C00']
        });
    }, 250);
}
