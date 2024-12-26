document.addEventListener('DOMContentLoaded', () => {
    let currentArticles = [];
    let allArticles = [];
    let articleCount = 10;

    // Load articles and tags from articles.json
    fetch('articles.json')
        .then(response => response.json())
        .then(data => {
            allArticles = data.articles;
            currentArticles = allArticles.slice(0, articleCount);
            renderArticles();
            renderTags();
        })
        .catch(error => {
            console.error('Error loading articles:', error);
        });

    // Function to render articles
    function renderArticles() {
        const articleList = document.getElementById('article-list');
        articleList.innerHTML = ''; // Clear the list

        currentArticles.forEach(article => {
            const articleDiv = document.createElement('div');
            articleDiv.classList.add('article');
            articleDiv.innerHTML = `
                <h2>${article.title}</h2>
                <p>${article.excerpt}</p>
                <button onclick="window.location.href='${article.url}'">Read More</button>
            `;
            articleList.appendChild(articleDiv);
        });
    }

    // Function to render tags for filtering
    function renderTags() {
        const tagsContainer = document.getElementById('tags');
        const tags = [...new Set(allArticles.flatMap(article => article.tags))]; // Unique tags
        tagsContainer.innerHTML = '';

        tags.forEach(tag => {
            const tagButton = document.createElement('button');
            tagButton.textContent = tag;
            tagButton.onclick = () => filterByTag(tag);
            tagsContainer.appendChild(tagButton);
        });
    }

    // Function to filter articles by tag
    function filterByTag(tag) {
        currentArticles = allArticles.filter(article => article.tags.includes(tag));
        renderArticles();
    }

    function handleSearch() {
        const searchQuery = document.getElementById('searchBar').value.toLowerCase(); // Convert to lowercase
        currentArticles = allArticles.filter(article => {
            // Check if the search query matches any part of the article content, title, or tags
            return article.title.toLowerCase().includes(searchQuery) || 
                   article.content.toLowerCase().includes(searchQuery) ||
                   article.tags.some(tag => tag.toLowerCase().includes(searchQuery));
        });
        renderArticles();
    }
    

    // Search event listener for both the search button and Enter key
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchBar').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Load more articles
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        articleCount += 10;
        currentArticles = allArticles.slice(0, articleCount);
        renderArticles();
    });
});
