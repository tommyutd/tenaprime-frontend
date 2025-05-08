document.addEventListener("DOMContentLoaded", function() {
    const slidesContainer = document.querySelector('.trainer-gallery-slides');
    const slides = document.querySelectorAll('.trainer-gallery-slide');
    const dots = document.querySelectorAll('.trainer-gallery-dot');
    const prevBtn = document.querySelector('.trainer-gallery-nav.prev-btn');
    const nextBtn = document.querySelector('.trainer-gallery-nav.next-btn');
    let currentSlide = 0;
    let slideInterval;
    
    // Initialize slides
    function initSlides() {
      // Set initial positions
      slides.forEach((slide, index) => {
        slide.style.transform = `translateX(${(index - currentSlide) * 100}%)`;
      });
    }
    
    // Start automatic slideshow
    function startSlideshow() {
      slideInterval = setInterval(() => nextSlide(), 5000);
    }
    
    // Show a specific slide with direction (1 for next, -1 for prev)
    function showSlide(index, direction = 1) {
      // Update dots
      dots.forEach(dot => dot.classList.remove('active'));
      dots[index].classList.add('active');
      
      // Move all slides
      slides.forEach((slide, i) => {
        // Calculate new position
        let position = (i - index) * 100;
        slide.style.transition = 'transform 0.5s ease-in-out';
        slide.style.transform = `translateX(${position}%)`;
      });
      
      // Update current slide
      currentSlide = index;
    }
    
    // Next slide function
    function nextSlide() {
      const next = (currentSlide + 1) % slides.length;
      showSlide(next, 1);
    }
    
    // Previous slide function
    function prevSlide() {
      const prev = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(prev, -1);
    }
    
    // Event listeners for buttons
    if (prevBtn) prevBtn.addEventListener('click', function() {
      clearInterval(slideInterval); // Stop automatic rotation
      prevSlide();
      startSlideshow(); // Restart automatic rotation
    });
    
    if (nextBtn) nextBtn.addEventListener('click', function() {
      clearInterval(slideInterval); // Stop automatic rotation
      nextSlide();
      startSlideshow(); // Restart automatic rotation
    });
    
    // Event listeners for dots
    dots.forEach(dot => {
      dot.addEventListener('click', function() {
        clearInterval(slideInterval); // Stop automatic rotation
        const index = parseInt(this.getAttribute('data-index'));
        const direction = index > currentSlide ? 1 : -1;
        showSlide(index, direction);
        startSlideshow(); // Restart automatic rotation
      });
    });
    
    // Initialize and start the slideshow
    if (slides.length > 0) {
      initSlides();
      startSlideshow();
    }
  });