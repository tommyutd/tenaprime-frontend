document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const cardData = [
        { image: 'assets/winners/img1.png', title: 'Title 1', description: 'Description 1' },
        { image: 'assets/winners/img2.png', title: 'Title 2', description: 'Description 2' },
        { image: 'assets/winners/img3.png', title: 'Title 3', description: 'Description 3' },
        { image: 'assets/winners/img4.png', title: 'Title 4', description: 'Description 4' },
        { image: 'assets/winners/img5.png', title: 'Title 5', description: 'Description 5' },
    ];

    // Function to create a card element
    function createCard(data) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${data.image}" alt="${data.title}">
            <h3>${data.title}</h3>
            <p>${data.description}</p>
        `;
        return card;
    }

    function rotateSlides() {
        const firstCard = carousel.firstElementChild;
        const cards = document.querySelectorAll('.card');
        const cardWidth = cards[0].offsetWidth + 20;
        
        dataIndex = (dataIndex + 1) % cardData.length;
        const newCard = createCard(cardData[dataIndex]);
        newCard.classList.add('next');
        carousel.appendChild(newCard);
        
        carousel.style.transform = `translateX(-${cardWidth}px)`;
        carousel.children[1].classList.remove('active');
        if (!carousel.children[2].matches(':hover')) {
            carousel.children[2].classList.add('active');
        }
        
        setTimeout(() => {
            carousel.style.transition = 'none';
            carousel.style.transform = 'translateX(0)';
            carousel.removeChild(firstCard);
            
            setTimeout(() => {
                carousel.style.transition = 'transform 0.5s ease-in-out';
            }, 50);
            
            currentIndex = 1;
        }, 500);
    }

    // Add only the initial three cards needed for display
    // Add the last card first (for the left position)
    previousCard = createCard(cardData[cardData.length - 1]);
    carousel.appendChild(previousCard);
    
    // Add the first card (will be emphasized in center)
    currentCard = createCard(cardData[0]);
    carousel.appendChild(currentCard);
    
    // Add the second card (for the right position)
    nextCard = createCard(cardData[1]);
    carousel.appendChild(nextCard);

    let dataIndex = 1; // Track which card data to show next

    carousel.children[1].classList.add('active');

    let rotationInterval;
    let isPaused = false;

    // Add mouse event listeners to the carousel
    carousel.addEventListener('mouseenter', () => {
        isPaused = true;
        clearInterval(rotationInterval);
    });

    carousel.addEventListener('mouseleave', () => {
        isPaused = false;
        rotationInterval = setInterval(rotateSlides, 5000);
    });

    // Add event listeners to handle hover states
    carousel.addEventListener('mouseover', (e) => {
        if (e.target.closest('.card')) {
            // Remove active class from all cards
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('active');
            });
        }
    });

    carousel.addEventListener('mouseout', (e) => {
        if (e.target.closest('.card')) {
            // When mouse leaves a card, make the center card active again
            if (!carousel.matches(':hover')) {
                carousel.children[1].classList.add('active');
            }
        }
    });

    // Initialize the rotation
    rotationInterval = setInterval(rotateSlides, 5000);
});