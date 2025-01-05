document.addEventListener("DOMContentLoaded", function () {
    const articlesContainer = document.getElementById("articles");
    const loadMoreButton = document.getElementById("load-more");
    let currentPage = 1;
    const cardsPerPage = 10; // Number of cards to load per click

    // Fetch the articles from the JSON file
    fetch("articles.json")
        .then((response) => response.json())
        .then((data) => {
            let totalCards = data.length;

            // Function to load cards for the current page
            function loadCards() {
                let startIndex = (currentPage - 1) * cardsPerPage;
                let endIndex = startIndex + cardsPerPage;

                for (let i = startIndex; i < endIndex && i < totalCards; i++) {
                    const article = data[i];
                    const card = document.createElement("a");
                    card.href = article.file;
                    card.className = "card";

                    const image = document.createElement("img");
                    image.src = article.image;
                    image.alt = article.title;
                    image.loading = "lazy";
                    card.appendChild(image);

                    const title = document.createElement("h2");
                    title.textContent = article.title;
                    card.appendChild(title);

                    articlesContainer.appendChild(card);
                }

                // Hide the "Load More" button if all cards are loaded
                if (endIndex >= totalCards) {
                    loadMoreButton.style.display = "none";
                }
            }

            // Load initial set of cards
            loadCards();

            // Load more cards when the button is clicked
            loadMoreButton.addEventListener("click", () => {
                currentPage++;
                loadCards();
            });
        })
        .catch((error) => {
            console.error("Error loading articles:", error);
        });
});