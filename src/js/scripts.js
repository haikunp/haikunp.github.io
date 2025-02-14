// This file contains JavaScript functionality for the website, including search functionality for the homepage.

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-bar');

    searchInput.addEventListener('keyup', function() {
        filterSongs();
    });

    function filterSongs() {
        const searchInput = document.getElementById('search-bar').value.toLowerCase();
        const songList = document.getElementById('song-list');
        const cards = songList.getElementsByClassName('card');

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const songTitle = card.getElementsByTagName('h4')[0].innerText.toLowerCase();
            if (songTitle.indexOf(searchInput) > -1) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        }
    }
});