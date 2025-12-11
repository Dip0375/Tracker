// API Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// API Helper Functions
class APIClient {
    static async request(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // IP Endpoints
    static async createIP(data) {
        return this.request('/ips', 'POST', data);
    }

    static async getIPs(query = '') {
        return this.request(`/ips${query}`);
    }

    static async getIP(id) {
        return this.request(`/ips/${id}`);
    }

    static async updateIP(id, data) {
        return this.request(`/ips/${id}`, 'PUT', data);
    }

    static async deleteIP(id) {
        return this.request(`/ips/${id}`, 'DELETE');
    }

    static async searchIP(ip) {
        return this.request(`/ips/search?ip=${encodeURIComponent(ip)}`);
    }

    static async getIPStats(timeframe = '') {
        const query = timeframe ? `?timeframe=${timeframe}` : '';
        return this.request(`/ips/stats${query}`);
    }

    // URI Endpoints
    static async createURI(data) {
        return this.request('/uris', 'POST', data);
    }

    static async getURIs(query = '') {
        return this.request(`/uris${query}`);
    }

    static async getURI(id) {
        return this.request(`/uris/${id}`);
    }

    static async updateURI(id, data) {
        return this.request(`/uris/${id}`, 'PUT', data);
    }

    static async deleteURI(id) {
        return this.request(`/uris/${id}`, 'DELETE');
    }

    static async getURIStats(timeframe = '') {
        const query = timeframe ? `?timeframe=${timeframe}` : '';
        return this.request(`/uris/stats${query}`);
    }

    // File Endpoints
    static async createFile(data) {
        return this.request('/files', 'POST', data);
    }

    static async getFiles(query = '') {
        return this.request(`/files${query}`);
    }

    static async getFile(id) {
        return this.request(`/files/${id}`);
    }

    static async updateFile(id, data) {
        return this.request(`/files/${id}`, 'PUT', data);
    }

    static async deleteFile(id) {
        return this.request(`/files/${id}`, 'DELETE');
    }

    static async searchFile(hash) {
        return this.request(`/files/search?hash=${encodeURIComponent(hash)}`);
    }

    static async getFileStats(timeframe = '') {
        const query = timeframe ? `?timeframe=${timeframe}` : '';
        return this.request(`/files/stats${query}`);
    }
}

// Utility Functions
function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString();
}

function getStatusClass(status) {
    const classMap = {
        'BLOCKED': 'status-blocked',
        'WHITELIST': 'status-whitelist',
        'SUSPICIOUS': 'status-suspicious',
        'MONITORING': 'status-monitoring',
        'DETECTED': 'status-detected',
        'QUARANTINED': 'status-quarantined'
    };
    return classMap[status] || 'status-monitoring';
}

function getSeverityClass(severity) {
    const classMap = {
        'CRITICAL': 'severity-critical',
        'HIGH': 'severity-high',
        'MEDIUM': 'severity-medium',
        'LOW': 'severity-low'
    };
    return classMap[severity] || 'severity-medium';
}

function createStatusBadge(status) {
    return `<span class="status-badge ${getStatusClass(status)}">${status}</span>`;
}

function createSeverityBadge(severity) {
    return `<span class="${getSeverityClass(severity)}">${severity}</span>`;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#16a34a' : '#dc2626'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
