/**
 * Topic Mongoose Model
 * 
 * Responsibility:
 * Defines the MongoDB schema for discovered AI/Tech topics.
 * Stores discovery metadata, scoring, and status lifecycle.
 */

const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    source: { type: String, default: 'RSS Feed' },
    sourceUrl: { type: String, default: '' },
    relevanceScore: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['discovered', 'evaluated', 'accepted', 'rejected', 'used'], 
      default: 'discovered' 
    },
    tags: [{ type: String }],
    discoveredAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Topic', topicSchema);
