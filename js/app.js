// Main Application Controller - Enhanced with better data handling
const App = {
    // Application state
    isInitialized: false,
    isScanning: false,
    autoRefreshInterval: null,
    
    // Check if running via file:// protocol
    checkProtocol() {
        if (window.location.protocol === 'file:') {
            console.warn('Running via file:// protocol - some features may not work correctly');
            return true;
        }
        return false;
    },
    
    // Initialize the application
    init() {
        console.log('Initializing AI Trend Radar...');
        
        // Check protocol and warn user
        if (this.checkProtocol()) {
            document.body.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#0a0e17,#1a1f35);color:#e0e1dd;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:20px;text-align:center;">
                    <h1 style="color:#ff6b35;font-size:2em;margin-bottom:20px;">⚠️ Protocol Warning</h1>
                    <p style="font-size:1.2em;max-width:600px;line-height:1.6;">You are opening this app via <code style="background:#2a3f5f;padding:4px 8px;border-radius:4px;">file://</code> protocol, which has restricted security permissions.</p>
                    <p style="font-size:1.1em;margin:20px 0;color:#a8b5c7;">For the best experience, please use a local HTTP server:</p>
                    <div style="background:#1a1f35;border:1px solid #415a77;border-radius:12px;padding:20px;margin:20px 0;text-align:left;">
                        <p style="margin:8px 0;"><strong style="color:#00d4ff;">Option 1:</strong> Run <code style="background:#2a3f5f;padding:4px 8px;border-radius:4px;">python -m http.server 8000</code> in the project folder</p>
                        <p style="margin:8px 0;"><strong style="color:#00d4ff;">Option 2:</strong> Use VS Code Live Server extension</p>
                        <p style="margin:8px 0;"><strong style="color:#00d4ff;">Option 3:</strong> Run <code style="background:#2a3f5f;padding:4px 8px;border-radius:4px;">npx http-server</code></p>
                    </div>
                    <button onclick="window.location.href=window.location.href.replace('file://','http://').replace(/\/index\.html$/,'')" style="background:#ff6b35;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:1em;cursor:pointer;margin-top:20px;">Continue Anyway (may have issues)</button>
                </div>
            `;
            return;
        }
        
        // Initialize storage first
        try {
            Storage.init();
            console.log('Storage initialized');
        } catch (e) {
            console.error('Storage initialization failed:', e);
            this.showError('Failed to initialize storage');
            return;
        }
        
        // Initialize keyword analyzer
        try {
            KeywordAnalyzer.init();
            console.log('Keyword analyzer initialized');
        } catch (e) {
            console.error('Keyword analyzer initialization failed:', e);
        }
        
        // Initialize trend engine
        try {
            TrendEngine.init();
            console.log('Trend engine initialized');
        } catch (e) {
            console.error('Trend engine initialization failed:', e);
        }
        
        // Initialize UI renderer (after a delay to ensure Chart.js is loaded)
        setTimeout(() => {
            try {
                UIRenderer.init();
                console.log('UI renderer initialized');
            } catch (e) {
                console.error('UI renderer initialization failed:', e);
            }
        }, 500);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data
        this.loadData();
        
        this.isInitialized = true;
        console.log('AI Trend Radar initialized successfully');
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Tab navigation is handled via onclick in HTML
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Use Ctrl/Cmd+Shift+S to avoid conflict with browser Save Page As
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.scan();
            }
        });
    },
    
    // Load data from storage and render
    loadData() {
        try {
            const trends = TrendEngine.getTrends();
            const stats = TrendEngine.getStats();
            const history = TrendEngine.getHistory();
            
            // Render main dashboard
            UIRenderer.renderDashboard(trends, stats);
            
            // Update analytics charts
            UIRenderer.updateGrowthChart(history);
            UIRenderer.updateSourceChart(trends);
            UIRenderer.updateHistoryChart(history);
            
            // Render insights
            UIRenderer.renderInsights(trends, stats);
            UIRenderer.renderAdvancedInsights(trends, stats);
            
            console.log('Data loaded:', stats);
        } catch (e) {
            console.error('Error loading data:', e);
        }
    },
    
    // Run a scan
    async scan() {
        if (this.isScanning) {
            console.log('Scan already in progress');
            return;
        }
        
        this.isScanning = true;
        UIRenderer.showLoading();
        
        try {
            console.log('Starting scan...');
            const trends = await TrendEngine.scan();
            const stats = TrendEngine.getStats();
            const history = TrendEngine.getHistory();
            
            // Update UI with new data
            UIRenderer.renderDashboard(trends, stats);
            UIRenderer.updateGrowthChart(history);
            UIRenderer.updateSourceChart(trends);
            UIRenderer.updateHistoryChart(history);
            UIRenderer.renderInsights(trends, stats);
            UIRenderer.renderAdvancedInsights(trends, stats);
            
            UIRenderer.showNotification(`Scan complete! Found ${trends.length} trends`, 'success');
        } catch (e) {
            console.error('Scan failed:', e);
            UIRenderer.showError('Scan failed: ' + e.message);
            UIRenderer.showNotification('Scan failed', 'error');
        } finally {
            this.isScanning = false;
            UIRenderer.hideLoading();
        }
    },
    
    // Toggle auto-refresh
    toggleAutoRefresh() {
        if (this.autoRefreshInterval) {
            this.stopAutoRefresh();
            UIRenderer.showNotification('Auto-refresh disabled', 'success');
        } else {
            this.startAutoRefresh();
            UIRenderer.showNotification('Auto-refresh enabled (every 30 min)', 'success');
        }
    },
    
    // Start auto-refresh
    startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        this.autoRefreshInterval = setInterval(() => {
            this.scan();
        }, 30 * 60 * 1000); // 30 minutes
    },
    
    // Stop auto-refresh
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    },
    
    // Clear all data
    clearData() {
        if (!confirm('Are you sure you want to clear all trend data?')) {
            return;
        }
        
        TrendEngine.clearTrends();
        this.loadData();
        UIRenderer.showNotification('All data cleared', 'success');
    },
    
    // Export data as JSON
    exportData() {
        const data = {
            trends: TrendEngine.getTrends(),
            history: TrendEngine.getHistory(),
            stats: TrendEngine.getStats(),
            velocityData: TrendEngine.getVelocityData(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-trends-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        UIRenderer.showNotification('Data exported successfully', 'success');
    },
    
    // Add feed URL
    addFeedUrl(url) {
        if (!url) return;
        
        Storage.addFeedUrl(url);
        
        const feedList = document.getElementById('feedList');
        if (feedList) {
            const feeds = Storage.getFeedUrls();
            feedList.innerHTML = feeds.map(f => `<span class="feed-tag">${this.escapeHtml(f)}</span>`).join('');
        }
        
        UIRenderer.showNotification('Feed URL added', 'success');
    },
    
    // Add keyword
    addKeyword(keyword) {
        if (!keyword) return;
        
        KeywordAnalyzer.addKeyword(keyword);
        
        const keywordList = document.getElementById('keywordList');
        if (keywordList) {
            const keywords = KeywordAnalyzer.getKeywords();
            keywordList.innerHTML = keywords.map(k => `<span class="keyword-tag">${this.escapeHtml(k)}</span>`).join('');
        }
        
        UIRenderer.showNotification('Keyword added', 'success');
    },
    
    // Switch tab
    switchTab(tabId) {
        // Remove active from all tabs
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active to selected tab
        const tabContent = document.getElementById(`${tabId}-tab`);
        if (tabContent) {
            tabContent.classList.add('active');
        }
        
        // Find and activate the button
        const buttons = document.querySelectorAll('.tab-button');
        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(tabId)) {
                btn.classList.add('active');
            }
        });
        
        // Re-render charts if needed
        if (tabId === 'analytics') {
            const trends = TrendEngine.getTrends();
            const history = TrendEngine.getHistory();
            const stats = TrendEngine.getStats();
            
            UIRenderer.updateGrowthChart(history);
            UIRenderer.updateSourceChart(trends);
            UIRenderer.renderInsights(trends, stats);
        } else if (tabId === 'history') {
            const history = TrendEngine.getHistory();
            UIRenderer.updateHistoryChart(history);
        } else if (tabId === 'insights') {
            const trends = TrendEngine.getTrends();
            const stats = TrendEngine.getStats();
            UIRenderer.renderAdvancedInsights(trends, stats);
        }
    },
    
    // Show error message
    showError(message) {
        console.error(message);
        UIRenderer.showError(message);
    },
    
    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Alias for HTML onclick handlers
    runScan() {
        return this.scan();
    },
    
    clearCache() {
        Storage.clear();
        TrendEngine.clearTrends();
        this.loadData();
        UIRenderer.showNotification('Cache cleared', 'success');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for all scripts to load
    setTimeout(() => {
        App.init();
    }, 100);
});

// Make it available globally
window.App = App;
window.app = App; // Alias for lowercase access from HTML
