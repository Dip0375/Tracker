import mongoose from 'mongoose';

const uriLogSchema = new mongoose.Schema({
  uri: {
    type: String,
    required: true,
    trim: true
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
  associatedIPs: [{
    type: String,
    lowercase: true
  }],
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  threatType: {
    type: String,
    enum: ['MALWARE', 'PHISHING', 'C2', 'EXFILTRATION', 'UNKNOWN'],
    default: 'UNKNOWN'
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
uriLogSchema.index({ uri: 1, createdAt: -1 });
uriLogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('URILog', uriLogSchema);
