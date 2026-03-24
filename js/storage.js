const Storage = {
    getFeedUrls() {
        // Retrieves feed URLs from localStorage
        return JSON.parse(localStorage.getItem('feedUrls')) || [];
    },
    saveFeedUrls(urls) {
        // Saves feed URLs to localStorage
        localStorage.setItem('feedUrls', JSON.stringify(urls));
    },
    getTrends() {
        // Retrieves trends from localStorage
        return JSON.parse(localStorage.getItem('trends')) || {};
    },
    saveTrends(trends) {
        // Saves trends to localStorage
        localStorage.setItem('trends', JSON.stringify(trends));
    },
    getHistory() {
        // Retrieves history from localStorage
        return JSON.parse(localStorage.getItem('history')) || [];
    },
    addHistorySnapshot(snapshot) {
        // Adds a snapshot to the history in localStorage
        const history = this.getHistory();
        history.push(snapshot);
        this.saveHistory(history);
    },
    getLastUpdate() {
        // Retrieves the last update timestamp from localStorage
        return localStorage.getItem('lastUpdate') || null;
    },
    clear() {
        // Clears all data from localStorage
        localStorage.removeItem('feedUrls');
        localStorage.removeItem('trends');
        localStorage.removeItem('history');
        localStorage.removeItem('lastUpdate');
    },
    getStorageInfo() {
        // Retrieves storage information
        return {
            total: localStorage.length,
            keys: Object.keys(localStorage),
        };
    }
};

export default Storage;