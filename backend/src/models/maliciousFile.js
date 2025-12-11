import mongoose from 'mongoose';

const maliciousFileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileHash: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  hashType: {
    type: String,
    enum: ['MD5', 'SHA1', 'SHA256'],
    required: true
  },
  fileType: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['DETECTED', 'QUARANTINED', 'BLOCKED', 'MONITORING'],
    required: true
  },
  malwareType: {
    type: String,
    enum: ['TROJAN', 'RANSOMWARE', 'WORM', 'VIRUS', 'SPYWARE', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  detectedAt: {
    type: Date,
    default: Date.now
  },
  quarantinedAt: {
    type: Date
  },
  blockLocation: {
    type: String,
    enum: ['ENDPOINT', 'EMAIL', 'WEB', 'NETWORK', 'UNKNOWN'],
    default: 'UNKNOWN'
  },
  associatedIPs: [{
    type: String,
    lowercase: true
  }],
  associatedURIs: [{
    type: String
  }],
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
maliciousFileSchema.index({ fileHash: 1, createdAt: -1 });
maliciousFileSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('MaliciousFile', maliciousFileSchema);
