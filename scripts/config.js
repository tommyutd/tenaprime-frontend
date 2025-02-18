const CONFIG = {
  API_URL: 'https://b1rgd2rv-9825.euw.devtunnels.ms/api/v1',
  // Add other configuration values here as needed
};

// Initialize theme before DOM loads
(function() {
  const theme = localStorage.getItem('app-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
})();

// Make config available globally
window.CONFIG = CONFIG;