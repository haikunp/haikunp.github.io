

// Lazy Load Images (existing)
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
        }
    });
});

document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    observer.observe(img);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTicker();
    setInterval(loadTicker, 60000);
});