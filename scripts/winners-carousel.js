document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    
    // Clear any existing cards first
    while (carousel.firstChild) {
        carousel.removeChild(carousel.firstChild);
    }
    
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
        
        // Create and add new card
        dataIndex = (dataIndex + 1) % cardData.length;
        const newCard = createCard(cardData[dataIndex]);
        newCard.classList.add('next');
        carousel.appendChild(newCard);
        
        // Animate the carousel
        carousel.style.transform = `translateX(-${cardWidth}px)`;
        
        // Update active states
        Array.from(carousel.children).forEach(card => card.classList.remove('active'));
        if (!carousel.children[2].matches(':hover')) {
            carousel.children[2].classList.add('active');
        }
        
        // After animation completes
        setTimeout(() => {
            // Remove transition temporarily
            carousel.style.transition = 'none';
            
            // Reset position
            carousel.style.transform = 'translateX(0)';
            
            // Ensure first card is removed
            if (firstCard && firstCard.parentNode === carousel) {
                carousel.removeChild(firstCard);
            }
            
            // Clean up any excess cards (there should only be 3)
            while (carousel.children.length > 3) {
                carousel.removeChild(carousel.firstChild);
            }
            
            // Restore transition
            setTimeout(() => {
                carousel.style.transition = 'transform 0.5s ease-in-out';
            }, 50);
            
            currentIndex = 1;
        }, 500);
    }

    // Add the initial three cards
    previousCard = createCard(cardData[cardData.length - 1]);
    carousel.appendChild(previousCard);
    
    currentCard = createCard(cardData[0]);
    carousel.appendChild(currentCard);
    
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