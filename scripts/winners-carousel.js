document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
  
    // Clear any existing cards
    carousel.innerHTML = '';
  
    const cardData = [
      { image: '/assets/winners/img1.png', title: 'Henok Ayele', description: 'December 2024' },
      { image: '/assets/winners/img2.png', title: 'Title 2', description: 'Description 2' },
      { image: '/assets/winners/img3.png', title: 'Title 3', description: 'Description 3' },
      { image: '/assets/winners/img4.png', title: 'Title 4', description: 'Description 4' },
      { image: '/assets/winners/img5.png', title: 'Title 5', description: 'Description 5' },
    ];
  
    // Function to create a card element
    function createCard(data) {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <div class="card-image">
          <img src="${data.image}" alt="${data.title}">
        </div>
        <div class="card-text">
          <h3>${data.title}</h3>
          <p>${data.description}</p>
        </div>
      `;
      return card;
    }
  
    // --- Build the initial carousel in circular order ---
    // 1. Previous card: Use the second-to-last item from cardData.
    const prevCard = createCard(cardData[cardData.length - 2]);
    prevCard.classList.add('prev');
    carousel.appendChild(prevCard);
  
    // 2. Active card: Last item in cardData.
    const activeCard = createCard(cardData[cardData.length - 1]);
    activeCard.classList.add('active');
    carousel.appendChild(activeCard);
  
    // 3. Next cards: Add all cards except the last two
    cardData.slice(0, -2).forEach((data, index) => {
      const card = createCard(data);
      if (index === 0) card.classList.add('next'); // Mark the first of these as "next"
      carousel.appendChild(card);
    });
  
    // Set initial transform so the active card is centered
    //carousel.style.transform = `translateX(${centerActiveCard()}px)`;
  
    let isRotating = false;
    let rotationInterval = setInterval(rotateSlides, 5000);

    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');

    prevButton.addEventListener('click', () => {
      clearInterval(rotationInterval);
      rotationInterval = null;
      rotateSlides('+');
      rotationInterval = setInterval(rotateSlides, 5000);
    });
    
    nextButton.addEventListener('click', () => {
      clearInterval(rotationInterval);
      rotationInterval = null;
      rotateSlides('-');
      rotationInterval = setInterval(rotateSlides, 5000);
    });
  
    // --- Rotate Slides ---
    function rotateSlides(direction = '-') {
      if (isRotating) return;
      isRotating = true;
  
      // Calculate the offset for the transition
      const next = direction === '-' ? carousel.children[2] : carousel.children[0];
      const newOffset = next.offsetWidth;
  
      // Animate the transition
      carousel.style.transition = 'transform 0.5s ease-in-out';
      carousel.style.transform = `translateX(${direction}${newOffset}px)`;
  
      Array.from(carousel.children).forEach(card => {
        card.classList.remove('prev', 'active', 'next');
      });
  
      setTimeout(() => {
        carousel.style.transition = 'none';
        carousel.style.transform = 'translateX(0)';
  
        if (direction === '-') {
          // Forward rotation: move first card to end
          const firstCard = carousel.firstElementChild;
          carousel.appendChild(firstCard);
        } else {
          // Backward rotation: move last card to front
          const lastCard = carousel.lastElementChild;
          carousel.insertBefore(lastCard, carousel.firstElementChild);
        }
  
        // Update classes for the visible cards
        if (carousel.children[0]) carousel.children[0].classList.add('prev');
        if (carousel.children[1]) carousel.children[1].classList.add('active');
        if (carousel.children[2]) carousel.children[2].classList.add('next');
  
        isRotating = false;
      }, 500);
    }
  
    // --- Optional: Pause rotation on hover ---
    //carousel.addEventListener('mouseenter', () => {
      //clearInterval(rotationInterval);
      //rotationInterval = null;
    //});
  
    //carousel.addEventListener('mouseleave', () => {
      //if (!rotationInterval) rotationInterval = setInterval(rotateSlides, 5000);
    //});
  });
  