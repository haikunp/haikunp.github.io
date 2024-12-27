document.addEventListener("DOMContentLoaded", async () => {
    const articleList = document.getElementById("article-list");
    const tagsContainer = document.getElementById("tags");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const searchBar = document.getElementById("searchBar");
    const searchBtn = document.getElementById("searchBtn");

    let articles = [];
    let articlesPerPage = 10; // Set to 10 articles per load
    let currentPage = 0;

    async function fetchArticles() {
        const response = await fetch('articles.json');
        const data = await response.json();
        return data;
    }

    function renderTags(tags) {
        tags.forEach(tag => {
            const tagBtn = document.createElement("button");
            tagBtn.textContent = tag;
            tagBtn.addEventListener("click", () => filterArticlesByTag(tag));
            tagsContainer.appendChild(tagBtn);
        });
    }

    function renderArticles(filteredArticles) {
        const startIndex = currentPage * articlesPerPage;
        const endIndex = startIndex + articlesPerPage;
        const articlesToRender = filteredArticles.slice(startIndex, endIndex);

        articlesToRender.forEach(article => {
            const articleCard = document.createElement("a");
            articleCard.href = article.url;
            articleCard.className = "article";
            articleCard.innerHTML = `
                <h2>${article.title}</h2>
                <p>${article.excerpt}</p>
            `;
            articleList.appendChild(articleCard);
        });

        if (endIndex >= filteredArticles.length) {
            loadMoreBtn.style.display = "none";
        }
    }

    function filterArticlesByTag(tag) {
        currentPage = 0;
        articleList.innerHTML = "";
        const filtered = articles.filter(article => article.tags.includes(tag));
        renderArticles(filtered);
    }

    searchBar.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            searchBtn.click();
        }
    });

    searchBtn.addEventListener("click", () => {
        const query = searchBar.value.toLowerCase();
        const filtered = articles.filter(article =>
            article.title.toLowerCase().includes(query) ||
            article.excerpt.toLowerCase().includes(query)
        );
        articleList.innerHTML = "";
        renderArticles(filtered);
    });

    loadMoreBtn.addEventListener("click", () => {
        currentPage++;
        renderArticles(articles);
    });

    async function init() {
        const data = await fetchArticles();
        articles = data.articles;
        renderTags(data.tags);
        renderArticles(articles);
    }

    init();
});
