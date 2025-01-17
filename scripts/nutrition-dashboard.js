document.addEventListener('DOMContentLoaded', function() {
  const categories = document.querySelectorAll('.category-item');
  const sections = document.querySelectorAll('.content-section');
  
  categories.forEach(category => {
    category.addEventListener('click', () => {
      // Remove active class from all categories
      categories.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked category
      category.classList.add('active');
      
      // Hide all sections
      sections.forEach(section => section.style.display = 'none');
      
      // Show selected section
      const targetSection = document.querySelector(`.content-section[data-category="${category.dataset.category}"]`);
      if (targetSection) {
        targetSection.style.display = 'block';
      }
    });
  });
});
