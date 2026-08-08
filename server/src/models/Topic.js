const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['rss', 'newsapi', 'devto', 'hackernews', 'techcrunch', 'hnrss', 'manual'],
      default: 'rss',
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    relevanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ['discovered', 'evaluated', 'accepted', 'rejected', 'used'],
      default: 'discovered',
    },
    tags: {
      type: [String],
      default: [],
    },
    discoveredAt: {
      type: Date,
      default: Date.now,
    },
    evaluatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookups
topicSchema.index({ status: 1, relevanceScore: -1 });
topicSchema.index({ sourceUrl: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Topic', topicSchema);
