const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    content: {
      type: String,
      required: true,
    },
    hashtags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'queued', 'approved', 'published', 'rejected'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
    },
    linkedinPostId: {
      type: String,
    },
    generationMeta: {
      model: { type: String, default: '' },
      promptVersion: { type: String, default: 'v1' },
      tokensUsed: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ topicId: 1 });

module.exports = mongoose.model('Post', postSchema);
