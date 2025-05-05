document.addEventListener('DOMContentLoaded', () => {
    // Select the section whose background will change
    const winnersSection = document.querySelector('.winners-section');
    // Check if the winnersSection exists
    if (!winnersSection) {
      console.error('Error: .winners-section element not found.');
      return; // Stop execution if the element is missing
    }

    const cardData = [
      { image: '/assets/winners/img1.jpg', title: 'Henok Ayele', description: 'December 2024' },
      { image: '/assets/winners/img2.jpg', title: 'Title 2', description: 'Description 2' },
      { image: '/assets/winners/img3.jpg', title: 'Title 3', description: 'Description 3' },
      { image: '/assets/winners/img4.jpg', title: 'Title 4', description: 'Description 4' },
      { image: '/assets/winners/img5.jpg', title: 'Title 5', description: 'Description 5' },
    ];

    // Extract just the image URLs for background changes
    const backgroundImages = cardData.map(data => data.image);
    let currentImageIndex = 0; // Start with the first image

    // --- Remove card creation logic ---
    /*
    function createCard(data) {
      // ... card creation code removed ...
    }
    */

    // --- Remove initial card setup ---
    /*
    // 1. Previous card: ...
    // 2. Active card: ...
    // 3. Next cards: ...
    */

    let rotationInterval = setInterval(changeBackground, 5000); // Auto-rotate background

    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');

    // Check if buttons exist before adding listeners
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        clearInterval(rotationInterval);
        rotationInterval = null; // Stop auto-rotation
        changeBackground('prev'); // Change to previous background
        rotationInterval = setInterval(changeBackground, 5000); // Restart auto-rotation
      });
    } else {
      console.warn('Warning: .prev-button element not found.');
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        clearInterval(rotationInterval);
        rotationInterval = null; // Stop auto-rotation
        changeBackground('next'); // Change to next background
        rotationInterval = setInterval(changeBackground, 5000); // Restart auto-rotation
      });
    } else {
      console.warn('Warning: .next-button element not found.');
    }


    // --- Function to change the background image ---
    function changeBackground(direction = 'next') {
      if (backgroundImages.length === 0) return; // Do nothing if no images

      if (direction === 'next') {
        currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
      } else { // direction === 'prev'
        currentImageIndex = (currentImageIndex - 1 + backgroundImages.length) % backgroundImages.length;
      }

      // Update the background image
      winnersSection.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${backgroundImages[currentImageIndex]}')`;

      // If you want to update text elsewhere based on the current winner, you could do it here
      // For example:
      // const winnerTitleElement = document.querySelector('.winner-title'); // Assume this exists
      // const winnerDescElement = document.querySelector('.winner-description'); // Assume this exists
      // if (winnerTitleElement) winnerTitleElement.textContent = cardData[currentImageIndex].title;
      // if (winnerDescElement) winnerDescElement.textContent = cardData[currentImageIndex].description;
    }

    // --- Remove rotation logic based on card elements ---
    /*
    function rotateSlides(direction = '-') {
      // ... old card rotation logic removed ...
    }
    */

    // --- Optional: Pause rotation on hover (applied to the section now) ---
    /*
    winnersSection.addEventListener('mouseenter', () => {
      clearInterval(rotationInterval);
      rotationInterval = null;
    });

    winnersSection.addEventListener('mouseleave', () => {
      if (!rotationInterval) rotationInterval = setInterval(changeBackground, 5000);
    });
    */
  });
  