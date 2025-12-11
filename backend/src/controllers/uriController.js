import { db } from '../server.js';

// Create new URI log entry
export const createURILog = async (req, res) => {
  try {
    const { uri, status, reason, associatedIPs, severity, threatType, notes, actionTakenBy } = req.body;

    if (!uri || !status || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const uriLogData = {
      uri,
      status,
      reason,
      associatedIPs: associatedIPs || [],
      severity: severity || 'MEDIUM',
      threatType: threatType || 'UNKNOWN',
      notes: notes || '',
      actionTakenBy: actionTakenBy || 'System',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (status === 'BLOCKED') {
      uriLogData.blockedAt = new Date();
    } else if (status === 'WHITELIST') {
      uriLogData.whitelistedAt = new Date();
    }

    const docRef = await db.collection('uriLogs').add(uriLogData);

    // Log action history
    await db.collection('actionHistory').add({
      actionType: `URI_${status}`,
      entityType: 'URI',
      entityId: docRef.id,
      entityValue: uri,
      newStatus: status,
      reason,
      performedBy: actionTakenBy || 'System',
      timestamp: new Date()
    });

    res.status(201).json({ success: true, data: { id: docRef.id, ...uriLogData } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all URI logs with optional filtering
export const getURILogs = async (req, res) => {
  try {
    const { status, search, startDate, endDate, limit = 50, page = 1 } = req.query;
    let query = db.collection('uriLogs');

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
    let uriLogs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!search || data.uri.includes(search)) {
        uriLogs.push({ id: doc.id, ...data });
      }
    });

    const skip = (page - 1) * limit;
    const paginatedLogs = uriLogs.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total: uriLogs.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(uriLogs.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single URI log
export const getURILog = async (req, res) => {
  try {
    const doc = await db.collection('uriLogs').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'URI Log not found' });
    }
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update URI log
export const updateURILog = async (req, res) => {
  try {
    const { status, reason, notes, actionTakenBy } = req.body;
    const docRef = db.collection('uriLogs').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'URI Log not found' });
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
        actionType: 'URI_UPDATED',
        entityType: 'URI',
        entityId: req.params.id,
        entityValue: doc.data().uri,
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

// Delete URI log
export const deleteURILog = async (req, res) => {
  try {
    await db.collection('uriLogs').doc(req.params.id).delete();
    res.json({ success: true, message: 'URI Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get URI statistics
export const getURIStats = async (req, res) => {
  try {
    const { timeframe } = req.query;
    let query = db.collection('uriLogs');

    if (timeframe) {
      const now = new Date();
      const timeframeMs = parseTimeframe(timeframe);
      query = query.where('createdAt', '>=', new Date(now - timeframeMs));
    }

    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => doc.data());

    const totalURIs = logs.length;
    const blockedURIs = logs.filter(log => log.status === 'BLOCKED').length;
    const whitelistURIs = logs.filter(log => log.status === 'WHITELIST').length;

    // Threat type breakdown
    const byThreatType = {};
    logs.forEach(log => {
      byThreatType[log.threatType] = (byThreatType[log.threatType] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalURIs,
        blockedURIs,
        whitelistURIs,
        byThreatType: Object.entries(byThreatType).map(([key, value]) => ({ threatType: key, count: value })),
        timeframe
      }
    });
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
