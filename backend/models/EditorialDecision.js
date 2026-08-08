/**
 * Editorial Decision Mongoose Model
 * 
 * Responsibility:
 * Stores autonomous decision logs for every publishing cycle, recording:
 * - Discovered topics count and details
 * - Rejected topics and rejection reasons with score breakdowns
 * - Selected topic and final score breakdown
 * - Cycle publishing timestamp
 */

const mongoose = require('mongoose');

const editorialDecisionSchema = new mongoose.Schema(
  {
    cycleId: { type: String, required: true },
    discoveredCount: { type: Number, default: 0 },
    discoveredTopics: [
      {
        title: { type: String },
        sourceUrl: { type: String },
        source: { type: String },
      }
    ],
    rejectedTopics: [
      {
        topicTitle: { type: String },
        sourceUrl: { type: String },
        reason: { type: String },
        finalScore: { type: Number },
        scoreBreakdown: { type: mongoose.Schema.Types.Mixed },
      }
    ],
    selectedTopic: {
      title: { type: String },
      sourceUrl: { type: String },
      finalScore: { type: Number },
      scoreBreakdown: { type: mongoose.Schema.Types.Mixed },
    },
    finalScore: { type: Number },
    publishingTimestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EditorialDecision', editorialDecisionSchema);
