import mongoose from 'mongoose';

const actionHistorySchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: ['IP_CREATED', 'IP_BLOCKED', 'IP_WHITELIST', 'IP_UPDATED', 'URI_CREATED', 'URI_BLOCKED', 'FILE_DETECTED', 'FILE_QUARANTINED'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['IP', 'URI', 'FILE'],
    required: true
  },
  entityId: {
    type: String,
    required: true
  },
  entityValue: {
    type: String,
    required: true
  },
  previousStatus: {
    type: String
  },
  newStatus: {
    type: String
  },
  reason: {
    type: String
  },
  performedBy: {
    type: String,
    default: 'System'
  },
  ipAddress: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.model('ActionHistory', actionHistorySchema);
