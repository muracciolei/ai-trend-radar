// Trend Engine - Core trend detection and scoring logic with enhanced analytics
const TrendEngine = {
    trends: {},
    history: [],
    velocityData: {}, // Track momentum for each trend
    
    // Initialize the trend engine
    init() {
        this.trends = Storage.getTrends();
        this.history = Storage.getHistory();
        this.velocityData = Storage.getVelocityData();
        KeywordAnalyzer.init();
    },
    
    // Main scan function - fetches feeds and updates trends
    async scan() {
        console.log('Starting trend scan...');
        
        // Get feed URLs
        const feedUrls = Storage.getFeedUrls();
        
        // Fetch all feeds
        const allArticles = [];
        for (const url of feedUrls) {
            try {
                const articles = await RSSLoader.fetchFeed(url);
                if (articles && articles.length > 0) {
                    allArticles.push(...articles);
                    console.log(`Fetched ${articles.length} articles from ${url}`);
                }
            } catch (e) {
                console.error(`Error fetching ${url}:`, e);
            }
        }
        
        console.log(`Total articles fetched: ${allArticles.length}`);
        
        if (allArticles.length === 0) {
            console.warn('No articles fetched - feeds may be blocked by CORS');
            return this.getTrends();
        }
        
        // Analyze articles for keywords
        const keywords = KeywordAnalyzer.analyzeArticles(allArticles);
        
        // Update trends with new keywords
        this.trends = KeywordAnalyzer.updateTrendScores(keywords, this.trends);
        
        // Add source tracking
        allArticles.forEach(article => {
            keywords.forEach(kw => {
                if (this.trends[kw.word]) {
                    if (!this.trends[kw.word].sources) {
                        this.trends[kw.word].sources = [];
                    }
                    
                    // Safely extract domain from article link
                    let source = 'unknown';
                    try {
                        if (article.link) {
                            source = new URL(article.link).hostname;
                        }
                    } catch (e) {
                        // Keep 'unknown' as default for invalid URLs
                    }
                    
                    if (!this.trends[kw.word].sources.includes(source)) {
                        this.trends[kw.word].sources.push(source);
                    }
                    
                    // Track article for velocity calculation
                    if (!this.trends[kw.word].articles) {
                        this.trends[kw.word].articles = [];
                    }
                    this.trends[kw.word].articles.push({
                        title: article.title,
                        link: article.link,
                        pubDate: article.pubDate,
                        source: article.source
                    });
                }
            });
        });
        
        // Update velocity data
        this.updateVelocityData();
        
        // Save trends
        Storage.saveTrends(this.trends);
        
        // Add history snapshot
        this.addHistorySnapshot();
        
        // Update last scan time
        Storage.setLastUpdate(Date.now());
        
        return this.getTrends();
    },
    
    // Update velocity data for momentum calculations
    updateVelocityData() {
        const now = Date.now();
        const hour = 3600000;
        const day = 86400000;
        
        Object.keys(this.trends).forEach(word => {
            const trend = this.trends[word];
            
            // Calculate mentions in last 24 hours vs 48-24 hours ago
            const recentArticles = trend.articles?.filter(a => {
                const pubDate = new Date(a.pubDate).getTime();
                return now - pubDate < day;
            }) || [];
            
            const previousArticles = trend.articles?.filter(a => {
                const pubDate = new Date(a.pubDate).getTime();
                return now - pubDate >= day && now - pubDate < 2 * day;
            }) || [];
            
            // Calculate velocity (mentions per hour)
            const velocity = recentArticles.length / 24;
            
            // Calculate acceleration (velocity change)
            const prevVelocity = previousArticles.length / 24;
            const acceleration = velocity - prevVelocity;
            
            // Calculate growth rate (percentage increase)
            const growthRate = prevVelocity > 0 
                ? ((velocity - prevVelocity) / prevVelocity) * 100 
                : (velocity > 0 ? 100 : 0);
            
            // Calculate momentum score (combination of velocity and acceleration)
            const momentum = (velocity * 0.6) + (Math.max(0, acceleration) * 0.4);
            
            this.velocityData[word] = {
                velocity: velocity,
                acceleration: acceleration,
                growthRate: growthRate,
                momentum: momentum,
                recentCount: recentArticles.length,
                totalCount: trend.articles?.length || 0,
                lastUpdated: now
            };
        });
        
        Storage.saveVelocityData(this.velocityData);
    },
    
    // Get sorted trends
    getTrends() {
        return Object.values(this.trends)
            .map(trend => ({
                ...trend,
                score: this.calculateScore(trend),
                velocityData: this.velocityData[trend.word] || {}
            }))
            .sort((a, b) => b.score - a.score);
    },
    
    // Calculate trend score with multiple factors
    calculateScore(trend) {
        const baseScore = trend.score || 0;
        const count = trend.count || 0;
        const sourceCount = trend.sources ? trend.sources.length : 1;
        
        // Get velocity data
        const vel = this.velocityData[trend.word] || {};
        const velocity = vel.velocity || 0;
        const momentum = vel.momentum || 0;
        const growthRate = vel.growthRate || 0;
        
        // Calculate recency factor (newer trends get a boost)
        const age = Date.now() - (trend.firstSeen || Date.now());
        const recencyDays = age / 86400000;
        const recencyBoost = Math.max(0, 1 - (recencyDays / 30)); // Decay over 30 days
        
        // Weighted scoring: base + count factor + source diversity + velocity + momentum
        const score = baseScore + 
            (count * 0.3) + 
            (sourceCount * 2) + 
            (velocity * 5) + 
            (momentum * 3) +
            (recencyBoost * 10);
        
        return Math.round(score);
    },
    
    // Add history snapshot
    addHistorySnapshot() {
        const trends = this.getTrends();
        const snapshot = {
            timestamp: Date.now(),
            topTrends: trends.slice(0, 10).map(t => ({
                word: t.word,
                score: t.score,
                count: t.count,
                velocity: t.velocityData?.velocity || 0,
                momentum: t.velocityData?.momentum || 0
            })),
            totalTrends: Object.keys(this.trends).length,
            totalArticles: Object.values(this.trends).reduce((sum, t) => sum + (t.articles?.length || 0), 0),
            avgVelocity: this.calculateAverageVelocity(),
            topMomentum: this.getTopMomentum()
        };
        
        this.history.push(snapshot);
        
        // Keep last 30 snapshots
        if (this.history.length > 30) {
            this.history.shift();
        }
        
        Storage.saveHistory(this.history);
    },
    
    // Calculate average velocity across all trends
    calculateAverageVelocity() {
        const velocities = Object.values(this.velocityData).map(v => v.velocity);
        if (velocities.length === 0) return 0;
        return velocities.reduce((a, b) => a + b, 0) / velocities.length;
    },
    
    // Get trends with highest momentum
    getTopMomentum() {
        const sorted = Object.entries(this.velocityData)
            .sort((a, b) => b[1].momentum - a[1].momentum);
        return sorted.slice(0, 5).map(([word, data]) => ({
            word,
            momentum: data.momentum,
            velocity: data.velocity,
            growthRate: data.growthRate
        }));
    },
    
    // Get trend history
    getHistory() {
        return this.history;
    },
    
    // Get trends by category (based on keyword patterns)
    getTrendsByCategory() {
        const categories = {
            'AI Models': [],
            'Companies': [],
            'Technologies': [],
            'Applications': [],
            'Research': []
        };
        
        const modelKeywords = ['gpt', 'claude', 'llm', 'model', 'gemma', 'mistral', 'gemini', 'llama', 'falcon'];
        const companyKeywords = ['openai', 'google', 'microsoft', 'meta', 'anthropic', 'amazon', 'nvidia', 'apple'];
        const techKeywords = ['transformer', 'neural', 'deep learning', 'rlhf', 'rag', 'attention', 'embedding'];
        const appKeywords = ['chatbot', 'code', 'image', 'video', 'audio', 'search', 'assistant', 'automation'];
        const researchKeywords = ['paper', 'research', 'arxiv', 'benchmark', 'dataset', 'training', 'fine-tuning'];
        
        this.getTrends().forEach(trend => {
            const word = trend.word.toLowerCase();
            
            if (modelKeywords.some(k => word.includes(k))) {
                categories['AI Models'].push(trend);
            } else if (companyKeywords.some(k => word.includes(k))) {
                categories['Companies'].push(trend);
            } else if (techKeywords.some(k => word.includes(k))) {
                categories['Technologies'].push(trend);
            } else if (appKeywords.some(k => word.includes(k))) {
                categories['Applications'].push(trend);
            } else if (researchKeywords.some(k => word.includes(k))) {
                categories['Research'].push(trend);
            }
        });
        
        return categories;
    },
    
    // Get velocity data
    getVelocityData() {
        return this.velocityData;
    },
    
    // Get trend comparison data
    getTrendComparison(word1, word2) {
        const trend1 = this.trends[word1];
        const trend2 = this.trends[word2];
        
        if (!trend1 || !trend2) return null;
        
        const vel1 = this.velocityData[word1] || {};
        const vel2 = this.velocityData[word2] || {};
        
        return {
            trend1: {
                word: word1,
                score: this.calculateScore(trend1),
                count: trend1.count,
                sources: trend1.sources?.length || 0,
                velocity: vel1.velocity || 0,
                momentum: vel1.momentum || 0,
                growthRate: vel1.growthRate || 0
            },
            trend2: {
                word: word2,
                score: this.calculateScore(trend2),
                count: trend2.count,
                sources: trend2.sources?.length || 0,
                velocity: vel2.velocity || 0,
                momentum: vel2.momentum || 0,
                growthRate: vel2.growthRate || 0
            }
        };
    },
    
    // Get anomalies (trends with unusual activity)
    getAnomalies() {
        const anomalies = [];
        const velocities = Object.values(this.velocityData);
        
        if (velocities.length < 3) return anomalies;
        
        const avgVelocity = this.calculateAverageVelocity();
        const velocityThreshold = avgVelocity * 2; // 2x average is suspicious
        
        Object.entries(this.velocityData).forEach(([word, data]) => {
            if (data.velocity > velocityThreshold) {
                anomalies.push({
                    word,
                    type: 'velocity_spike',
                    message: `Unusual velocity detected: ${data.velocity.toFixed(2)} mentions/hour`,
                    severity: data.velocity > velocityThreshold * 2 ? 'high' : 'medium',
                    data
                });
            }
            
            // Check for sudden growth
            if (data.growthRate > 50) {
                anomalies.push({
                    word,
                    type: 'growth_spike',
                    message: `Rapid growth: ${data.growthRate.toFixed(1)}% increase`,
                    severity: data.growthRate > 100 ? 'high' : 'medium',
                    data
                });
            }
            
            // Check for new trending topics
            if (data.recentCount > 5 && data.totalCount < 10) {
                anomalies.push({
                    word,
                    type: 'emerging',
                    message: `Emerging trend: ${data.recentCount} new mentions`,
                    severity: 'low',
                    data
                });
            }
        });
        
        return anomalies.sort((a, b) => {
            const severityOrder = { high: 0, medium: 1, low: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
    },
    
    // Get predictions based on velocity and momentum
    getPredictions() {
        const predictions = [];
        
        // Get top momentum trends
        const topMomentum = this.getTopMomentum();
        
        topMomentum.forEach((item, index) => {
            if (item.momentum > 0.5) {
                predictions.push({
                    word: item.word,
                    prediction: 'rising',
                    confidence: Math.min(95, 50 + item.momentum * 10),
                    reason: `High momentum (${item.momentum.toFixed(2)}) with ${item.velocity.toFixed(2)} mentions/hour`,
                    probability: Math.min(0.95, 0.3 + item.momentum * 0.2)
                });
            }
        });
        
        // Get declining trends
        Object.entries(this.velocityData).forEach(([word, data]) => {
            if (data.velocity < 0.1 && data.growthRate < -20) {
                predictions.push({
                    word,
                    prediction: 'declining',
                    confidence: Math.min(90, 50 - data.growthRate),
                    reason: `Declining velocity with ${data.growthRate.toFixed(1)}% negative growth`,
                    probability: Math.min(0.9, 0.3 - data.growthRate * 0.005)
                });
            }
        });
        
        return predictions;
    },
    
    // Get patterns (related trends)
    getPatterns() {
        const patterns = [];
        const trends = this.getTrends();
        
        // Find co-occurring keywords in articles
        const coOccurrences = {};
        
        Object.values(this.trends).forEach(trend => {
            if (trend.articles && trend.articles.length > 0) {
                trend.articles.slice(0, 10).forEach(article => {
                    // This is simplified - in production would analyze actual co-occurrence
                });
            }
        });
        
        // Find trends in the same category that are rising together
        const categories = this.getTrendsByCategory();
        
        Object.entries(categories).forEach(([category, categoryTrends]) => {
            const rising = categoryTrends.filter(t => {
                const vel = this.velocityData[t.word];
                return vel && vel.growthRate > 10;
            });
            
            if (rising.length >= 2) {
                patterns.push({
                    type: 'category_rise',
                    category,
                    trends: rising.map(t => t.word),
                    message: `${category} showing collective growth with ${rising.length} rising topics`
                });
            }
        });
        
        return patterns;
    },
    
    // Clear all trends
    clearTrends() {
        this.trends = {};
        this.velocityData = {};
        Storage.saveTrends({});
        Storage.saveVelocityData({});
        this.history = [];
        Storage.saveHistory([]);
    },
    
    // Get comprehensive statistics
    getStats() {
        const trends = this.getTrends();
        const velocities = Object.values(this.velocityData);
        
        // Calculate percentiles
        const scores = trends.map(t => t.score).sort((a, b) => a - b);
        const medianScore = scores[Math.floor(scores.length / 2)] || 0;
        
        // Calculate average metrics
        const avgVelocity = this.calculateAverageVelocity();
        const avgMomentum = velocities.length > 0 
            ? velocities.reduce((sum, v) => sum + v.momentum, 0) / velocities.length 
            : 0;
        
        // Count trends by status
        const rising = velocities.filter(v => v.growthRate > 10).length;
        const declining = velocities.filter(v => v.growthRate < -10).length;
        const stable = velocities.length - rising - declining;
        
        return {
            totalTrends: trends.length,
            topScore: trends.length > 0 ? trends[0].score : 0,
            medianScore,
            totalArticles: Object.values(this.trends).reduce((sum, t) => sum + (t.articles?.length || 0), 0),
            activeSources: new Set(
                Object.values(this.trends).flatMap(t => t.sources || [])
            ).size,
            avgVelocity: avgVelocity.toFixed(2),
            avgMomentum: avgMomentum.toFixed(2),
            risingTrends: rising,
            decliningTrends: declining,
            stableTrends: stable,
            lastUpdate: Storage.getLastUpdate(),
            anomalies: this.getAnomalies().length,
            predictions: this.getPredictions().length
        };
    }
};

// Make it available globally
window.TrendEngine = TrendEngine;
