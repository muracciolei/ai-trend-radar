// UI Renderer - Handles all UI updates and chart rendering with enhanced visualizations
const UIRenderer = {
    charts: {},
    chartColors: {
        primary: '#00d4ff',
        secondary: '#7c3aed',
        tertiary: '#f472b6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
    },
    
    // Initialize the UI renderer
    init() {
        // Wait for Chart.js to load
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded yet');
            return;
        }
        
        // Set default Chart.js options
        this.setChartDefaults();
        this.initCharts();
    },
    
    // Set global Chart.js defaults for dark theme
    setChartDefaults() {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = '#2d3a52';
        Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    },
    
    // Initialize chart instances
    initCharts() {
        const chartConfigs = {
            trendChart: this.createTrendChartConfig(),
            growthChart: this.createGrowthChartConfig(),
            sourceChart: this.createSourceChartConfig(),
            historyChart: this.createHistoryChartConfig()
        };
        
        // Create chart instances if canvas elements exist
        Object.keys(chartConfigs).forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                this.charts[id] = new Chart(ctx, chartConfigs[id]);
            }
        });
    },
    
    // Create trend distribution chart config
    createTrendChartConfig() {
        return {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(0, 212, 255, 0.8)',
                        'rgba(124, 58, 237, 0.8)',
                        'rgba(244, 114, 182, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(20, 184, 166, 0.8)'
                    ],
                    borderColor: '#0a0e17',
                    borderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(21, 29, 46, 0.95)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#94a3b8',
                        borderColor: '#2d3a52',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.raw} mentions`;
                            }
                        }
                    }
                }
            }
        };
    },
    
    // Create growth over time chart config
    createGrowthChartConfig() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Total Articles',
                        data: [],
                        borderColor: 'rgba(0, 212, 255, 1)',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#00d4ff',
                        pointBorderColor: '#0a0e17',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Active Trends',
                        data: [],
                        borderColor: 'rgba(124, 58, 237, 1)',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#7c3aed',
                        pointBorderColor: '#0a0e17',
                        pointBorderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(21, 29, 46, 0.95)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#94a3b8',
                        borderColor: '#2d3a52',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(45, 58, 82, 0.3)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(45, 58, 82, 0.3)'
                        },
                        title: {
                            display: true,
                            text: 'Articles'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Trends'
                        }
                    }
                }
            }
        };
    },
    
    // Create sources distribution chart config
    createSourceChartConfig() {
        return {
            type: 'polarArea',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(0, 212, 255, 0.6)',
                        'rgba(124, 58, 237, 0.6)',
                        'rgba(244, 114, 182, 0.6)',
                        'rgba(16, 185, 129, 0.6)',
                        'rgba(245, 158, 11, 0.6)',
                        'rgba(239, 68, 68, 0.6)'
                    ],
                    borderColor: '#0a0e17',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    r: {
                        grid: {
                            color: 'rgba(45, 58, 82, 0.3)'
                        },
                        ticks: {
                            display: false
                        }
                    }
                }
            }
        };
    },
    
    // Create history chart config
    createHistoryChartConfig() {
        return {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Top Trend Score',
                        data: [],
                        backgroundColor: 'rgba(0, 212, 255, 0.8)',
                        borderColor: '#00d4ff',
                        borderWidth: 0,
                        borderRadius: 6,
                        barPercentage: 0.6
                    },
                    {
                        label: 'Average Score',
                        data: [],
                        backgroundColor: 'rgba(124, 58, 237, 0.6)',
                        borderColor: '#7c3aed',
                        borderWidth: 0,
                        borderRadius: 6,
                        barPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(45, 58, 82, 0.3)'
                        }
                    }
                }
            }
        };
    },
    
    // Render main dashboard
    renderDashboard(trends, stats) {
        this.renderStats(stats);
        this.renderTrendList(trends);
        this.updateTrendChart(trends);
    },
    
    // Render statistics
    renderStats(stats) {
        // Update feed count
        const feedCountEl = document.getElementById('feedCount');
        if (feedCountEl) {
            feedCountEl.textContent = stats.activeSources || 0;
        }
        
        // Update keyword count
        const keywordCountEl = document.getElementById('keywordCount');
        if (keywordCountEl) {
            const keywords = Storage.getKeywords();
            keywordCountEl.textContent = keywords.length;
        }
        
        // Update top score
        const topScoreEl = document.getElementById('topScore');
        if (topScoreEl) {
            topScoreEl.textContent = stats.topScore || 0;
        }
        
        // Update last update
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl && stats.lastUpdate) {
            const date = new Date(stats.lastUpdate);
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) {
                lastUpdateEl.textContent = 'Just now';
            } else if (diff < 3600000) {
                lastUpdateEl.textContent = `${Math.floor(diff / 60000)}m ago`;
            } else if (diff < 86400000) {
                lastUpdateEl.textContent = `${Math.floor(diff / 3600000)}h ago`;
            } else {
                lastUpdateEl.textContent = date.toLocaleDateString();
            }
        }
    },
    
    // Render trend list with enhanced details
    renderTrendList(trends) {
        const listContainer = document.getElementById('trendsList');
        const countEl = document.getElementById('trendCount');
        
        if (!listContainer) return;
        
        if (!trends || trends.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-radar"></i>
                    <h3>No Trends Yet</h3>
                    <p>Click "Scan Trends Now" to fetch and analyze the latest AI news</p>
                </div>
            `;
            if (countEl) countEl.textContent = '0 trends';
            return;
        }
        
        if (countEl) countEl.textContent = `${trends.length} trends`;
        
        const html = trends.slice(0, 15).map((trend, index) => {
            const vel = trend.velocityData || {};
            const velocity = vel.velocity || 0;
            const momentum = vel.momentum || 0;
            const growthRate = vel.growthRate || 0;
            
            // Determine growth class
            let growthClass = 'neutral';
            let growthIcon = 'fa-minus';
            if (growthRate > 10) {
                growthClass = 'positive';
                growthIcon = 'fa-arrow-up';
            } else if (growthRate < -10) {
                growthClass = 'negative';
                growthIcon = 'fa-arrow-down';
            }
            
            // Hot badge for top trends
            const hotBadge = index < 3 ? `<span class="hot-badge">${index === 0 ? '🔥 HOT' : index === 1 ? '⭐' : '🔥'}</span>` : '';
            
            // Format velocity
            const velocityFormatted = velocity.toFixed(2);
            
            return `
                <div class="trend-item">
                    <div class="trend-rank">#${index + 1}</div>
                    <div class="trend-info">
                        <div class="trend-word">
                            ${this.escapeHtml(trend.word)}
                            ${hotBadge}
                        </div>
                        <div class="trend-meta">
                            <span><i class="fas fa-comment-alt"></i> ${trend.count || 0} mentions</span>
                            <span><i class="fas fa-globe-americas"></i> ${trend.sources?.length || 0} sources</span>
                            <span><i class="fas fa-bolt"></i> ${velocityFormatted}/hr</span>
                        </div>
                        <div class="source-badges">
                            ${(trend.sources || []).slice(0, 4).map(s => 
                                `<span class="source-badge">${this.escapeHtml(this.extractDomain(s))}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="trend-stats">
                        <div class="trend-score">${trend.score}</div>
                        <div class="trend-growth ${growthClass}">
                            <i class="fas ${growthIcon}"></i>
                            ${Math.abs(growthRate).toFixed(1)}%
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        listContainer.innerHTML = html;
    },
    
    // Extract domain from URL
    extractDomain(url) {
        try {
            const domain = new URL(url.includes('http') ? url : `https://${url}`).hostname;
            return domain.replace(/^www\./, '');
        } catch {
            return url;
        }
    },
    
    // Update trend chart (doughnut)
    updateTrendChart(trends) {
        const chart = this.charts.trendChart;
        if (!chart) return;
        
        const topTrends = trends.slice(0, 8);
        
        chart.data.labels = topTrends.map(t => t.word);
        chart.data.datasets[0].data = topTrends.map(t => t.count || 0);
        
        chart.update();
    },
    
    // Update growth chart
    updateGrowthChart(history) {
        const chart = this.charts.growthChart;
        if (!chart || !history || history.length === 0) return;
        
        const labels = history.map((_, i) => {
            const date = new Date(history[i]?.timestamp || Date.now());
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const articlesData = history.map(h => h.totalArticles || 0);
        const trendsData = history.map(h => h.totalTrends || 0);
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = articlesData;
        chart.data.datasets[1].data = trendsData;
        
        chart.update();
    },
    
    // Update source distribution chart
    updateSourceChart(trends) {
        const chart = this.charts.sourceChart;
        if (!chart) return;
        
        // Aggregate sources
        const sourceCounts = {};
        trends.forEach(trend => {
            (trend.sources || []).forEach(source => {
                const domain = this.extractDomain(source);
                sourceCounts[domain] = (sourceCounts[domain] || 0) + 1;
            });
        });
        
        // Sort and get top sources
        const sorted = Object.entries(sourceCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
        
        chart.data.labels = sorted.map(([source]) => source);
        chart.data.datasets[0].data = sorted.map(([, count]) => count);
        
        chart.update();
    },
    
    // Update history chart
    updateHistoryChart(history) {
        const chart = this.charts.historyChart;
        if (!chart || !history || history.length === 0) return;
        
        const labels = history.map((h, i) => {
            const date = new Date(h.timestamp);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const topScores = history.map(h => 
            h.topTrends?.[0]?.score || 0
        );
        
        const avgScores = history.map(h => {
            if (!h.topTrends || h.topTrends.length === 0) return 0;
            const sum = h.topTrends.reduce((s, t) => s + t.score, 0);
            return Math.round(sum / h.topTrends.length);
        });
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = topScores;
        chart.data.datasets[1].data = avgScores;
        
        chart.update();
    },
    
    // Render insights panel
    renderInsights(trends, stats) {
        const insightsContainer = document.getElementById('insightsList');
        if (!insightsContainer) return;
        
        const anomalies = TrendEngine.getAnomalies() || [];
        const predictions = TrendEngine.getPredictions() || [];
        const patterns = TrendEngine.getPatterns() || [];
        
        if (anomalies.length === 0 && predictions.length === 0 && patterns.length === 0) {
            insightsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-lightbulb"></i>
                    <h3>No Insights Available</h3>
                    <p>Scan trends to generate AI-powered insights and predictions</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        // Render anomalies
        anomalies.slice(0, 3).forEach(anomaly => {
            html += `
                <div class="insight-card">
                    <div class="insight-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="insight-content">
                        <h4>${anomaly.type === 'velocity_spike' ? 'Velocity Spike' : anomaly.type === 'growth_spike' ? 'Rapid Growth' : 'Emerging Trend'}</h4>
                        <p><strong>${anomaly.word}</strong>: ${anomaly.message}</p>
                    </div>
                </div>
            `;
        });
        
        // Render predictions
        predictions.slice(0, 3).forEach(pred => {
            const icon = pred.prediction === 'rising' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
            const color = pred.prediction === 'rising' ? 'var(--accent-success)' : 'var(--accent-danger)';
            
            html += `
                <div class="insight-card">
                    <div class="insight-icon" style="background: ${pred.prediction === 'rising' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${color}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="insight-content">
                        <h4>${pred.prediction === 'rising' ? 'Rising' : 'Declining'} Trend Prediction</h4>
                        <p><strong>${pred.word}</strong>: ${pred.reason}</p>
                    </div>
                </div>
            `;
        });
        
        // Render patterns
        patterns.slice(0, 2).forEach(pattern => {
            html += `
                <div class="insight-card">
                    <div class="insight-icon" style="background: rgba(124, 58, 237, 0.2); color: var(--accent-secondary)">
                        <i class="fas fa-network-wired"></i>
                    </div>
                    <div class="insight-content">
                        <h4>${pattern.category} Pattern</h4>
                        <p>${pattern.message}</p>
                    </div>
                </div>
            `;
        });
        
        insightsContainer.innerHTML = html;
    },
    
    // Render advanced insights tab
    renderAdvancedInsights(trends, stats) {
        const container = document.getElementById('advancedInsights');
        if (!container) return;
        
        const predictions = TrendEngine.getPredictions() || [];
        const anomalies = TrendEngine.getAnomalies() || [];
        const patterns = TrendEngine.getPatterns() || [];
        const velocityData = TrendEngine.getVelocityData() || {};
        
        if (trends.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-magic"></i>
                    <h3>AI-Powered Analysis</h3>
                    <p>Scan trends to unlock detailed predictions, pattern recognition, and anomaly detection</p>
                </div>
            `;
            return;
        }
        
        // Get top momentum trends
        const topMomentum = Object.entries(velocityData)
            .sort((a, b) => b[1].momentum - a[1].momentum)
            .slice(0, 5)
            .map(([word, data]) => ({ word, ...data }));
        
        let html = '';
        
        // Section: Momentum Leaders
        if (topMomentum.length > 0) {
            html += `
                <div class="insights-panel">
                    <h3 style="margin-bottom: 15px; color: var(--accent-primary);">
                        <i class="fas fa-bolt"></i> Momentum Leaders
                    </h3>
                    ${topMomentum.map((item, i) => `
                        <div class="insight-card">
                            <div class="insight-icon" style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(124, 58, 237, 0.2)); color: var(--accent-primary)">
                                <i class="fas fa-fire"></i>
                            </div>
                            <div class="insight-content">
                                <h4>#${i + 1} ${item.word}</h4>
                                <p>Momentum: ${item.momentum.toFixed(2)} • Velocity: ${item.velocity.toFixed(2)}/hr • Growth: ${item.growthRate.toFixed(1)}%</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Section: Predictions
        if (predictions.length > 0) {
            html += `
                <div class="insights-panel">
                    <h3 style="margin-bottom: 15px; color: var(--accent-secondary);">
                        <i class="fas fa-crystal-ball"></i> Trend Predictions
                    </h3>
                    ${predictions.slice(0, 5).map(p => `
                        <div class="insight-card">
                            <div class="insight-icon" style="background: ${p.prediction === 'rising' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${p.prediction === 'rising' ? 'var(--accent-success)' : 'var(--accent-danger)'}">
                                <i class="fas ${p.prediction === 'rising' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
                            </div>
                            <div class="insight-content">
                                <h4>${p.word} - ${p.prediction}</h4>
                                <p>${p.reason} • Confidence: ${p.confidence}%</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Section: Patterns
        if (patterns.length > 0) {
            html += `
                <div class="insights-panel">
                    <h3 style="margin-bottom: 15px; color: var(--accent-tertiary);">
                        <i class="fas fa-project-diagram"></i> Detected Patterns
                    </h3>
                    ${patterns.map(p => `
                        <div class="insight-card">
                            <div class="insight-icon" style="background: rgba(244, 114, 182, 0.2); color: var(--accent-tertiary)">
                                <i class="fas fa-network-wired"></i>
                            </div>
                            <div class="insight-content">
                                <h4>${p.category}</h4>
                                <p>${p.message}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        container.innerHTML = html || '<div class="empty-state"><p>Collect more data for advanced insights</p></div>';
    },
    
    // Show loading state
    showLoading() {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.classList.add('active');
        }
    },
    
    // Hide loading state
    hideLoading() {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.classList.remove('active');
        }
    },
    
    // Show error message
    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (errorEl && errorText) {
            errorText.textContent = message;
            errorEl.classList.add('active');
            
            setTimeout(() => {
                errorEl.classList.remove('active');
            }, 5000);
        }
    },
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Make it available globally
window.UIRenderer = UIRenderer;
