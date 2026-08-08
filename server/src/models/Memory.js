const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    topicFingerprint: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast dedup lookups
memorySchema.index({ topicFingerprint: 1 });
memorySchema.index({ keywords: 1 });

module.exports = mongoose.model('Memory', memorySchema);
