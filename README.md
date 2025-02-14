# Nepali Lyrics Website

## Overview
The Nepali Lyrics Website is a static web project designed to display lyrics of Nepali songs in multiple languages. The website features a user-friendly interface that allows visitors to search for and view lyrics in Nepali, English, and Hindi, along with romanized versions of the lyrics.

## Project Structure
The project is organized as follows:

```
nepali-lyrics-website
├── src
│   ├── css
│   │   └── styles.css        # CSS styles for mobile-friendliness and visual appeal
│   ├── js
│   │   └── scripts.js        # JavaScript functionality for search and interactivity
│   ├── pages
│   │   ├── home.html         # Homepage with search functionality
│   │   ├── nepali.html       # Lyrics in Nepali script and romanized Nepali
│   │   ├── english.html       # Lyrics in English and romanized Nepali
│   │   └── hindi.html        # Lyrics in Hindi and romanized Nepali
│   └── assets
│       └── fonts             # Directory for font files
├── index.html                # Main entry point linking to various pages
├── README.md                 # Project documentation
└── .gitignore                # Files and directories to ignore in version control
```

## Setup Instructions
1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd nepali-lyrics-website
   ```

2. **Open the Project**: Use a web server or open `index.html` in your browser to view the website.

3. **Modify Content**: You can add or edit song lyrics in the respective HTML files located in the `src/pages` directory.

4. **Styling and Scripts**: Customize the styles in `src/css/styles.css` and add any additional JavaScript functionality in `src/js/scripts.js`.

## Features
- **Mobile-Friendly Design**: The website is optimized for viewing on mobile devices.
- **Search Functionality**: Users can search for lyrics directly from the homepage.
- **Multi-Language Support**: Lyrics are available in Nepali, English, and Hindi, along with romanized versions.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is open-source and available under the MIT License.