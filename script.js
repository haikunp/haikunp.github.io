// Set active navigation state
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop().split('.')[0];
  const navLinks = document.querySelectorAll('.tab-button');
  
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop().split('.')[0];
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop().split('.')[0];
  
  // Set active navigation state
  if (['casinos', 'exchanges', 'faucets', 'games'].includes(currentPage)) {
    setActiveNav();
  }
});
