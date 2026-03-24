// Keyword Analyzer - Enhanced TF-IDF based keyword extraction and trend analysis
const KeywordAnalyzer = {
    // AI and tech-related keywords to track
    keywords: [],
    
    // Initialize with default keywords
    init() {
        this.keywords = Storage.getKeywords();
    },
    
    // Extract keywords from text using TF-IDF-like approach
    analyze(text) {
        if (!text) return [];
        
        const words = this.tokenize(text);
        const wordFreq = this.calculateFrequency(words);
        
        // Score keywords based on frequency and importance
        const scoredKeywords = this.scoreKeywords(wordFreq);
        
        return scoredKeywords
            .filter(k => k.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 30);
    },
    
    // Tokenize text into words
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);
    },
    
    // Calculate word frequency
    calculateFrequency(words) {
        const freq = {};
        words.forEach(word => {
            freq[word] = (freq[word] || 0) + 1;
        });
        return freq;
    },
    
    // Score keywords based on frequency and match with tracked keywords
    scoreKeywords(wordFreq) {
        // Use Set for O(1) lookups instead of O(n) array scan
        const commonWords = new Set(['the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'are', 'was', 'but', 'not', 'they', 'will', 'can', 'would', 'could', 'should', 'might', 'must', 'just', 'been', 'when', 'where', 'what', 'who', 'how', 'more', 'some', 'into', 'year', 'your', 'like', 'time', 'only', 'over', 'such', 'other', 'then', 'them', 'these', 'so', 'may', 'say', 'also', 'use', 'get', 'did', 'now', 'see', 'well', 'back', 'even', 'still', 'want', 'because', 'any', 'give', 'day', 'most', 'take', 'come', 'made', 'find', 'look', 'know', 'think', 'way', 'before', 'through', 'new', 'last', 'long', 'great', 'little', 'own', 'old', 'right', 'big', 'high', 'different', 'small', 'large', 'early', 'young', 'important', 'public', 'bad', 'good', 'best', 'better', 'read', 'inc', 'com', 'http', 'https', 'www', 'org', 'net']);
        
        const results = [];
        
        for (const [word, count] of Object.entries(wordFreq)) {
            // Check if it's a tracked keyword
            const isTracked = this.keywords.some(k => 
                word.includes(k.toLowerCase()) || k.toLowerCase().includes(word)
            );
            
            // Calculate base score
            let score = count;
            
            // Boost tracked keywords significantly
            if (isTracked) {
                score *= 3;
            }
            
            // Boost AI-related terms
            const aiTerms = ['ai', 'ml', 'llm', 'gpt', 'nlp', 'cv', 'gan', 'vae', 'transformer'];
            if (aiTerms.includes(word)) {
                score *= 2;
            }
            
            // Penalize very common words (now O(1) lookup)
            if (commonWords.has(word)) {
                score = 0;
            }
            
            // Penalize numbers
            if (/^\d+$/.test(word)) {
                score = 0;
            }
            
            // Penalize very short words
            if (word.length < 3) {
                score = 0;
            }
            
            results.push({ word, count, score, isTracked });
        }
        
        return results;
    },
    
    // Analyze articles and extract trending keywords
    analyzeArticles(articles) {
        const allText = articles
            .map(a => `${a.title} ${a.description} ${a.content}`)
            .join(' ');
        
        return this.analyze(allText);
    },
    
    // Update trending scores based on keyword mentions
    updateTrendScores(keywords, existingTrends) {
        const trends = { ...existingTrends };
        
        keywords.forEach(kw => {
            if (trends[kw.word]) {
                trends[kw.word].count += kw.count;
                trends[kw.word].score = this.calculateTrendScore(trends[kw.word]);
            } else {
                trends[kw.word] = {
                    word: kw.word,
                    count: kw.count,
                    score: kw.score,
                    firstSeen: Date.now(),
                    sources: [],
                    articles: []
                };
            }
        });
        
        return trends;
    },
    
    // Calculate trend score (recency + velocity + count)
    calculateTrendScore(trend) {
        const age = Date.now() - (trend.firstSeen || Date.now());
        const recencyScore = Math.max(0, 100 - (age / 86400000)); // Decay over 100 days
        
        const velocityScore = trend.count / Math.max(1, age / 3600000); // Per hour
        
        return Math.round((recencyScore * 0.3 + velocityScore * 10 + trend.count * 2));
    },
    
    // Add new keyword to track
    addKeyword(keyword) {
        if (!this.keywords.includes(keyword)) {
            this.keywords.push(keyword);
            Storage.saveKeywords(this.keywords);
        }
    },
    
    // Remove keyword from tracking
    removeKeyword(keyword) {
        this.keywords = this.keywords.filter(k => k !== keyword);
        Storage.saveKeywords(this.keywords);
    },
    
    // Get current keywords
    getKeywords() {
        return [...this.keywords];
    },
    
    // Set keywords
    setKeywords(keywords) {
        this.keywords = keywords;
        Storage.saveKeywords(keywords);
    }
};

// Make it available globally
window.KeywordAnalyzer = KeywordAnalyzer;
