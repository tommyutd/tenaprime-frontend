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
        this.startTime = null;
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

        // Add new screen references
        this.loadingScreen = document.getElementById('quiz-loading-screen');
        this.loadingText = document.getElementById('quiz-loading');
        this.countdownScreen = document.getElementById('quiz-countdown-screen');
        this.countdownNumber = document.querySelector('.countdown-number');

        document.getElementById('quiz-start-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('quiz-retry-btn').addEventListener('click', () => this.resetQuiz());
    }

    async loadQuestions() {
        try {
            const response = await fetch(`${window.CONFIG.API_URL}/play`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to load questions!');
            }

            const jsonData = await response.json();

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
            
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    }

    async startQuiz() {
        this.loadingText.textContent = 'Loading Quiz...';
        this.switchScreen('loading');

        try {
            await this.loadQuestions();
            setTimeout(() => {
                this.startCountdown();
            }, 2000);
        } catch (error) {
            console.error('Failed to load questions:', error);
            this.switchScreen('welcome');
        }
    }

    startCountdown() {
        this.switchScreen('countdown');
        let count = 3;
        this.countdownNumber.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.countdownNumber.textContent = count;
            } else {
                clearInterval(countdownInterval);
                this.startTime = new Date();
                this.switchScreen('quiz');
                this.loadQuestion();
            }
        }, 1000);
    }

    loadQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.showResults();
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
        this.currentQuestionNum.textContent = this.currentQuestion + 1;
    }

    async showResults() {
        this.loadingText.textContent = 'Loading Results...';
        this.switchScreen('loading');
        const response = await fetch(`${window.CONFIG.API_URL}/play/submit`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${this.token}`, "Content-Type": "application/json" },
            body: JSON.stringify(this.selectedAnswers),
        });
        if (!response.ok) {
            throw new Error('Failed to submit answers');
        }

        const resultData = await response.json();
        this.score = resultData.score;

        clearInterval(this.timer);
        this.switchScreen('results');
        this.finalScore.textContent = this.score;
        
        // Calculate time taken
        const endTime = new Date();
        const timeTaken = endTime - this.startTime;
        const minutes = Math.floor(timeTaken / 60000); // 1 minute = 60,000 ms
        const seconds = Math.floor((timeTaken % 60000) / 1000); // Remaining ms divided by 1000
        const milliseconds = timeTaken % 1000;
        
        if (this.timeDisplay) {
            this.timeDisplay.innerHTML = `You took <span id="time-text-highlight">${minutes}:${seconds}.${milliseconds}</span> minutes.`;
        }

        // Add celebration based on score
        if (this.score === 15) {
            // Perfect score celebration
            grandCelebration();
            const winnerText = document.createElement('div');
            winnerText.className = 'winner-text';
            winnerText.textContent = '🏆 Perfect Score! You are Amazing! 🏆';
            this.resultsScreen.querySelector('.results-container').appendChild(winnerText);
        } else if (this.score >= 12 && this.score < 15) {
            // Good score celebration
            normalCelebration();
            const greatJobText = document.createElement('div');
            greatJobText.className = 'great-job-text';
            greatJobText.textContent = '🌟 Great Job! 🌟';
            this.resultsScreen.querySelector('.results-container').appendChild(greatJobText);
        }
    }

    resetQuiz() {
        this.switchScreen('welcome');
        window.location.reload();
    }

    switchScreen(screen) {
        clearInterval(this.timer);
        this.welcomeScreen.classList.remove('active');
        this.loadingScreen.classList.remove('active');
        this.countdownScreen.classList.remove('active');
        this.quizScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');
        this.quizContainer.setAttribute('style', 'height: 0%;');

        setTimeout(() => {
            this.quizContainer.setAttribute('style', 'height: 60%;');
            switch(screen) {
                case 'welcome':
                    this.quizPage.setAttribute('style', 'height: 80vh;');
                    this.quizContainer.setAttribute('style', 'justify-content: center;');
                    this.welcomeScreen.classList.add('active')
                    break;
                case 'loading':
                    this.quizPage.setAttribute('style', 'height: 80vh;');
                    this.quizContainer.setAttribute('style', 'justify-content: center;');
                    this.loadingScreen.classList.add('active');
                    break;
                case 'countdown':
                    this.quizPage.setAttribute('style', 'height: 80vh;');
                    this.quizContainer.setAttribute('style', 'justify-content: center;');
                    this.countdownScreen.classList.add('active');
                    break;
                case 'quiz':
                    this.quizPage.setAttribute('style', 'height: 130vh;');
                    this.quizContainer.setAttribute('style', 'justify-content: flex-start;');
                    this.quizScreen.classList.add('active');
                    break;
                case 'results':
                    this.quizPage.setAttribute('style', 'height: 80vh;');
                    this.quizContainer.setAttribute('style', 'justify-content: center;');
                    this.resultsScreen.classList.add('active');
                    break;
            }
        }, 400);
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
}
