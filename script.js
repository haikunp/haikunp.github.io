document.addEventListener('DOMContentLoaded', () => {
    const articleGrid = document.getElementById('article-grid');
    const loadMoreButton = document.getElementById('load-more');
  
    // Simulated data for additional articles
    const additionalArticles = [
      { title: "Crypto Mining Explained", content: "Learn how crypto mining works and its impact." },
      { title: "Understanding NFTs", content: "Discover the world of non-fungible tokens." },
      { title: "DeFi: The Future of Finance?", content: "Explore decentralized finance and its potential." },
      { title: "Crypto Tax Guide", content: "Everything you need to know about crypto taxes." },
      { title: "Blockchain Technology Basics", content: "A beginner's guide to blockchain technology." },
    ];
  
    let currentIndex = 0;
  
    // Function to load more articles
    function loadMoreArticles() {
      const nextArticles = additionalArticles.slice(currentIndex, currentIndex + 3);
      nextArticles.forEach(article => {
        const articleElement = document.createElement('article');
        articleElement.classList.add('card');
        articleElement.innerHTML = `
          <h3>${article.title}</h3>
          <p>${article.content}</p>
        `;
        articleGrid.appendChild(articleElement);
      });
  
      currentIndex += 3;
  
      // Hide the button if no more articles are left
      if (currentIndex >= additionalArticles.length) {
        loadMoreButton.style.display = 'none';
      }
    }
  
    // Event listener for the Load More button
    loadMoreButton.addEventListener('click', loadMoreArticles);
  });