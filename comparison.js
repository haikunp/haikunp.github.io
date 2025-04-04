// Smooth scroll to top
document.querySelector('.top-button').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Collapsible sections with smooth animation
document.querySelectorAll('details.category-card').forEach(detail => {
    const summary = detail.querySelector('summary');
    const contentWrapper = detail.querySelector('.content-wrapper');

    summary.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = detail.open;

        if (isOpen) {
            contentWrapper.style.maxHeight = contentWrapper.scrollHeight + 'px';
            requestAnimationFrame(() => {
                contentWrapper.style.maxHeight = '0';
                setTimeout(() => detail.removeAttribute('open'), 300);
            });
        } else {
            detail.setAttribute('open', '');
            const contentHeight = contentWrapper.scrollHeight;
            contentWrapper.style.maxHeight = '0';
            requestAnimationFrame(() => {
                contentWrapper.style.maxHeight = contentHeight + 'px';
                setTimeout(() => contentWrapper.style.maxHeight = 'none', 300);
            });
        }
    });
});