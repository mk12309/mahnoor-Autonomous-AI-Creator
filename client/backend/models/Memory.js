/**
 * Memory Mongoose Model
 * 
 * Responsibility:
 * Stores persistent memory state for SignalForge AI persona, including:
 * - Previous published topics
 * - Previous opinions
 * - Previously rejected topics
 * - Writing style guidelines
 * - Publishing history
 */

const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ['published_topic', 'opinion', 'rejected_topic', 'writing_style', 'publishing_history'],
      required: true 
    },
    topicTitle: { type: String },
    summaryOrContent: { type: String, required: true },
    reasoningOrTone: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Memory', memorySchema);
