// Global state
let currentPage = 'dashboard';
let currentTimeframe = '';

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Page navigation
function navigatePage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show selected page
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'ips': 'IP Address Management',
        'uris': 'URI Management',
        'files': 'Malicious File Management',
        'history': 'Action History'
    };
    document.getElementById('page-title').textContent = titles[page] || 'Dashboard';

    currentPage = page;

    // Load page-specific data
    if (page === 'dashboard') {
        loadDashboardData(currentTimeframe);
    } else if (page === 'ips') {
        loadIPTable();
    } else if (page === 'uris') {
        loadURITable();
    } else if (page === 'files') {
        loadFileTable();
    } else if (page === 'history') {
        loadHistory();
    }
}

// ============= IP FUNCTIONS =============

async function loadIPTable(page = 1, status = '', search = '') {
    try {
        let query = `?page=${page}&limit=50`;
        if (status) query += `&status=${status}`;
        if (search) query += `&search=${search}`;

        const response = await APIClient.getIPs(query);
        const tbody = document.getElementById('ip-tbody');
        tbody.innerHTML = '';

        response.data.forEach(ip => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${ip.ipAddress}</td>
                <td>${createStatusBadge(ip.status)}</td>
                <td>${createSeverityBadge(ip.severity)}</td>
                <td>${ip.source}</td>
                <td>${ip.reason.substring(0, 50)}...</td>
                <td>${formatDate(ip.createdAt)}</td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-small" onclick="editIP('${ip.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-small" onclick="deleteIPRecord('${ip.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });

        // Update pagination
        updatePagination('ip-pagination', page, response.pagination.pages, (p) => loadIPTable(p, status, search));

    } catch (error) {
        console.error('Error loading IP table:', error);
        showNotification('Error loading IP data', 'error');
    }
}

function openIPForm() {
    document.getElementById('ip-form').reset();
    document.getElementById('ip-address').focus();
    openModal('ip-form-modal');
}

async function submitIPForm(e) {
    e.preventDefault();

    const data = {
        ipAddress: document.getElementById('ip-address').value,
        status: document.getElementById('ip-status').value,
        source: document.getElementById('ip-source').value,
        severity: document.getElementById('ip-severity').value,
        reason: document.getElementById('ip-reason').value,
        location: document.getElementById('ip-location').value,
        actionTakenBy: document.getElementById('ip-action-by').value,
        notes: document.getElementById('ip-notes').value
    };

    try {
        await APIClient.createIP(data);
        showNotification('IP address added successfully');
        closeModal('ip-form-modal');
        loadIPTable();
    } catch (error) {
        showNotification('Error saving IP address', 'error');
    }
}

async function deleteIPRecord(id) {
    if (confirm('Are you sure you want to delete this IP record?')) {
        try {
            await APIClient.deleteIP(id);
            showNotification('IP record deleted successfully');
            loadIPTable();
        } catch (error) {
            showNotification('Error deleting IP record', 'error');
        }
    }
}

async function editIP(id) {
    try {
        const response = await APIClient.getIP(id);
        const ip = response.data;

        document.getElementById('ip-address').value = ip.ipAddress;
        document.getElementById('ip-status').value = ip.status;
        document.getElementById('ip-source').value = ip.source;
        document.getElementById('ip-severity').value = ip.severity;
        document.getElementById('ip-reason').value = ip.reason;
        document.getElementById('ip-location').value = ip.location;
        document.getElementById('ip-action-by').value = ip.actionTakenBy;
        document.getElementById('ip-notes').value = ip.notes;

        openModal('ip-form-modal');
    } catch (error) {
        showNotification('Error loading IP data', 'error');
    }
}

// ============= URI FUNCTIONS =============

async function loadURITable(page = 1, status = '', search = '') {
    try {
        let query = `?page=${page}&limit=50`;
        if (status) query += `&status=${status}`;
        if (search) query += `&search=${search}`;

        const response = await APIClient.getURIs(query);
        const tbody = document.getElementById('uri-tbody');
        tbody.innerHTML = '';

        response.data.forEach(uri => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${uri.uri.substring(0, 40)}...</td>
                <td>${createStatusBadge(uri.status)}</td>
                <td>${uri.threatType}</td>
                <td>${createSeverityBadge(uri.severity)}</td>
                <td>${uri.reason.substring(0, 50)}...</td>
                <td>${formatDate(uri.createdAt)}</td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-small" onclick="editURI('${uri.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-small" onclick="deleteURIRecord('${uri.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });

        updatePagination('uri-pagination', page, response.pagination.pages, (p) => loadURITable(p, status, search));

    } catch (error) {
        console.error('Error loading URI table:', error);
        showNotification('Error loading URI data', 'error');
    }
}

function openURIForm() {
    document.getElementById('uri-form').reset();
    document.getElementById('uri-address').focus();
    openModal('uri-form-modal');
}

async function submitURIForm(e) {
    e.preventDefault();

    const associatedIPs = document.getElementById('uri-associated-ips').value
        .split(',')
        .map(ip => ip.trim())
        .filter(ip => ip);

    const data = {
        uri: document.getElementById('uri-address').value,
        status: document.getElementById('uri-status').value,
        threatType: document.getElementById('uri-threat-type').value,
        severity: document.getElementById('uri-severity').value,
        reason: document.getElementById('uri-reason').value,
        associatedIPs,
        actionTakenBy: document.getElementById('uri-action-by').value,
        notes: document.getElementById('uri-notes').value
    };

    try {
        await APIClient.createURI(data);
        showNotification('URI added successfully');
        closeModal('uri-form-modal');
        loadURITable();
    } catch (error) {
        showNotification('Error saving URI', 'error');
    }
}

async function deleteURIRecord(id) {
    if (confirm('Are you sure you want to delete this URI record?')) {
        try {
            await APIClient.deleteURI(id);
            showNotification('URI record deleted successfully');
            loadURITable();
        } catch (error) {
            showNotification('Error deleting URI record', 'error');
        }
    }
}

async function editURI(id) {
    try {
        const response = await APIClient.getURI(id);
        const uri = response.data;

        document.getElementById('uri-address').value = uri.uri;
        document.getElementById('uri-status').value = uri.status;
        document.getElementById('uri-threat-type').value = uri.threatType;
        document.getElementById('uri-severity').value = uri.severity;
        document.getElementById('uri-reason').value = uri.reason;
        document.getElementById('uri-associated-ips').value = uri.associatedIPs.join(', ');
        document.getElementById('uri-action-by').value = uri.actionTakenBy;
        document.getElementById('uri-notes').value = uri.notes;

        openModal('uri-form-modal');
    } catch (error) {
        showNotification('Error loading URI data', 'error');
    }
}

// ============= FILE FUNCTIONS =============

async function loadFileTable(page = 1, status = '', search = '') {
    try {
        let query = `?page=${page}&limit=50`;
        if (status) query += `&status=${status}`;
        if (search) query += `&search=${search}`;

        const response = await APIClient.getFiles(query);
        const tbody = document.getElementById('file-tbody');
        tbody.innerHTML = '';

        response.data.forEach(file => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${file.fileName}</td>
                <td><code>${file.fileHash.substring(0, 20)}...</code></td>
                <td>${createStatusBadge(file.status)}</td>
                <td>${file.malwareType}</td>
                <td>${createSeverityBadge(file.severity)}</td>
                <td>${formatDate(file.createdAt)}</td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-small" onclick="editFile('${file.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-small" onclick="deleteFileRecord('${file.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });

        updatePagination('file-pagination', page, response.pagination.pages, (p) => loadFileTable(p, status, search));

    } catch (error) {
        console.error('Error loading file table:', error);
        showNotification('Error loading file data', 'error');
    }
}

function openFileForm() {
    document.getElementById('file-form').reset();
    document.getElementById('file-name').focus();
    openModal('file-form-modal');
}

async function submitFileForm(e) {
    e.preventDefault();

    const associatedIPs = document.getElementById('file-associated-ips').value
        .split(',')
        .map(ip => ip.trim())
        .filter(ip => ip);

    const associatedURIs = document.getElementById('file-associated-uris').value
        .split(',')
        .map(uri => uri.trim())
        .filter(uri => uri);

    const data = {
        fileName: document.getElementById('file-name').value,
        fileHash: document.getElementById('file-hash').value,
        hashType: document.getElementById('file-hash-type').value,
        fileType: document.getElementById('file-type').value,
        status: document.getElementById('file-status').value,
        malwareType: document.getElementById('file-malware-type').value,
        severity: document.getElementById('file-severity').value,
        blockLocation: document.getElementById('file-block-location').value,
        associatedIPs,
        associatedURIs,
        actionTakenBy: document.getElementById('file-action-by').value,
        notes: document.getElementById('file-notes').value
    };

    try {
        await APIClient.createFile(data);
        showNotification('Malicious file added successfully');
        closeModal('file-form-modal');
        loadFileTable();
    } catch (error) {
        showNotification('Error saving file', 'error');
    }
}

async function deleteFileRecord(id) {
    if (confirm('Are you sure you want to delete this file record?')) {
        try {
            await APIClient.deleteFile(id);
            showNotification('File record deleted successfully');
            loadFileTable();
        } catch (error) {
            showNotification('Error deleting file record', 'error');
        }
    }
}

async function editFile(id) {
    try {
        const response = await APIClient.getFile(id);
        const file = response.data;

        document.getElementById('file-name').value = file.fileName;
        document.getElementById('file-hash').value = file.fileHash;
        document.getElementById('file-hash-type').value = file.hashType;
        document.getElementById('file-type').value = file.fileType;
        document.getElementById('file-status').value = file.status;
        document.getElementById('file-malware-type').value = file.malwareType;
        document.getElementById('file-severity').value = file.severity;
        document.getElementById('file-block-location').value = file.blockLocation;
        document.getElementById('file-associated-ips').value = file.associatedIPs.join(', ');
        document.getElementById('file-associated-uris').value = file.associatedURIs.join(', ');
        document.getElementById('file-action-by').value = file.actionTakenBy;
        document.getElementById('file-notes').value = file.notes;

        openModal('file-form-modal');
    } catch (error) {
        showNotification('Error loading file data', 'error');
    }
}

// ============= HISTORY FUNCTIONS =============

async function loadHistory(entityType = '', actionType = '') {
    try {
        const timeline = document.getElementById('history-timeline');
        timeline.innerHTML = '<p>Loading history...</p>';

        // Load data from all sources
        const [ips, uris, files] = await Promise.all([
            APIClient.getIPs('?limit=100'),
            APIClient.getURIs('?limit=100'),
            APIClient.getFiles('?limit=100')
        ]);

        const allActions = [];

        // Convert IPs to action history
        ips.data.forEach(ip => {
            allActions.push({
                timestamp: ip.updatedAt || ip.createdAt,
                actionType: `IP_${ip.status}`,
                entityType: 'IP',
                entityValue: ip.ipAddress,
                reason: ip.reason,
                performer: ip.actionTakenBy,
                status: ip.status
            });
        });

        // Convert URIs to action history
        uris.data.forEach(uri => {
            allActions.push({
                timestamp: uri.updatedAt || uri.createdAt,
                actionType: `URI_${uri.status}`,
                entityType: 'URI',
                entityValue: uri.uri,
                reason: uri.reason,
                performer: uri.actionTakenBy,
                status: uri.status
            });
        });

        // Convert Files to action history
        files.data.forEach(file => {
            allActions.push({
                timestamp: file.updatedAt || file.createdAt,
                actionType: `FILE_${file.status}`,
                entityType: 'FILE',
                entityValue: file.fileName,
                reason: file.malwareType,
                performer: file.actionTakenBy,
                status: file.status
            });
        });

        // Filter by entity type and action type if specified
        let filtered = allActions;
        if (entityType) {
            filtered = filtered.filter(a => a.entityType === entityType);
        }
        if (actionType) {
            filtered = filtered.filter(a => a.actionType === actionType);
        }

        // Sort by timestamp (newest first)
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Render timeline
        timeline.innerHTML = '';
        if (filtered.length === 0) {
            timeline.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No actions found</p>';
            return;
        }

        filtered.forEach(action => {
            const timelineItem = document.createElement('div');
            const isBlocked = action.status === 'BLOCKED' || action.actionType.includes('BLOCKED');
            timelineItem.className = `timeline-item ${isBlocked ? 'blocked' : 'success'}`;
            timelineItem.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h4>${action.actionType}</h4>
                        <span class="timeline-time">${formatDate(action.timestamp)}</span>
                    </div>
                    <div class="timeline-body">
                        <strong>${action.entityType}:</strong> ${action.entityValue}
                    </div>
                    <div class="timeline-details">
                        <div><strong>Reason:</strong> ${action.reason}</div>
                        <div><strong>Performer:</strong> ${action.performer || 'System'}</div>
                        <div><strong>Status:</strong> ${createStatusBadge(action.status)}</div>
                    </div>
                </div>
            `;
            timeline.appendChild(timelineItem);
        });

    } catch (error) {
        console.error('Error loading history:', error);
        document.getElementById('history-timeline').innerHTML = '<p style="color: red;">Error loading history</p>';
    }
}

// Pagination helper
function updatePagination(containerId, currentPage, totalPages, callback) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Previous button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Previous';
        prevBtn.addEventListener('click', () => callback(currentPage - 1));
        container.appendChild(prevBtn);
    }

    // Page buttons
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => callback(i));
        container.appendChild(btn);
    }

    // Next button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => callback(currentPage + 1));
        container.appendChild(nextBtn);
    }
}

// ============= EVENT LISTENERS =============

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigatePage(page);
        });
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('active');
        });
    });

    // Modal click outside to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // IP form
    document.getElementById('add-ip-btn').addEventListener('click', openIPForm);
    document.getElementById('ip-form').addEventListener('submit', submitIPForm);
    document.getElementById('ip-search').addEventListener('input', (e) => {
        loadIPTable(1, document.getElementById('ip-status-filter').value, e.target.value);
    });
    document.getElementById('ip-status-filter').addEventListener('change', (e) => {
        loadIPTable(1, e.target.value, document.getElementById('ip-search').value);
    });

    // URI form
    document.getElementById('add-uri-btn').addEventListener('click', openURIForm);
    document.getElementById('uri-form').addEventListener('submit', submitURIForm);
    document.getElementById('uri-search').addEventListener('input', (e) => {
        loadURITable(1, document.getElementById('uri-status-filter').value, e.target.value);
    });
    document.getElementById('uri-status-filter').addEventListener('change', (e) => {
        loadURITable(1, e.target.value, document.getElementById('uri-search').value);
    });

    // File form
    document.getElementById('add-file-btn').addEventListener('click', openFileForm);
    document.getElementById('file-form').addEventListener('submit', submitFileForm);
    document.getElementById('file-search').addEventListener('input', (e) => {
        loadFileTable(1, document.getElementById('file-status-filter').value, e.target.value);
    });
    document.getElementById('file-status-filter').addEventListener('change', (e) => {
        loadFileTable(1, e.target.value, document.getElementById('file-search').value);
    });

    // History filters
    document.getElementById('history-entity-filter').addEventListener('change', () => {
        loadHistory(
            document.getElementById('history-entity-filter').value,
            document.getElementById('history-action-filter').value
        );
    });
    document.getElementById('history-action-filter').addEventListener('change', () => {
        loadHistory(
            document.getElementById('history-entity-filter').value,
            document.getElementById('history-action-filter').value
        );
    });

    // Dashboard
    initTimeframeButtons();
    initCustomDateRange();

    // Global search
    document.getElementById('global-search').addEventListener('input', (e) => {
        const search = e.target.value;
        if (currentPage === 'ips') {
            loadIPTable(1, '', search);
        } else if (currentPage === 'uris') {
            loadURITable(1, '', search);
        } else if (currentPage === 'files') {
            loadFileTable(1, '', search);
        }
    });

    // Load dashboard on startup
    loadDashboardData();
});
