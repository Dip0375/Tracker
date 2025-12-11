import { db } from '../server.js';

// Create new malicious file entry
export const createMaliciousFile = async (req, res) => {
  try {
    const { fileName, fileHash, hashType, fileType, status, malwareType, severity, blockLocation, associatedIPs, associatedURIs, notes, actionTakenBy } = req.body;

    if (!fileName || !fileHash || !hashType || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const fileData = {
      fileName,
      fileHash: fileHash.toUpperCase(),
      hashType,
      fileType: fileType || '',
      status,
      malwareType: malwareType || 'UNKNOWN',
      severity: severity || 'MEDIUM',
      blockLocation: blockLocation || 'UNKNOWN',
      associatedIPs: associatedIPs || [],
      associatedURIs: associatedURIs || [],
      notes: notes || '',
      actionTakenBy: actionTakenBy || 'System',
      createdAt: new Date(),
      updatedAt: new Date(),
      detectedAt: new Date()
    };

    if (status === 'QUARANTINED') {
      fileData.quarantinedAt = new Date();
    }

    const docRef = await db.collection('maliciousFiles').add(fileData);

    // Log action history
    await db.collection('actionHistory').add({
      actionType: `FILE_${status === 'QUARANTINED' ? 'QUARANTINED' : 'DETECTED'}`,
      entityType: 'FILE',
      entityId: docRef.id,
      entityValue: fileHash,
      newStatus: status,
      reason: `${malwareType} - ${notes}`,
      performedBy: actionTakenBy || 'System',
      timestamp: new Date()
    });

    res.status(201).json({ success: true, data: { id: docRef.id, ...fileData } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all malicious files with optional filtering
export const getMaliciousFiles = async (req, res) => {
  try {
    const { status, search, startDate, endDate, limit = 50, page = 1 } = req.query;
    let query = db.collection('maliciousFiles');

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
    let files = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!search || data.fileHash.includes(search.toUpperCase()) || data.fileName.includes(search)) {
        files.push({ id: doc.id, ...data });
      }
    });

    const skip = (page - 1) * limit;
    const paginatedFiles = files.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedFiles,
      pagination: {
        total: files.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(files.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single malicious file
export const getMaliciousFile = async (req, res) => {
  try {
    const doc = await db.collection('maliciousFiles').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update malicious file
export const updateMaliciousFile = async (req, res) => {
  try {
    const { status, notes, actionTakenBy } = req.body;
    const docRef = db.collection('maliciousFiles').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const previousStatus = doc.data().status;
    const updateData = { updatedAt: new Date() };

    if (status) {
      updateData.status = status;
      if (status === 'QUARANTINED') {
        updateData.quarantinedAt = new Date();
      }
    }

    if (notes) updateData.notes = notes;
    if (actionTakenBy) updateData.actionTakenBy = actionTakenBy;

    await docRef.update(updateData);

    // Log action history
    if (previousStatus !== status) {
      await db.collection('actionHistory').add({
        actionType: 'FILE_UPDATED',
        entityType: 'FILE',
        entityId: req.params.id,
        entityValue: doc.data().fileHash,
        previousStatus,
        newStatus: status,
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

// Delete malicious file
export const deleteMaliciousFile = async (req, res) => {
  try {
    await db.collection('maliciousFiles').doc(req.params.id).delete();
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get file statistics
export const getFileStats = async (req, res) => {
  try {
    const { timeframe } = req.query;
    let query = db.collection('maliciousFiles');

    if (timeframe) {
      const now = new Date();
      const timeframeMs = parseTimeframe(timeframe);
      query = query.where('createdAt', '>=', new Date(now - timeframeMs));
    }

    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => doc.data());

    const totalFiles = logs.length;
    const quarantinedFiles = logs.filter(log => log.status === 'QUARANTINED').length;
    const blockedFiles = logs.filter(log => log.status === 'BLOCKED').length;

    // Malware type breakdown
    const byMalwareType = {};
    logs.forEach(log => {
      byMalwareType[log.malwareType] = (byMalwareType[log.malwareType] || 0) + 1;
    });

    // Block location breakdown
    const byLocation = {};
    logs.forEach(log => {
      byLocation[log.blockLocation] = (byLocation[log.blockLocation] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalFiles,
        quarantinedFiles,
        blockedFiles,
        byMalwareType: Object.entries(byMalwareType).map(([key, value]) => ({ malwareType: key, count: value })),
        byLocation: Object.entries(byLocation).map(([key, value]) => ({ location: key, count: value })),
        timeframe
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search by file hash
export const searchFileByHash = async (req, res) => {
  try {
    const { hash } = req.query;
    if (!hash) {
      return res.status(400).json({ success: false, message: 'File hash is required' });
    }

    const snapshot = await db.collection('maliciousFiles')
      .where('fileHash', '==', hash.toUpperCase())
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: 'File not found' });
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
