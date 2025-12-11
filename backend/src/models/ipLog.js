import mongoose from 'mongoose';

const ipLogSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['BLOCKED', 'WHITELIST', 'SUSPICIOUS', 'MONITORING'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['WAF', 'FIREWALL', 'IDS', 'SOC_ANALYST'],
    required: true
  },
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  location: {
    type: String,
    default: 'Unknown'
  },
  detectedAt: {
    type: Date,
    default: Date.now
  },
  blockedAt: {
    type: Date
  },
  whitelistedAt: {
    type: Date
  },
  notes: {
    type: String
  },
  actionTakenBy: {
    type: String,
    default: 'System'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
ipLogSchema.index({ ipAddress: 1, createdAt: -1 });
ipLogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('IPLog', ipLogSchema);
