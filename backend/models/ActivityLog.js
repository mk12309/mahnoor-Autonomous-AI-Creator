/**
 * Activity Log Mongoose Model
 * 
 * Responsibility:
 * Defines the schema for recording backend events and autonomous pipeline actions.
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    stage: { type: String },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
