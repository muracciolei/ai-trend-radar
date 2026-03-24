// RSS Loader - Browser-compatible version using Fetch API
const RSSLoader = {
    sources: [
        'https://feeds.feedburner.com/TechCrunch/',
        'https://www.theverge.com/rss/index.xml',
        'https://wired.com/feed/rss'
    ],
    
    currentSourceIndex: 0,
    
    // Default RSS feed sources for AI/Tech news
    defaultSources: [
        'https://news.ycombinator.com/rss',
        'https://www.reddit.com/r/artificial/.rss',
        'https://feeds.feedburner.com/TechCrunch/',
        'https://www.theverge.com/rss/index.xml'
    ],
    
    // Fetch RSS feed from a source
    async fetchFeed(source) {
        console.log(`Fetching RSS feed from: ${source}`);
        try {
            // Use rss2json API to bypass CORS restrictions
            const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status !== 'ok') {
                // Provide user feedback for API failures
                const errorMsg = data.message || 'Failed to parse RSS feed';
                console.warn(`RSS API Warning for ${source}: ${errorMsg}`);
                // Return empty array instead of null to allow processing of other feeds
                return [];
            }
            return this.parseRSSJSON(data);
        } catch (error) {
            console.error(`Error fetching from ${source}:`, error);
            // Return empty array to allow other feeds to be processed
            return [];
        }
    },
    
    // Parse RSS from JSON response
    parseRSSJSON(data) {
        const itemsArray = [];
        if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
                itemsArray.push({
                    title: item.title || 'Untitled',
                    link: item.link || '',
                    description: item.description || item.content || '',
                    pubDate: item.pubDate || new Date().toISOString(),
                    source: data.feed.title || 'Unknown'
                });
            });
        }
        return itemsArray;
    },
    
    parseRSS(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        
        const items = xmlDoc.querySelectorAll('item');
        const itemsArray = [];
        
        items.forEach(item => {
            itemsArray.push({
                title: item.querySelector('title')?.textContent || '',
                link: item.querySelector('link')?.textContent || '',
                description: item.querySelector('description')?.textContent || '',
                pubDate: item.querySelector('pubDate')?.textContent || '',
                content: item.querySelector('content|encoded')?.textContent || ''
            });
        });
        
        return itemsArray;
    },
    
    async fetchAllFeeds() {
        const results = [];
        for (const source of this.sources) {
            const feed = await this.fetchFeed(source);
            if (feed) {
                results.push(...feed);
            }
            this.currentSourceIndex = (this.currentSourceIndex + 1) % this.sources.length;
        }
        return results;
    },
    
    addSource(url) {
        if (!this.sources.includes(url)) {
            this.sources.push(url);
        }
    },
    
    removeSource(url) {
        this.sources = this.sources.filter(s => s !== url);
    },
    
    getSources() {
        return [...this.sources];
    }
};

// Make it available globally
window.RSSLoader = RSSLoader;
