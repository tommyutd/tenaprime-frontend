// Gallery slider functionality
document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll('.our-gym-gallery-slide');
    const dots = document.querySelectorAll('.our-gym-gallery-dot');
    const prevBtn = document.querySelector('.our-gym-gallery-nav.prev-btn');
    const nextBtn = document.querySelector('.our-gym-gallery-nav.next-btn');
    let currentSlide = 0;
    let slideInterval;
    
    // Start automatic slideshow
    function startSlideshow() {
      slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }
    
    // Show a specific slide
    function showSlide(index) {
      // Remove active class from all slides and dots
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      // Add active class to current slide and dot
      slides[index].classList.add('active');
      dots[index].classList.add('active');
    }
    
    // Next slide function
    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }
    
    // Previous slide function
    function prevSlide() {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
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
        currentSlide = parseInt(this.getAttribute('data-index'));
        showSlide(currentSlide);
        startSlideshow(); // Restart automatic rotation
      });
    });
    
    // Start the slideshow
    if (slides.length > 0) {
      startSlideshow();
    }
  });