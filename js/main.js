document.addEventListener("DOMContentLoaded", () => {
    const pricesContainer = document.getElementById("prices-container");

    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd")
        .then(response => response.json())
        .then(data => {
            pricesContainer.innerHTML = `
                <p>Bitcoin: $${data.bitcoin.usd}</p>
                <p>Ethereum: $${data.ethereum.usd}</p>
            `;
        })
        .catch(error => {
            pricesContainer.innerHTML = "<p>Failed to load prices. Try again later.</p>";
            console.error("Error fetching crypto prices:", error);
        });
});
