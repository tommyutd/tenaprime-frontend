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
            <h3 data-text-key="winners-carousel-title">${data.title}</h3>
            <p data-text-key="winners-carousel-description">${data.description}</p>
        `;
        return card;
    }

    let dataIndex = 1; // Track which card data to show next
    let isRotating = false;

    // Add the initial three cards
    previousCard = createCard(cardData[cardData.length - 1]);
    carousel.appendChild(previousCard);
    
    currentCard = createCard(cardData[0]);
    carousel.appendChild(currentCard);
    
    nextCard = createCard(cardData[1]);
    carousel.appendChild(nextCard);

    carousel.children[1].classList.add('active');

    let rotationInterval = null; // Initialize as null
    let isPaused = false;

    // Add mouse event listeners to the carousel
    carousel.addEventListener('mouseenter', (e) => {
        isPaused = true;
        if (window.carouselInterval) {
            clearInterval(window.carouselInterval);
            window.carouselInterval = null;
        }
        // Only remove active class if directly hovering a card
        if (e.target.closest('.card')) {
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('active');
            });
        } else {
            // If entering carousel but not on a card, ensure center card is active
            carousel.children[1].classList.add('active');
        }
    });

    carousel.addEventListener('mouseleave', () => {
        isPaused = false;
        if (!window.carouselInterval) {
            window.carouselInterval = setInterval(rotateSlides, 5000);
        }
        // When leaving carousel, make center card active
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('active');
        });
        carousel.children[1].classList.add('active');
    });

    // Add hover handlers for individual cards
    carousel.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.card');
        if (card) {
            // Remove active class from all cards when hovering any card
            document.querySelectorAll('.card').forEach(c => {
                c.classList.remove('active');
            });
        }
    });

    carousel.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.card');
        if (card) {
            // If mouse leaves a card but is still in carousel, 
            // and not entering another card, restore active state to center card
            const toElement = e.relatedTarget;
            if (!toElement.closest('.card') && carousel.contains(toElement)) {
                carousel.children[1].classList.add('active');
            }
        }
    });

    // Initialize the rotation
    if (!window.carouselInterval) {
        window.carouselInterval = setInterval(rotateSlides, 5000);
    }

    function rotateSlides() {
        if (isRotating) {
            //console.log('Rotation in progress, skipping...');
            return;
        }
        
        isRotating = true;
        //console.log('Starting rotation, cards count:', carousel.children.length);
        
        const firstCard = carousel.firstElementChild;
        const cards = document.querySelectorAll('.card');
        const cardWidth = cards[0].offsetWidth + 20;
        
        firstCard.classList.add('fade-out');
        
        // Create and add new card with initial fade-in class
        dataIndex = (dataIndex + 1) % cardData.length;
        const newCard = createCard(cardData[dataIndex]);
        newCard.classList.add('next', 'fade-in');
        carousel.appendChild(newCard);
        
        // Remove the fade-in class after a brief delay to trigger the animation
        setTimeout(() => {
            newCard.classList.remove('fade-in');
        }, 50);
        
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
                //console.log('Removing excess card, count:', carousel.children.length);
                carousel.removeChild(carousel.firstChild);
            }
            
            // Restore transition
            setTimeout(() => {
                carousel.style.transition = 'transform 0.5s ease-in-out';
                isRotating = false; // Reset the rotation flag
                //console.log('Rotation complete, cards count:', carousel.children.length);
            }, 50);
            
            currentIndex = 1;
        }, 500);
    }
});