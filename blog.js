document.addEventListener("DOMContentLoaded", function () {
    const articlesContainer = document.getElementById("articles");
    const loadMoreButton = document.getElementById("load-more");
    let currentPage = 1;
    const cardsPerPage = 15;
    let articlesData = [];
    let totalCards = 0;

    // Function to create and append article cards
    function createCard(article) {
        const card = document.createElement("a");
        card.href = article.file;
        card.className = "card";
        card.setAttribute("aria-label", article.title);

        const image = document.createElement("img");
        image.src = article.image;
        image.alt = article.title;
        image.loading = "lazy";
        image.onerror = () => {
            image.src = "fallback-image.jpg"; // Fallback image for broken links
            image.alt = "Image not available";
        };
        card.appendChild(image);

        const title = document.createElement("h2");
        title.textContent = article.title;
        card.appendChild(title);

        return card;
    }

    // Function to load articles dynamically
    function loadCards() {
        const fragment = document.createDocumentFragment();
        const startIndex = (currentPage - 1) * cardsPerPage;
        const endIndex = Math.min(startIndex + cardsPerPage, totalCards);

        for (let i = startIndex; i < endIndex; i++) {
            const card = createCard(articlesData[i]);
            fragment.appendChild(card);
        }

        articlesContainer.appendChild(fragment);

        // Hide the "Load More" button if all articles are loaded
        if (endIndex >= totalCards) {
            loadMoreButton.style.display = "none";
        }
    }

    // Function to initialize the articles
    function initializeArticles() {
        fetch("articles.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load articles.json");
                }
                return response.json();
            })
            .then((data) => {
                articlesData = data;
                totalCards = articlesData.length;

                if (totalCards === 0) {
                    loadMoreButton.style.display = "none";
                    const noArticlesMessage = document.createElement("p");
                    noArticlesMessage.textContent =
                        "No articles available at the moment. Please check back later.";
                    noArticlesMessage.className = "no-articles-message";
                    articlesContainer.appendChild(noArticlesMessage);
                } else {
                    loadCards();
                }
            })
            .catch((error) => {
                console.error("Error loading articles:", error);
                const errorMessage = document.createElement("p");
                errorMessage.textContent =
                    "Failed to load articles. Please try again later.";
                errorMessage.className = "error-message";
                articlesContainer.appendChild(errorMessage);
                loadMoreButton.style.display = "none";
            });
    }

    // Add event listener for the "Load More" button
    loadMoreButton.addEventListener("click", () => {
        currentPage++;
        loadCards();
    });

    // Initialize the articles on page load
    initializeArticles();
});
