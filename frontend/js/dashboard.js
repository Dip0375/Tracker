// Dashboard functions
let dashboardCharts = {};

async function loadDashboardData(timeframe = '') {
    try {
        const [ipStats, uriStats, fileStats] = await Promise.all([
            APIClient.getIPStats(timeframe),
            APIClient.getURIStats(timeframe),
            APIClient.getFileStats(timeframe)
        ]);

        // Update IP stats
        document.getElementById('total-ips').textContent = ipStats.data.totalIPs;
        document.getElementById('blocked-ips').textContent = ipStats.data.blockedIPs;
        document.getElementById('whitelisted-ips').textContent = ipStats.data.whitelistIPs;

        // Update URI stats
        document.getElementById('total-uris').textContent = uriStats.data.totalURIs;
        document.getElementById('blocked-uris').textContent = uriStats.data.blockedURIs;
        document.getElementById('whitelisted-uris').textContent = uriStats.data.whitelistURIs;

        // Update File stats
        document.getElementById('total-files').textContent = fileStats.data.totalFiles;
        document.getElementById('quarantined-files').textContent = fileStats.data.quarantinedFiles;
        document.getElementById('detected-files').textContent = fileStats.data.totalFiles - fileStats.data.quarantinedFiles;

        // Critical count
        const criticalCount = (ipStats.data.bySeverity.find(s => s.severity === 'CRITICAL')?.count || 0) +
                             (fileStats.data.byMalwareType.find(m => m.malwareType === 'RANSOMWARE')?.count || 0);
        document.getElementById('critical-count').textContent = criticalCount;

        // Update charts
        updateSeverityChart(ipStats.data.bySeverity);
        updateSourceChart(ipStats.data.bySource);
        updateThreatChart(uriStats.data.byThreatType);
        updateMalwareChart(fileStats.data.byMalwareType);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

function updateSeverityChart(data) {
    const ctx = document.getElementById('severity-chart');
    
    if (dashboardCharts.severity) {
        dashboardCharts.severity.destroy();
    }

    const chartData = {
        labels: data.map(d => d.severity),
        datasets: [{
            label: 'Count',
            data: data.map(d => d.count),
            backgroundColor: [
                '#dc2626',
                '#ea580c',
                '#f59e0b',
                '#16a34a'
            ]
        }]
    };

    dashboardCharts.severity = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateSourceChart(data) {
    const ctx = document.getElementById('source-chart');
    
    if (dashboardCharts.source) {
        dashboardCharts.source.destroy();
    }

    const chartData = {
        labels: data.map(d => d.source),
        datasets: [{
            label: 'Count',
            data: data.map(d => d.count),
            backgroundColor: [
                '#2563eb',
                '#7c3aed',
                '#06b6d4',
                '#f59e0b'
            ]
        }]
    };

    dashboardCharts.source = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateThreatChart(data) {
    const ctx = document.getElementById('threat-chart');
    
    if (dashboardCharts.threat) {
        dashboardCharts.threat.destroy();
    }

    const chartData = {
        labels: data.map(d => d.threatType),
        datasets: [{
            label: 'Count',
            data: data.map(d => d.count),
            backgroundColor: [
                '#dc2626',
                '#f59e0b',
                '#06b6d4',
                '#7c3aed'
            ]
        }]
    };

    dashboardCharts.threat = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateMalwareChart(data) {
    const ctx = document.getElementById('malware-chart');
    
    if (dashboardCharts.malware) {
        dashboardCharts.malware.destroy();
    }

    const chartData = {
        labels: data.map(d => d.malwareType),
        datasets: [{
            label: 'Count',
            data: data.map(d => d.count),
            backgroundColor: [
                '#dc2626',
                '#f59e0b',
                '#06b6d4',
                '#7c3aed',
                '#16a34a'
            ]
        }]
    };

    dashboardCharts.malware = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize timeframe buttons
function initTimeframeButtons() {
    const buttons = document.querySelectorAll('.timeframe-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const timeframe = btn.dataset.timeframe;
            
            if (timeframe === 'custom') {
                openModal('custom-range-modal');
            } else {
                await loadDashboardData(timeframe);
            }
        });
    });
}

// Custom date range handler
function initCustomDateRange() {
    const modal = document.getElementById('custom-range-modal');
    const applyBtn = document.getElementById('apply-custom-range');
    const startDate = document.getElementById('custom-start-date');
    const endDate = document.getElementById('custom-end-date');
    const durationValue = document.getElementById('duration-value');
    const durationUnit = document.getElementById('duration-unit');

    // Set default dates
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    startDate.valueAsDate = weekAgo;
    endDate.valueAsDate = now;

    applyBtn.addEventListener('click', async () => {
        if (durationValue.value) {
            // Calculate based on duration
            const now = new Date();
            const value = parseInt(durationValue.value);
            const unit = durationUnit.value.toLowerCase();
            
            let start = new Date(now);
            if (unit === 'hours') {
                start.setHours(start.getHours() - value);
            } else if (unit === 'days') {
                start.setDate(start.getDate() - value);
            } else if (unit === 'months') {
                start.setMonth(start.getMonth() - value);
            } else if (unit === 'years') {
                start.setFullYear(start.getFullYear() - value);
            }
            
            // Use custom timeframe format
            const timeframe = `custom_${start.getTime()}_${now.getTime()}`;
            await loadDashboardData(timeframe);
        } else if (startDate.value && endDate.value) {
            // Use date range
            const start = new Date(startDate.value).getTime();
            const end = new Date(endDate.value).getTime();
            const timeframe = `custom_${start}_${end}`;
            await loadDashboardData(timeframe);
        }
        
        closeModal('custom-range-modal');
    });
}
