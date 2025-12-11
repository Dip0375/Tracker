import { db } from '../server.js';

// Create new IP log entry
export const createIPLog = async (req, res) => {
  try {
    const { ipAddress, status, reason, source, severity, location, notes, actionTakenBy } = req.body;

    if (!ipAddress || !status || !reason || !source) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const ipLogData = {
      ipAddress: ipAddress.toLowerCase(),
      status,
      reason,
      source,
      severity: severity || 'MEDIUM',
      location: location || 'Unknown',
      notes: notes || '',
      actionTakenBy: actionTakenBy || 'System',
      createdAt: new Date(),
      updatedAt: new Date(),
      detectedAt: new Date()
    };

    if (status === 'BLOCKED') {
      ipLogData.blockedAt = new Date();
    } else if (status === 'WHITELIST') {
      ipLogData.whitelistedAt = new Date();
    }

    const docRef = await db.collection('ipLogs').add(ipLogData);

    // Log action history
    await db.collection('actionHistory').add({
      actionType: `IP_${status}`,
      entityType: 'IP',
      entityId: docRef.id,
      entityValue: ipAddress,
      newStatus: status,
      reason,
      performedBy: actionTakenBy || 'System',
      timestamp: new Date()
    });

    res.status(201).json({ success: true, data: { id: docRef.id, ...ipLogData } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all IP logs with optional filtering
export const getIPLogs = async (req, res) => {
  try {
    const { status, search, startDate, endDate, limit = 50, page = 1 } = req.query;
    let query = db.collection('ipLogs');

    if (status) {
      query = query.where('status', '==', status);
    }

    if (startDate || endDate) {
      if (startDate) {
        query = query.where('createdAt', '>=', new Date(startDate));
      }
      if (endDate) {
        query = query.where('createdAt', '<=', new Date(endDate));
      }
    }

    let snapshot = await query.orderBy('createdAt', 'desc').get();
    let ipLogs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!search || data.ipAddress.includes(search.toLowerCase())) {
        ipLogs.push({ id: doc.id, ...data });
      }
    });

    const skip = (page - 1) * limit;
    const paginatedLogs = ipLogs.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total: ipLogs.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(ipLogs.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single IP log
export const getIPLog = async (req, res) => {
  try {
    const doc = await db.collection('ipLogs').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'IP Log not found' });
    }
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update IP log
export const updateIPLog = async (req, res) => {
  try {
    const { status, reason, notes, actionTakenBy } = req.body;
    const docRef = db.collection('ipLogs').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'IP Log not found' });
    }

    const previousStatus = doc.data().status;
    const updateData = { updatedAt: new Date() };

    if (status) {
      updateData.status = status;
      if (status === 'BLOCKED') {
        updateData.blockedAt = new Date();
      } else if (status === 'WHITELIST') {
        updateData.whitelistedAt = new Date();
      }
    }

    if (reason) updateData.reason = reason;
    if (notes) updateData.notes = notes;
    if (actionTakenBy) updateData.actionTakenBy = actionTakenBy;

    await docRef.update(updateData);

    // Log action history
    if (previousStatus !== status) {
      await db.collection('actionHistory').add({
        actionType: 'IP_UPDATED',
        entityType: 'IP',
        entityId: req.params.id,
        entityValue: doc.data().ipAddress,
        previousStatus,
        newStatus: status,
        reason,
        performedBy: actionTakenBy || 'System',
        timestamp: new Date()
      });
    }

    const updated = await docRef.get();
    res.json({ success: true, data: { id: updated.id, ...updated.data() } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete IP log
export const deleteIPLog = async (req, res) => {
  try {
    await db.collection('ipLogs').doc(req.params.id).delete();
    res.json({ success: true, message: 'IP Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get IP statistics
export const getIPStats = async (req, res) => {
  try {
    const { timeframe } = req.query;
    let dateFilter = {};

    if (timeframe) {
      const now = new Date();
      const timeframeMs = parseTimeframe(timeframe);
      dateFilter.$gte = new Date(now - timeframeMs);
    }

    let query = db.collection('ipLogs');
    if (timeframe) {
      query = query.where('createdAt', '>=', dateFilter.$gte);
    }

    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => doc.data());

    const totalIPs = logs.length;
    const blockedIPs = logs.filter(log => log.status === 'BLOCKED').length;
    const whitelistIPs = logs.filter(log => log.status === 'WHITELIST').length;
    const suspiciousIPs = logs.filter(log => log.status === 'SUSPICIOUS').length;
    const monitoringIPs = logs.filter(log => log.status === 'MONITORING').length;

    // Severity breakdown
    const bySeverity = {};
    logs.forEach(log => {
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
    });

    // Source breakdown
    const bySource = {};
    logs.forEach(log => {
      bySource[log.source] = (bySource[log.source] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalIPs,
        blockedIPs,
        whitelistIPs,
        suspiciousIPs,
        monitoringIPs,
        bySeverity: Object.entries(bySeverity).map(([key, value]) => ({ severity: key, count: value })),
        bySource: Object.entries(bySource).map(([key, value]) => ({ source: key, count: value })),
        timeframe
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search IP address
export const searchIP = async (req, res) => {
  try {
    const { ip } = req.query;
    if (!ip) {
      return res.status(400).json({ success: false, message: 'IP address is required' });
    }

    const snapshot = await db.collection('ipLogs')
      .where('ipAddress', '==', ip.toLowerCase())
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: 'IP not found' });
    }

    const doc = snapshot.docs[0];
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function parseTimeframe(timeframe) {
  const times = {
    '1h': 1 * 60 * 60 * 1000,
    '3h': 3 * 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '1d': 1 * 24 * 60 * 60 * 1000,
    '2d': 2 * 24 * 60 * 60 * 1000,
    '5d': 5 * 24 * 60 * 60 * 1000,
    '12d': 12 * 24 * 60 * 60 * 1000
  };
  return times[timeframe] || times['24h'];
}
