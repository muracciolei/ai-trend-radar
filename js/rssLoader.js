const axios = require('axios');

class RSSLoader {
    constructor(sources) {
        this.sources = sources;
        this.currentSourceIndex = 0;
    }

    async fetchFeed() {
        const source = this.sources[this.currentSourceIndex];
        console.log(`Fetching RSS feed from: ${source}`);
        try {
            const response = await axios.get(source);
            this.currentSourceIndex = (this.currentSourceIndex + 1) % this.sources.length;
            return response.data;
        } catch (error) {
            console.error(`Error fetching from ${source}:`, error);
            return null;
        }
    }
}

// Example Usage:
const sources = [
    'https://example1.com/rss',
    'https://example2.com/rss',
    'https://example3.com/rss'
];

const rssLoader = new RSSLoader(sources);

// Fetching feeds periodically
setInterval(async () => {
    const feed = await rssLoader.fetchFeed();
    if (feed) {
        console.log('Fetched Feed:', feed);
    }
}, 60000);  // Fetch every 60 seconds
