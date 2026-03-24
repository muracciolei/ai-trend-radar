// Storage - Browser-compatible localStorage wrapper with enhanced data
const Storage = {
    // Initialize storage (no-op for browser localStorage)
    init() {
        console.log('Storage initialized');
    },
    
    getFeedUrls() {
        try {
            const data = localStorage.getItem('feedUrls');
            return data ? JSON.parse(data) : this.getDefaultFeedUrls();
        } catch (e) {
            console.error('Error reading feedUrls:', e);
            return this.getDefaultFeedUrls();
        }
    },
    
    getDefaultFeedUrls() {
        return [
            'https://news.ycombinator.com/rss',
            'https://www.reddit.com/r/artificial/.rss'
        ];
    },
    
    saveFeedUrls(urls) {
        try {
            localStorage.setItem('feedUrls', JSON.stringify(urls));
        } catch (e) {
            console.error('Error saving feedUrls:', e);
        }
    },
    
    getTrends() {
        try {
            const data = localStorage.getItem('trends');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Error reading trends:', e);
            return {};
        }
    },
    
    saveTrends(trends) {
        try {
            localStorage.setItem('trends', JSON.stringify(trends));
        } catch (e) {
            console.error('Error saving trends:', e);
        }
    },
    
    getHistory() {
        try {
            const data = localStorage.getItem('history');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading history:', e);
            return [];
        }
    },
    
    saveHistory(history) {
        try {
            localStorage.setItem('history', JSON.stringify(history));
        } catch (e) {
            console.error('Error saving history:', e);
        }
    },
    
    addHistorySnapshot(snapshot) {
        const history = this.getHistory();
        history.push(snapshot);
        // Keep only last 30 snapshots
        if (history.length > 30) {
            history.shift();
        }
        this.saveHistory(history);
    },
    
    getLastUpdate() {
        return localStorage.getItem('lastUpdate');
    },
    
    setLastUpdate(timestamp) {
        localStorage.setItem('lastUpdate', timestamp);
    },
    
    // Velocity data for momentum tracking
    getVelocityData() {
        try {
            const data = localStorage.getItem('velocityData');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Error reading velocityData:', e);
            return {};
        }
    },
    
    saveVelocityData(velocityData) {
        try {
            localStorage.setItem('velocityData', JSON.stringify(velocityData));
        } catch (e) {
            console.error('Error saving velocityData:', e);
        }
    },
    
    clear() {
        localStorage.removeItem('feedUrls');
        localStorage.removeItem('trends');
        localStorage.removeItem('history');
        localStorage.removeItem('lastUpdate');
        localStorage.removeItem('velocityData');
    },
    
    getStorageInfo() {
        return {
            total: localStorage.length,
            keys: Object.keys(localStorage)
        };
    },
    
    getKeywords() {
        try {
            const data = localStorage.getItem('keywords');
            return data ? JSON.parse(data) : this.getDefaultKeywords();
        } catch (e) {
            console.error('Error reading keywords:', e);
            return this.getDefaultKeywords();
        }
    },
    
    getDefaultKeywords() {
        return [
            'AI', 'machine learning', 'deep learning', 'neural network',
            'GPT', 'LLM', 'ChatGPT', 'OpenAI', 'Google AI', 'Microsoft AI',
            'artificial intelligence', 'automation', 'robotics', 'algorithm',
            'data science', 'natural language processing', 'computer vision',
            'transformer', 'BERT', 'token', 'embedding', 'model', 'training',
            'inference', 'deployment', 'API', 'cloud', 'edge computing',
            'Claude', 'Gemini', 'Mistral', 'Llama', 'Anthropic', 'NVIDIA',
            'multimodal', 'generative AI', 'large language model', 'prompt engineering',
            'RAG', 'fine-tuning', 'RLHF', 'AI ethics', 'AGI', 'ASI'
        ];
    },
    
    saveKeywords(keywords) {
        try {
            localStorage.setItem('keywords', JSON.stringify(keywords));
        } catch (e) {
            console.error('Error saving keywords:', e);
        }
    }
};

// Make it available globally
window.Storage = Storage;
