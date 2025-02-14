// Sample song data
const songs = [
    {
        id: 1,
        title: "Kutu Ma Kutu",
        artist: "Nepal Idol",
        genre: "pop",
        lyrics: {
            nepali: "कुटु मा कुटु, नाचेरी प उत्पादन\nगोरी लाई-redux प ऐसी रे",
            english: "In the mill, we crush and flatten,\nMy love, I will never forget you,",
            hindi: "पीसो में पीसो, नाचने वाली प उत्पाद\nगोरी व्यक्ति ले जाने वाली ह"
        }
    },
    {
        id: 2,
        title: "Resham",
        artist: "Nepathya",
        genre: "folk",
        lyrics: {
            nepali: "रेशम रेशम",
            english: "Softly flows the silk",
            hindi: "रेशम रेशम"
        }
    }
];

// Filter songs by genre
function filterSongs(genre) {
    const filteredSongs = songs.filter(song => 
        genre === 'all' ? true : song.genre === genre
    );
    displaySongs(filteredSongs);
}

// Display songs in grid
function displaySongs(songs) {
    const songList = document.getElementById('songList');
    songList.innerHTML = '';

    songs.forEach(song => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
            <h3 class="song-title">${song.title}</h3>
            <p class="song-artist">By ${song.artist}</p>
            <p class="song-genre">${song.genre}</p>
            <a href="#" class="view-lyrics">View Lyrics</a>
        `;
        songList.appendChild(songCard);
    });
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm) ||
        song.genre.toLowerCase().includes(searchTerm)
    );
    displaySongs(filteredSongs);
});

// Event listeners for genre filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        const genre = btn.dataset.genre;
        filterSongs(genre);
    });
});

// Initial load
displaySongs(songs);
