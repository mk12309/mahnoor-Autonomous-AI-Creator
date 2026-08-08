const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['discovery', 'evaluation', 'generation', 'publish', 'pipeline', 'error', 'system'],
      required: true,
    },
    stage: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// TTL index — auto-delete logs older than 30 days
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });
activityLogSchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
